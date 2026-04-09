import { PaystackService } from "./paystack";
import { IPaymentService, PaymentProvider } from "./types";

class PaymentFactory {
  private static instance: IPaymentService;

  static getService(provider: PaymentProvider = "PAYSTACK"): IPaymentService {
    if (this.instance) return this.instance;

    switch (provider) {
      case "PAYSTACK":
        this.instance = new PaystackService();
        break;
      // Future: case 'STRIPE': ...
      default:
        this.instance = new PaystackService();
    }

    return this.instance;
  }
}

export const paymentService = PaymentFactory.getService();
