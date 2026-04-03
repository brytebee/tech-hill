import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { paymentService } from "@/lib/payment/service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  try {
    // 1. Verify with Provider
    const verification = await paymentService.verifyTransaction(reference);

    if (!verification.success) {
      return NextResponse.redirect(new URL("/payment/failed", req.url));
    }

    // 2. Find Pending Transaction
    const transaction = (await prisma.transaction.findUnique({
      where: { reference },
      include: { user: { include: { referralused: true } } },
    })) as any;

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    if (transaction.status === "SUCCESS") {
      // Already processed
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // 3. Process Success
    await prisma.$transaction(async (tx) => {
      // Update Transaction
      await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "SUCCESS",
          metadata: verification.metadata || undefined,
        },
      });

      // Create/Update Subscription or Course Access
      const metadata = transaction.metadata as any;
      const planId = metadata?.planId;
      const courseId = metadata?.courseId || transaction.courseId;

      if (planId) {
        // Calculate end date based on plan interval
        const plan = await tx.plan.findUnique({ where: { id: planId } });
        if (plan) {
          const startDate = new Date();
          const endDate = new Date(startDate);
          if (plan.interval === "MONTHLY")
            endDate.setMonth(endDate.getMonth() + 1);
          else if (plan.interval === "YEARLY")
            endDate.setFullYear(endDate.getFullYear() + 1);

          await tx.subscription.create({
            data: {
              userId: transaction.userId,
              planId: plan.id,
              status: "ACTIVE",
              startDate,
              endDate,
              provider: "PAYSTACK",
              providerSubId: verification.authorization_code, // store auth code for recurring
            },
          });
        }
      }

      // Handle Course Purchase
      if (courseId && transaction.type === "COURSE_PURCHASE") {
        await tx.enrollment.upsert({
          where: {
            userId_courseId: {
              userId: transaction.userId,
              courseId: courseId,
            },
          },
          update: { status: "ACTIVE" },
          create: {
            userId: transaction.userId,
            courseId: courseId,
            status: "ACTIVE",
          },
        });
      }

      // 4. Referral Bonus (5%)
      // Check if user was referred
      const referral = await tx.referral.findUnique({
        where: { referredUserId: transaction.userId },
      });

      if (referral && !referral.rewardPaid) {
        const bonusAmount = Number(transaction.amount) * 0.05; // 5%

        // Create Wallet Transaction for Referrer
        // First check if wallet exists, if not create
        let referrerWallet = await tx.wallet.findUnique({
          where: { userId: referral.referrerId },
        });
        if (!referrerWallet) {
          referrerWallet = await tx.wallet.create({
            data: { userId: referral.referrerId },
          });
        }

        await tx.wallet.update({
          where: { id: referrerWallet.id },
          data: { balance: { increment: bonusAmount } },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: referrerWallet.id,
            amount: bonusAmount,
            type: "REFERRAL_BONUS",
            description: `5% bonus from ${transaction.user.email} subscription`,
            referenceId: transaction.userId,
          },
        });

        // Mark referral as paid
        await tx.referral.update({
          where: { id: referral.id },
          data: {
            rewardPaid: true,
            rewardAmount: bonusAmount,
            paidAt: new Date(),
            status: "COMPLETED",
          },
        });
      }
    });

    return NextResponse.redirect(
      new URL("/dashboard?payment=success", req.url),
    );
  } catch (error: any) {
    console.error("Payment Verification Error:", error);
    return NextResponse.redirect(new URL("/payment/error", req.url));
  }
}
