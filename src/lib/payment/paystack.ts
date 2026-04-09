import crypto from "crypto";
import {
  IPaymentService,
  InitializePaymentParams,
  VerifyPaymentResponse,
} from "./types";

export class PaystackService implements IPaymentService {
  private readonly baseUrl = "https://api.paystack.co";
  private readonly secretKey: string;

  constructor() {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      console.warn("PAYSTACK_SECRET_KEY is not defined");
    }
    this.secretKey = secretKey || "";
  }

  /**
   * Paystack NGN fee: 1.5% + ₦100 flat, capped at ₦2,000 total.
   *
   * When the customer is responsible for the fee, we inflate the charge so
   * that after Paystack deducts its cut, the merchant still receives `netAmount`.
   *
   * Formula (derived):
   *   grossAmount = (netAmount + 100) / (1 - 0.015)
   *   fee         = grossAmount - netAmount   (capped at ₦2,000)
   *
   * Returns { grossAmount, fee } — both in ₦ (not kobo).
   */
  static calculateFeePassthrough(netAmount: number): {
    grossAmount: number;
    fee: number;
  } {
    // Cap: if the raw 1.5% already exceeds ₦1,900 the total fee is ₦2,000
    const RATE = 0.015;
    const FLAT = 100;     // ₦100
    const MAX_FEE = 2000; // ₦2,000 cap

    // Compute gross needed so merchant receives netAmount exactly
    const rawGross = (netAmount + FLAT) / (1 - RATE);
    const rawFee   = rawGross - netAmount;

    let fee: number;
    let grossAmount: number;

    if (rawFee >= MAX_FEE) {
      // Fee is capped — customer just pays net + ₦2,000
      fee = MAX_FEE;
      grossAmount = netAmount + MAX_FEE;
    } else {
      fee = Math.ceil(rawFee);   // round up to nearest ₦1 (protects merchant)
      grossAmount = netAmount + fee;
    }

    return { grossAmount, fee };
  }

  private async request(endpoint: string, method: string, body?: any) {
    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Paystack API Error: ${response.status} - ${
          error.message || response.statusText
        }`
      );
    }

    return response.json();
  }

  async initializeTransaction(params: InitializePaymentParams) {
    // Paystack expects amount in Kobo (lowest currency unit)
    const amountInKobo = Math.round(params.amount * 100);

    const payload: any = {
      email: params.email,
      amount: amountInKobo,
      currency: params.currency,
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    };

    if (params.planCode) {
      payload.plan = params.planCode;
    }

    const { data } = await this.request(
      "/transaction/initialize",
      "POST",
      payload
    );

    return {
      authorizationUrl: data.authorization_url,
      reference: data.reference,
      accessCode: data.access_code,
    };
  }

  async verifyTransaction(reference: string): Promise<VerifyPaymentResponse> {
    const { data } = await this.request(
      `/transaction/verify/${reference}`,
      "GET"
    );

    return {
      success: data.status === "success",
      reference: data.reference,
      amount: data.amount / 100, // Convert back to main currency unit
      currency: data.currency,
      status: data.status,
      transactionDate: new Date(data.transaction_date),
      metadata: data.metadata,
      gatewayResponse: data.gateway_response,
      authorization_code: data.authorization?.authorization_code,
    };
  }

  async createPlan(
    name: string,
    amount: number,
    interval: "monthly" | "yearly" | "quarterly"
  ) {
    const amountInKobo = Math.round(amount * 100);

    // Map strict interval to Paystack strings if needed
    const intervalMap: Record<string, string> = {
      monthly: "monthly",
      yearly: "annually",
      quarterly: "quarterly",
    };

    const payload = {
      name,
      amount: amountInKobo,
      interval: intervalMap[interval] || "monthly",
    };

    const { data } = await this.request("/plan", "POST", payload);

    return {
      planCode: data.plan_code,
      id: data.id,
    };
  }

  async handleWebhook(signature: string, rawBody: string) {
    // HMAC SHA-512 verification — must run on the raw body string,
    // before any JSON parsing alters the byte sequence.
    const hash = crypto
      .createHmac("sha512", this.secretKey)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      throw new Error("Invalid Paystack webhook signature.");
    }

    const payload = JSON.parse(rawBody);
    const event: string = payload.event;

    if (event === "charge.success") {
      return { type: "CHARGE_SUCCESS" as const, data: payload.data, event };
    } else if (event === "invoice.payment_failed") {
      return { type: "PAYMENT_FAILED" as const, data: payload.data, event };
    } else if (event === "subscription.create") {
      return { type: "SUBSCRIPTION_CREATED" as const, data: payload.data, event };
    } else if (event === "subscription.disable") {
      return { type: "SUBSCRIPTION_CANCELLED" as const, data: payload.data, event };
    }

    return { type: "UNKNOWN" as const, data: payload.data, event };
  }
}
