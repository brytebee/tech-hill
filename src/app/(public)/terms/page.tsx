import { PublicHeader } from "@/components/layout/PublicHeader";

export default function TermsPage() {
  return (
    <div className="dark min-h-screen bg-[#080e1a] text-white selection:bg-blue-500/30 antialiased">
      <PublicHeader />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-8">Terms of Service</h1>
        <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-400">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing and using the Tech Hill platform, you agree to bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Account Registration</h2>
            <p>Users are responsible for maintaining the confidentiality of their account credentials. You must provide accurate and complete information during registration. Tech Hill reserves the right to suspend or terminate accounts that provide false information.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Payments and Refunds</h2>
            <p>All payments made on the platform are handled via Paystack or Stripe. Pricing is displayed in Nigerian Naira (NGN) or USD where applicable. Certificates and course access are granted upon successful payment confirmation. Due to the digital nature of our content, refunds are generally not provided after content has been accessed.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Intellectual Property</h2>
            <p>All course materials, including videos, code snippets, and documentation, are the intellectual property of Tech Hill or its instructors. They are for your personal, non-commercial use only. Unauthorized distribution or resale is strictly prohibited.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Governing Law</h2>
            <p>These terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.</p>
          </section>

          <p className="pt-8 text-sm italic">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </main>

      <footer className="border-t border-slate-800/80 py-12 bg-slate-950/50 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Tech Hill. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
