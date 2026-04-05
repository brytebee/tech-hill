import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { paymentService } from "@/lib/payment/service";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get("x-paystack-signature");
    
    if (!signature) {
      return NextResponse.json({ message: "No signature provided" }, { status: 400 });
    }

    // Read the raw body as text
    const rawBody = await req.text();

    // Verify HMAC signature and parse event
    const eventResult = await paymentService.handleWebhook(signature, rawBody);
    
    const { type, data } = eventResult;

    if (type === "CHARGE_SUCCESS") {
      const reference = data.reference;

      // Find the transaction
      const transaction = await prisma.transaction.findUnique({
        where: { reference },
        include: { user: { include: { referralused: true } } },
      });

      if (!transaction) {
        // We log and return 200 so Paystack stops retrying
        logger.warn("webhooks:paystack", `Webhook: Transaction ${reference} not found in DB.`);
        return NextResponse.json({ received: true });
      }

      if (transaction.status === "SUCCESS") {
        // Already processed via callback
        return NextResponse.json({ received: true });
      }

      // Process success
      await prisma.$transaction(async (tx) => {
        // Update Transaction
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: "SUCCESS",
            metadata: data.metadata || transaction.metadata || undefined,
          },
        });

        // Create/Update Subscription or Course Access
        const metadata = (data.metadata || transaction.metadata) as Record<string, any>;
        const planId = metadata?.planId;
        const courseId = metadata?.courseId || transaction.courseId;

        if (planId) {
          const plan = await tx.plan.findUnique({ where: { id: planId } });
          if (plan) {
            const startDate = new Date();
            const endDate = new Date(startDate);
            if (plan.interval === "MONTHLY") endDate.setMonth(endDate.getMonth() + 1);
            else if (plan.interval === "YEARLY") endDate.setFullYear(endDate.getFullYear() + 1);

            await tx.subscription.create({
              data: {
                userId: transaction.userId,
                planId: plan.id,
                status: "ACTIVE",
                startDate,
                endDate,
                provider: "PAYSTACK",
                providerSubId: data.authorization?.authorization_code,
              },
            });
          }
        }

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

        // Referral Bonus (5%)
        const referral = await tx.referral.findUnique({
          where: { referredUserId: transaction.userId },
        });

        if (referral && !referral.rewardPaid) {
          const bonusAmount = Number(transaction.amount) * 0.05;

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
              description: `5% bonus from subscription`,
              referenceId: transaction.userId,
            },
          });

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

    } else if (type === "PAYMENT_FAILED") {
      const reference = data.reference;
      await prisma.transaction.updateMany({
        where: { reference, status: "PENDING" },
        data: { status: "FAILED", metadata: data.metadata || undefined },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    logger.error("webhooks:paystack", "Webhook Error:", error.message);
    // Return 400 for bad signatures so Paystack knows it failed
    if (error.message.includes("signature")) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
