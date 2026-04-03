import { PublicHeader } from "@/components/layout/PublicHeader";

export default function PrivacyPage() {
  return (
    <div className="dark min-h-screen bg-[#080e1a] text-white selection:bg-blue-500/30 antialiased">
      <PublicHeader />

      <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>
        <div className="prose prose-invert prose-slate max-w-none space-y-8 text-slate-400">
          <section>
            <h2 className="text-xl font-bold text-white mb-4">1. Data Collection</h2>
            <p>We collect information you provide directly to us (name, email, profile details) and automated data such as your IP address, browser type, and device fingerprinting to ensure platform security and session integrity (one-device rule).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">2. Use of Information</h2>
            <p>Your data is used to personalize your learning experience, track progress, process payments, and communicate important platform updates. We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">3. Security</h2>
            <p>We implement industry-standard security measures to protect your data. Payment information is securely handled by our PCI-compliant payment processors (Paystack/Stripe) and never stored on our servers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">4. Cookies</h2>
            <p>We use cookies to maintain your session and remember your preferences. You can disable cookies in your browser, but some features of the platform may not function correctly.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">5. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@techhill.io.</p>
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
