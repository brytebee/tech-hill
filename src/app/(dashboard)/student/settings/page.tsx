import { PasskeySettings } from "@/components/shared/passkey-settings";

export default function StudentSettingsPage() {
  return (
    <div className="max-w-3xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Security Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account security and authentication methods.
        </p>
      </div>
      <PasskeySettings settingsPath="/student/settings" />
    </div>
  );
}
