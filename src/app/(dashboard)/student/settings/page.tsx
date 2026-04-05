import { StudentLayout } from "@/components/layout/StudentLayout";
import { PasskeySettings } from "@/components/shared/passkey-settings";

export default function StudentSettingsPage() {
  return (
    <StudentLayout 
      title="Security Settings" 
      description="Manage your account security and authentication methods"
    >
      <div className="max-w-4xl space-y-8 animate-fade-in">
        <PasskeySettings settingsPath="/student/settings" />
      </div>
    </StudentLayout>
  );
}
