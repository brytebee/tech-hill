import { Transaction, Subscription, Plan, User } from "@prisma/client";

export type PaymentProvider = "PAYSTACK" | "FLUTTERWAVE" | "STRIPE";

export interface InitializePaymentParams {
  email: string;
  amount: number;
  currency: string;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
  planCode?: string; // For subscriptions
}

export interface VerifyPaymentResponse {
  success: boolean;
  reference: string;
  amount: number;
  currency: string;
  status: string;
  transactionDate: Date;
  metadata?: any;
  gatewayResponse?: string;
  authorization_code?: string; // Token for recurring billing
}

export interface IPaymentService {
  /**
   * Initialize a transaction (One-time or Subscription first charge)
   */
  initializeTransaction(
    params: InitializePaymentParams
  ): Promise<{
    authorizationUrl: string;
    reference: string;
    accessCode?: string;
  }>;

  /**
   * Verify a transaction after callback
   */
  verifyTransaction(reference: string): Promise<VerifyPaymentResponse>;

  /**
   * Create a recurring subscription plan on the provider
   */
  createPlan(
    name: string,
    amount: number,
    interval: "monthly" | "yearly" | "quarterly"
  ): Promise<{ planCode: string; id: string }>;

  /**
   * Handle Webhook events.
   * Accepts rawBody as a string so HMAC can be computed on the exact bytes
   * that Paystack signed — parsing first would change the byte sequence.
   */
  handleWebhook(
    signature: string,
    rawBody: string
  ): Promise<{
    type:
      | "CHARGE_SUCCESS"
      | "PAYMENT_FAILED"
      | "SUBSCRIPTION_CREATED"
      | "SUBSCRIPTION_CANCELLED"
      | "UNKNOWN";
    data: any;
    event: string;
  }>;
}
