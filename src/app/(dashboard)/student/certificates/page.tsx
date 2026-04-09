import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudentLayout } from "@/components/layout/StudentLayout";
import { prisma } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Download, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Certificates | Tech Hill",
  description: "View and download your earned certificates.",
};

export default async function StudentCertificatesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const certificates = await prisma.certificate.findMany({
    where: { userId: session.user.id },
    include: { 
      course: { select: { id: true, title: true } },
      track: { select: { id: true, title: true } },
    },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <StudentLayout title="My Certificates" description="View, download, and share your official credentials.">
      <div className="space-y-6">
        {certificates.length === 0 ? (
          <Card className="border-dashed border-slate-200 dark:border-slate-800">
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                 <Award className="h-10 w-10 text-slate-400 dark:text-slate-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No credentials yet</h2>
              <p className="text-slate-500 max-w-sm mb-8">
                Complete a course or a Master Track to earn your first certified credential.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert: any) => (
              <Card key={cert.id} className="border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-blue-500/20 transition-all group overflow-hidden bg-white dark:bg-slate-900">
                <div className="h-40 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                       <Award className="w-32 h-32" />
                   </div>
                   <Award className="h-12 w-12 text-blue-500 mb-3 relative z-10" />
                   <h3 className="font-bold text-center text-sm relative z-10">{cert.course?.title || cert.track?.title}</h3>
                </div>
                <CardContent className="p-5">
                  <div className="mb-4">
                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Credential ID</p>
                     <p className="font-mono text-sm dark:text-slate-300">{cert.id.slice(-12).toUpperCase()}</p>
                  </div>
                  <div className="mb-6">
                     <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Issued On</p>
                     <p className="text-sm dark:text-slate-300 font-medium">{new Date(cert.issuedAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                     <Button variant="outline" className="w-full h-10 border-slate-200 dark:border-slate-700 bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                       <Eye className="w-4 h-4 mr-2" /> View
                     </Button>
                     <Button className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white font-semibold">
                       <Download className="w-4 h-4 mr-2" /> Download
                     </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
