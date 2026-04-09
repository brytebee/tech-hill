import { ManagerLayout } from "@/components/layout/ManagerLayout";
import { PasskeySettings } from "@/components/shared/passkey-settings";
import { ProfileSettingsForm } from "@/components/shared/profile-settings-form";

export default function ManagerSettingsPage() {
  return (
    <ManagerLayout 
      title="Security Settings" 
      description="Manage your account security and authentication methods"
    >
      <div className="max-w-4xl space-y-8 animate-fade-in pb-20">
        <ProfileSettingsForm />
        <PasskeySettings settingsPath="/manager/settings" />
      </div>
    </ManagerLayout>
  );
}
