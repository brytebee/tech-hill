import { ManagerLayout } from "@/components/layout/ManagerLayout";
import { CertificateHub } from "@/components/shared/CertificateHub";

export const metadata = {
  title: "Manager | Certificates & Designs",
};

export default function ManagerCertificatesPage() {
  return (
    <ManagerLayout 
      title="Certificate Hub" 
      description="Manage certificate designs and review issuance logs across the platform."
    >
      <div className="animate-in fade-in zoom-in-95 duration-500 max-w-7xl">
        <CertificateHub />
      </div>
    </ManagerLayout>
  );
}
