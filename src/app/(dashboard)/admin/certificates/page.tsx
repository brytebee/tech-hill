import { AdminLayout } from "@/components/layout/AdminLayout";
import { CertificateHub } from "@/components/shared/CertificateHub";

export const metadata = {
  title: "Admin | Certificates & Designs",
};

export default function AdminCertificatesPage() {
  return (
    <AdminLayout 
      title="Certificate Hub" 
      description="Manage certificate designs and review issuance logs across the platform."
    >
      <div className="animate-in fade-in zoom-in-95 duration-500 max-w-7xl">
        <CertificateHub />
      </div>
    </AdminLayout>
  );
}
