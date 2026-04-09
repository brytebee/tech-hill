"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, AlertCircle, Fingerprint, ArrowLeft, MonitorSmartphone, ShieldAlert } from "lucide-react";
import { isValidEmail } from "@/lib/utils";
import { useLoader } from "@/hooks/use-loader";
import { startAuthentication } from "@simplewebauthn/browser";

interface LoginFormProps {
  className?: string;
}

export function LoginForm({ className }: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [hasPasskey, setHasPasskey] = useState(false);
  const [passkeyOptions, setPasskeyOptions] = useState<any>(null);
  const [confirmedOverride, setConfirmedOverride] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const { showLoader, hideLoader } = useLoader();

  const from = searchParams.get("redirect") || searchParams.get("from") || "/dashboard";

  const handleStepOneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!formData.email) {
      setErrors({ email: "Email is required" });
      return;
    } else if (!isValidEmail(formData.email)) {
      setErrors({ email: "Please enter a valid email address" });
      return;
    }

    setIsLoading(true);

    try {
      // Step 1a: silently check for an active session on another device.
      // This never blocks — if it fails for any reason we fall through.
      if (!confirmedOverride) {
        const checkRes = await fetch("/api/auth/check-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email.toLowerCase().trim() }),
        });
        if (checkRes.ok) {
          const { hasActiveSession } = await checkRes.json();
          if (hasActiveSession) {
            // Surface the interstitial on Step 3 instead of proceeding
            setIsLoading(false);
            setStep(3);
            return;
          }
        }
      }

      // Step 1b: check for passkey registration
      const res = await fetch("/api/auth/passkeys/login/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.toLowerCase().trim() }),
      });

      setStep(2);

      if (res.ok) {
        const options = await res.json();
        setHasPasskey(true);
        setPasskeyOptions(options);
        await handlePasskeyLogin(options);
      } else {
        setHasPasskey(false);
        setPasskeyOptions(null);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to check passkey status:", error);
      setStep(2);
      setIsLoading(false);
    }
  };

  // Called when Device B confirms they want to override the existing session
  const handleContinueAnyway = async () => {
    setConfirmedOverride(true);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/passkeys/login/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email.toLowerCase().trim() }),
      });

      setStep(2);

      if (res.ok) {
        const options = await res.json();
        setHasPasskey(true);
        setPasskeyOptions(options);
        await handlePasskeyLogin(options);
      } else {
        setHasPasskey(false);
        setPasskeyOptions(null);
        setIsLoading(false);
      }
    } catch {
      setStep(2);
      setIsLoading(false);
    }
  };

  const handlePasskeyLogin = async (options: any) => {
    setIsLoading(true);
    setGeneralError("");
    showLoader("Authenticating via Passkey...");
    
    let isRedirecting = false;

    try {
      const authResp = await startAuthentication({ optionsJSON: options });
      
      const result = await signIn("passkey", {
        email: formData.email.toLowerCase().trim(),
        response: JSON.stringify(authResp),
        redirect: false,
      });

      if (result?.error) {
        setGeneralError(result.error);
      } else if (result?.ok) {
        // Redirect back to where they came from; passkey is already set up
        const safeFrom = from.startsWith("/") && !from.includes("setup=passkey") ? from : "/dashboard";
        isRedirecting = true;
        window.location.href = safeFrom;
      }
    } catch (error: any) {
      // User cancelled or failed biometric
      console.error("Biometric aborted", error);
      if (error.name !== "NotAllowedError") {
        setGeneralError("Biometric login failed. Please try again or use your password.");
      }
    } finally {
      if (!isRedirecting) {
        setIsLoading(false);
        hideLoader();
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!formData.password) {
      setErrors({ password: "Password is required" });
      return;
    }

    setIsLoading(true);
    showLoader("Signing you in...");
    
    let isRedirecting = false;

    try {
      const result = await signIn("credentials", {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setGeneralError(result.error);
      } else if (result?.ok) {
        // Fetch session to determine actual user role
        const session = await getSession();
        const role = session?.user?.role?.toLowerCase() || "student";

        // Only nudge to passkey setup once per device (avoid redirect loops)
        const nudgeKey = `passkey_nudge_${session?.user?.id || "unknown"}`;
        const alreadyNudged = localStorage.getItem(nudgeKey);
        const comingFromSetup = from.includes("setup=passkey");

        isRedirecting = true;

        if (!hasPasskey && !alreadyNudged && !comingFromSetup) {
          localStorage.setItem(nudgeKey, "1");
          window.location.href = `/${role}/settings?setup=passkey`;
        } else {
          // Go to their original destination (or dashboard if it was the settings loop)
          const safeFrom = from.startsWith("/") && !comingFromSetup ? from : "/dashboard";
          window.location.href = safeFrom;
        }
      }
    } catch (error: any) {
      setGeneralError("An unexpected error occurred. Please try again.");
    } finally {
      if (!isRedirecting) {
        setIsLoading(false);
        hideLoader();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (generalError) setGeneralError("");
  };

  return (
    <Card className={`border-0 overflow-hidden ${className}`}>
      <CardContent className="pt-8 sm:px-10">
        
        {step === 1 && (
          <form onSubmit={handleStepOneSubmit} className="space-y-5">
            {generalError && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {generalError}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="name@example.com"
                disabled={isLoading}
                className="h-11 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full h-11 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 transition-all font-semibold mt-2"
              loading={isLoading}
              disabled={isLoading}
            >
              Continue
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handlePasswordSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <button 
              type="button" 
              onClick={() => setStep(1)}
              className="flex items-center text-sm text-slate-500 hover:text-slate-700 font-medium mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </button>

            {generalError && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {generalError}
              </div>
            )}

            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {formData.email}
              </p>
            </div>

            {hasPasskey && (
              <div className="pt-2 pb-4 border-b border-slate-100 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handlePasskeyLogin(passkeyOptions)}
                  disabled={isLoading}
                  className="w-full h-12 border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-400 gap-2 font-semibold shadow-sm"
                >
                  <Fingerprint className="h-5 w-5" />
                  Sign in with Passkey (FaceID / TouchID)
                </Button>
                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200 dark:border-slate-800" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-slate-950 px-2 text-slate-500">Or use password</span></div>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-500"
                  onClick={() => router.push("/forgot-password")}
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="pr-10 h-11 bg-slate-50 dark:bg-slate-950/50"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!hasPasskey && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-900/30">
                <Fingerprint className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  <span className="font-semibold">Sign in faster next time.</span>{" "}
                  After signing in, we'll help you set up FaceID or TouchID in one tap.
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transition-all font-semibold mt-2"
              loading={isLoading}
              disabled={isLoading}
            >
              Sign in
            </Button>
          </form>
        )}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <button
              type="button"
              onClick={() => { setStep(1); setConfirmedOverride(false); }}
              className="flex items-center text-sm text-slate-500 hover:text-slate-700 font-medium mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </button>

            {/* Icon */}
            <div className="flex flex-col items-center text-center pt-2 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center mb-4">
                <MonitorSmartphone className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Active session detected
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                This account is currently signed in on another device. Continuing here will sign that device out immediately.
              </p>
            </div>

            {/* Security note */}
            <div className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
              <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
              <p>
                If you didn't initiate another sign-in recently, your account may be compromised. Consider changing your password after signing in.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Button
                onClick={handleContinueAnyway}
                loading={isLoading}
                disabled={isLoading}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 font-semibold transition-all"
              >
                Continue anyway — sign out other device
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => { setStep(1); setConfirmedOverride(false); }}
                className="w-full h-11 text-slate-600 dark:text-slate-400"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
