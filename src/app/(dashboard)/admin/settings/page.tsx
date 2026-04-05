import { AdminLayout } from "@/components/layout/AdminLayout";
import { PasskeySettings } from "@/components/shared/passkey-settings";

export default function AdminSettingsPage() {
  return (
    <AdminLayout 
      title="Security Settings" 
      description="Manage your account security and authentication methods"
    >
      <div className="max-w-4xl space-y-8 animate-fade-in">
        <PasskeySettings settingsPath="/admin/settings" />
      </div>
    </AdminLayout>
  );
}
