"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Fingerprint, Smartphone, AlertCircle, CheckCircle2, Trash2 } from "lucide-react";
import { startRegistration } from "@simplewebauthn/browser";
import { useLoader } from "@/hooks/use-loader";

interface StoredPasskey {
  id: string;
  deviceType: string;
  backedUp: boolean;
  createdAt: string;
}

interface PasskeySettingsProps {
  /** The base settings path for this role, e.g. "/admin/settings" */
  settingsPath: string;
}

export function PasskeySettings({ settingsPath }: PasskeySettingsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passkeys, setPasskeys] = useState<StoredPasskey[]>([]);
  const { showLoader, hideLoader } = useLoader();

  const fetchPasskeys = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/passkeys/list");
      if (res.ok) {
        const data = await res.json();
        setPasskeys(data.passkeys || []);
      }
    } catch {
      // non-critical: silently ignore
    }
  }, []);

  const handleAddPasskey = useCallback(async () => {
    setIsLoading(true);
    setError("");
    setSuccess(false);
    showLoader("Preparing secure device registration...");

    try {
      const optionsRes = await fetch("/api/auth/passkeys/register/options");
      if (!optionsRes.ok) throw new Error("Failed to initialize registration");

      const options = await optionsRes.json();
      hideLoader();

      let authResponse;
      try {
        authResponse = await startRegistration({ optionsJSON: options });
      } catch (e: any) {
        if (e.name === "NotAllowedError") throw new Error("Registration was cancelled.");
        throw new Error("Your browser or device does not support Passkeys.");
      }

      showLoader("Verifying secure cryptographic signature...");

      const verifyRes = await fetch("/api/auth/passkeys/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authResponse),
      });

      if (!verifyRes.ok) throw new Error("Verification failed. Please try again.");

      setSuccess(true);
      router.replace(settingsPath, { scroll: false });
      await fetchPasskeys();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
      hideLoader();
    }
  }, [router, settingsPath, showLoader, hideLoader, fetchPasskeys]);

  useEffect(() => {
    fetchPasskeys();
    if (searchParams.get("setup") === "passkey") {
      const timer = setTimeout(() => handleAddPasskey(), 800);
      return () => clearTimeout(timer);
    }
  }, [searchParams, handleAddPasskey, fetchPasskeys]);

  const handleDelete = async (passkeyId: string) => {
    try {
      await fetch(`/api/auth/passkeys/${passkeyId}`, { method: "DELETE" });
      setPasskeys((prev) => prev.filter((p) => p.id !== passkeyId));
    } catch {
      setError("Failed to remove passkey.");
    }
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 p-2 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
            <Fingerprint className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Biometric Passkeys</CardTitle>
            <CardDescription className="mt-1">
              Sign in instantly with FaceID, TouchID, or Windows Hello — no password needed.
            </CardDescription>
          </div>
        </div>
      </div>

      <CardContent className="p-6 space-y-5">
        {/* Auto-setup nudge banner */}
        {searchParams.get("setup") === "passkey" && !success && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-900/40 animate-in fade-in slide-in-from-top-2 duration-500">
            <Fingerprint className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Set up faster sign-in</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                We're launching your device's Passkey setup. Follow the prompt above.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 text-sm text-red-600 bg-red-50 p-4 border border-red-100 rounded-lg dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 text-sm text-emerald-600 bg-emerald-50 p-4 border border-emerald-100 rounded-lg dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Passkey registered! You can now sign in with FaceID or TouchID.
          </div>
        )}

        {/* Registered devices list */}
        {passkeys.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Registered Devices</p>
            {passkeys.map((passkey, i) => (
              <div
                key={passkey.id}
                className="flex items-center justify-between p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      Device {i + 1}{" "}
                      <span className="text-xs font-normal text-slate-400 ml-1">
                        ({passkey.deviceType === "singleDevice" ? "This device only" : "Synced across devices"})
                      </span>
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Added{" "}
                      {new Date(passkey.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(passkey.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                  title="Remove passkey"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new passkey CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-6 justify-between bg-slate-50 dark:bg-slate-900/50 p-5 rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 bg-blue-100 dark:bg-blue-900/30 p-2.5 rounded-full text-blue-700 dark:text-blue-400 shrink-0">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-semibold text-slate-900 dark:text-white">
                Register {passkeys.length > 0 ? "Another" : "This"} Device
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Add this device so you can skip your password entirely on your next sign-in.
              </p>
            </div>
          </div>
          <Button
            onClick={handleAddPasskey}
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[140px] shrink-0 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 font-semibold"
          >
            <Fingerprint className="h-4 w-4 mr-2" />
            Add Passkey
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
