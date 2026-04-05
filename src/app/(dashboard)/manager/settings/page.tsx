import { ManagerLayout } from "@/components/layout/ManagerLayout";
import { PasskeySettings } from "@/components/shared/passkey-settings";

export default function ManagerSettingsPage() {
  return (
    <ManagerLayout 
      title="Security Settings" 
      description="Manage your account security and authentication methods"
    >
      <div className="max-w-4xl space-y-8 animate-fade-in">
        <PasskeySettings settingsPath="/manager/settings" />
      </div>
    </ManagerLayout>
  );
}
