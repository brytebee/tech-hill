// src/engine/lib/services/emailService.ts

const EMAIL_ENDPOINT = process.env.EMAIL_ENDPOINT || "https://email-engine-alpha.vercel.app/v1/url-verify";
const FROM_EMAIL = process.env.EMAIL_FROM || "noreply@asusu.biz";

export class EmailService {
  /**
   * Sends a verification email to the newly registered user.
   */
  static async sendVerificationEmail({
    to,
    firstName,
    token,
  }: {
    to: string;
    firstName: string;
    token: string;
  }) {
    try {
      // Determine base URL dynamically (for the verification link)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL 
        || process.env.NEXTAUTH_URL 
        || "http://localhost:3000";
        
      const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

      const payload = {
        from: FROM_EMAIL,
        to,
        subject: "Verify your Tech Hill Account",
        firstName,
        product: "Tech Hill",
        logoUrl: `${baseUrl}/favicon.ico`, // Fallback logo
        template: "tech",
        token,
        url: verificationUrl,
      };

      const response = await fetch(EMAIL_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Email API failed:", response.status, errorText);
        throw new Error("Failed to send verification email");
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sending verification email:", error);
      // We don't throw here to avoid failing the entire registration if emails are down.
      // In production, we'd queue it or use real-time retries.
      return { success: false, error };
    }
  }

  /**
   * Stub for Password Reset Email
   */
  static async sendPasswordResetEmail({
    to,
    firstName,
    token,
  }: {
    to: string;
    firstName: string;
    token: string;
  }) {
    // We can reuse the same endpoint with reset flag
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      const payload = {
        from: FROM_EMAIL,
        to,
        subject: "Reset your Tech Hill Password",
        firstName,
        product: "Tech Hill",
        logoUrl: `${baseUrl}/favicon.ico`,
        template: "tech",
        token,
        url: resetUrl,
        reset: true, // Use reset variant if the engine supports it
      };

      await fetch(EMAIL_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error sending reset password email:", error);
    }
  }
}
