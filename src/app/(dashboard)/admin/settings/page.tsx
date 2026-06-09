// app/(dashboard)/admin/settings/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { PasskeySettings } from "@/components/shared/passkey-settings";
import { ProfileSettingsForm } from "@/components/shared/profile-settings-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Bell, Lock, Key, Smartphone, Fingerprint, Activity, Mail, Pencil, Check, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// ─── Notification Settings Card ──────────────────────────────────────────────

function NotificationSettingsCard() {
  const [email, setEmail] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/settings?key=promptReviewEmail")
      .then((r) => r.json())
      .then((d) => setEmail(d.value ?? "brytebee@gmail.com"))
      .catch(() => setEmail("brytebee@gmail.com"));
  }, []);

  const startEdit = () => {
    setDraft(email ?? "");
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraft("");
  };

  const saveEmail = async () => {
    if (!draft.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "promptReviewEmail", value: draft.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setEmail(data.value);
      setIsEditing(false);
      toast.success("Notification email updated successfully");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to save email");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      id="notifications"
      className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060a12]/50 dark:backdrop-blur-xl shadow-lg border border-amber-500/10 overflow-hidden"
    >
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800 pb-6 px-8 pt-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Notification Settings
            </CardTitle>
            <CardDescription className="text-xs">
              Configure who receives platform alert emails
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-6">
        {/* Prompt Review Recipient */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-slate-400" />
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
              Prompt Review Recipient
            </p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
            When a student submits a project for review, a notification email is sent to this address.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {isEditing ? (
              <>
                <input
                  ref={inputRef}
                  type="email"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEmail();
                    if (e.key === "Escape") cancelEdit();
                  }}
                  className="flex-1 h-11 rounded-xl border border-amber-400/60 dark:border-amber-500/40 bg-white dark:bg-slate-900 px-4 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition"
                  placeholder="admin@example.com"
                  id="promptReviewEmail"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveEmail}
                    disabled={isSaving || !draft.trim()}
                    id="savePromptReviewEmail"
                    className="h-11 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    id="cancelPromptReviewEmail"
                    className="h-11 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-4 flex items-center">
                  {email === null ? (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-xs">Loading…</span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {email}
                    </span>
                  )}
                </div>
                <button
                  onClick={startEdit}
                  disabled={email === null}
                  id="editPromptReviewEmail"
                  className="h-11 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest transition-colors shrink-0 flex items-center gap-2 disabled:opacity-50"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
              </div>
            )}
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed">
            Defaults to <span className="font-semibold text-slate-500">brytebee@gmail.com</span> if not configured.
            This value is stored in the platform database and persists across deployments.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────

function NavItem({
  icon,
  label,
  sublabel,
  active,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  active?: boolean;
  href?: string;
}) {
  const baseClass =
    "rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all";
  const activeClass =
    "bg-white dark:bg-slate-900/80 border border-blue-500 shadow-sm shadow-blue-500/20";
  const inactiveClass =
    "hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-800";

  const inner = (
    <>
      <div
        className={`h-10 w-10 rounded-xl flex items-center justify-center ${
          active
            ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600"
            : "bg-slate-50 dark:bg-slate-800 text-slate-500"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="font-black text-slate-900 dark:text-white uppercase text-sm">{label}</p>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{sublabel}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <a href={href} className={`${baseClass} ${active ? activeClass : inactiveClass}`}>
        {inner}
      </a>
    );
  }

  return (
    <div className={`${baseClass} ${active ? activeClass : inactiveClass}`}>{inner}</div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  return (
    <AdminLayout
      title="Platform Settings"
      description="Manage administrative security and operational preferences"
    >
      <div className="max-w-5xl space-y-10 animate-fade-in pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Sidebar ── */}
          <div className="lg:col-span-1 space-y-4">
            <div className="sticky top-24 space-y-2">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest pl-2 mb-4">
                Settings Modules
              </h3>

              <NavItem
                icon={<ShieldCheck className="h-5 w-5" />}
                label="Security Matrix"
                sublabel="Authentication & Access"
                active
              />

              <NavItem
                icon={<Bell className="h-5 w-5" />}
                label="Notifications"
                sublabel="Alerts & Directives"
                href="#notifications"
              />

              <NavItem
                icon={<Activity className="h-5 w-5" />}
                label="Session Control"
                sublabel="Active Device Management"
              />
            </div>
          </div>

          {/* ── Content ── */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 shadow-2xl min-h-[140px] flex items-center border border-slate-800">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Lock className="h-32 w-32 text-indigo-400 rotate-12" />
              </div>
              <div className="relative z-10 w-full flex items-center justify-between">
                <div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3 text-[10px] font-black tracking-widest px-3 py-1">
                    ADMINISTRATIVE PROTOCOLS ACTIVE
                  </Badge>
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                    Security Matrix
                  </h2>
                  <p className="text-sm font-medium text-slate-400">
                    Manage your high-privilege biometric keys
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Config */}
            <ProfileSettingsForm />

            {/* Passkeys Integration */}
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#060a12]/50 dark:backdrop-blur-xl shadow-lg border border-indigo-500/10 overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800 pb-6 px-8 pt-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Fingerprint className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                      Biometric Passkeys
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Passwordless authentication methods
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <PasskeySettings settingsPath="/admin/settings" />
              </CardContent>
            </Card>

            {/* Traditional Password */}
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Key className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm mb-1">
                        Traditional Password
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                        Use a high-entropy passphrase as a fallback if biometric verification is
                        temporarily unavailable.
                      </p>
                    </div>
                  </div>
                  <button className="h-10 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest transition-colors shrink-0">
                    Update Key
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* 2FA */}
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Smartphone className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm mb-1 flex items-center gap-2">
                        Two-Factor Auth{" "}
                        <Badge className="bg-emerald-500 text-white border-none font-black text-[10px] tracking-widest px-1.5 py-0">
                          ON
                        </Badge>
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                        Your administrative account is secured by default. Authenticator apps and
                        hardware keys supported.
                      </p>
                    </div>
                  </div>
                  <button className="h-10 px-5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest transition-colors shrink-0">
                    Configure
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* ── Notification Settings ── */}
            <NotificationSettingsCard />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
