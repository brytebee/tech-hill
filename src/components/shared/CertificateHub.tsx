"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Image as ImageIcon, CheckCircle, Clock, Plus, PenTool, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { CloudinaryUploader } from "@/components/ui/cloudinary-uploader";
import { ModernDarkTheme, ClassicGoldTheme } from "@/components/certificates/themes/ThemeRegistry";
import { Input } from "@/components/ui/input";

export function CertificateHub() {
  const [activeTab, setActiveTab] = useState<"ledger" | "templates">("ledger");
  const [certificates, setCertificates] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Template Form State
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    courseId: "default",
    name: "", 
    description: "",
    themeName: "ModernDark",
    primaryColor: "",
    logoUrl: "",
    signatureUrl: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [certRes, tempRes, courseRes] = await Promise.all([
        fetch("/api/admin/certificates"),
        fetch("/api/admin/certificates/templates"),
        fetch("/api/courses")
      ]);
      if (certRes.ok) setCertificates(await certRes.json());
      if (tempRes.ok) setTemplates(await tempRes.json());
      if (courseRes.ok) {
        const c = await courseRes.json();
        setCourses(c.courses || c); // Depending on how /api/courses returns
      }
    } catch (error) {
      toast.error("Failed to load certificate data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/certificates/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTemplate),
      });

      if (res.ok) {
        toast.success("Template created successfully");
        setIsCreatingTemplate(false);
        setNewTemplate({ 
          courseId: "default",
          name: "", 
          description: "",
          themeName: "ModernDark",
          primaryColor: "",
          logoUrl: "",
          signatureUrl: ""
        });
        fetchData();
      } else {
        toast.error("Failed to create template");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Issued Certificates</p>
                <h3 className="text-2xl font-black">{certificates.filter(c => c.status === "ISSUED").length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Pending Review</p>
                <h3 className="text-2xl font-black">{certificates.filter(c => c.status === "PENDING_REVIEW").length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <LayoutTemplate className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">Active Designs</p>
                <h3 className="text-2xl font-black">{templates.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("ledger")}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "ledger" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Issuance Ledger
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "templates" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Design Studio
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : activeTab === "ledger" ? (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 uppercase font-black text-xs">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Program</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Issued At</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                    <td className="px-6 py-4 font-medium">{cert.user.firstName} {cert.user.lastName}</td>
                    <td className="px-6 py-4">{cert.course?.title || cert.track?.title || cert.title}</td>
                    <td className="px-6 py-4">
                       <Badge variant="outline" className={cert.certificateType === "TRACK_COMPLETION" ? "border-amber-200 text-amber-700 bg-amber-50" : "border-blue-200 text-blue-700 bg-blue-50"}>
                          {cert.certificateType === "TRACK_COMPLETION" ? "Mastery Path" : "Course"}
                       </Badge>
                    </td>
                    <td className="px-6 py-4 text-slate-500">{new Date(cert.issuedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                       <Badge className={cert.status === "ISSUED" ? "bg-emerald-500" : "bg-slate-500"}>{cert.status}</Badge>
                    </td>
                  </tr>
                ))}
                {certificates.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No certificates have been issued yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Template Gallery</h2>
              <p className="text-sm text-slate-500">Configure React-driven templates for dynamic high-res certificate generation.</p>
            </div>
            <Button onClick={() => setIsCreatingTemplate(!isCreatingTemplate)} className="bg-blue-600 hover:bg-blue-700">
               {isCreatingTemplate ? "Cancel" : <><Plus className="h-4 w-4 mr-2" /> Select Theme</>}
            </Button>
          </div>

          {isCreatingTemplate && (
            <Card className="border-blue-200 dark:border-blue-900 border-2 shadow-md">
               <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-900">
                 <CardTitle className="text-lg flex items-center gap-2"><PenTool className="h-5 w-5 text-blue-600" /> New Certificate Template</CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                 <form onSubmit={handleCreateTemplate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Target Course</label>
                        <select 
                          className="w-full h-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 rounded-md text-sm"
                          value={newTemplate.courseId} 
                          required
                          onChange={(e) => {
                            const selectedCourse = courses.find((c: any) => c.id === e.target.value);
                            setNewTemplate({
                              ...newTemplate, 
                              courseId: e.target.value,
                              name: selectedCourse ? selectedCourse.title : "",
                              description: selectedCourse ? `Official certification for mastery of ${selectedCourse.title}.` : ""
                            });
                          }}
                        >
                          <option value="default" disabled>Select a course...</option>
                          {courses.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Description</label>
                        <Input value={newTemplate.description} onChange={e => setNewTemplate({...newTemplate, description: e.target.value})} placeholder="Internal reference notes..." />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Theme Style</label>
                        <select 
                          className="w-full h-10 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 rounded-md text-sm"
                          value={newTemplate.themeName} 
                          onChange={e => setNewTemplate({...newTemplate, themeName: e.target.value})}
                        >
                          <option value="ModernDark">Modern Dark (Glassmorphic)</option>
                          <option value="ClassicGold">Classic Gold (Premium Serifs)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold">Primary Accent Color (Hex)</label>
                        <Input value={newTemplate.primaryColor} onChange={e => setNewTemplate({...newTemplate, primaryColor: e.target.value})} placeholder="#3b82f6" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                          <label className="text-sm font-bold">Organization Logo</label>
                          {newTemplate.logoUrl ? (
                            <div className="relative border rounded-lg p-2 bg-slate-50 dark:bg-slate-900 group">
                              <img src={newTemplate.logoUrl} alt="Logo" className="h-10 object-contain" />
                              <Button type="button" variant="ghost" size="sm" onClick={() => setNewTemplate({...newTemplate, logoUrl: ""})} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">Remove</Button>
                            </div>
                          ) : (
                            <CloudinaryUploader onUploadSuccess={(url) => setNewTemplate({...newTemplate, logoUrl: url})} buttonText="Upload Logo PNG" />
                          )}
                      </div>
                      <div className="space-y-4">
                          <label className="text-sm font-bold">Instructor Signature</label>
                          {newTemplate.signatureUrl ? (
                            <div className="relative border rounded-lg p-2 bg-slate-50 dark:bg-slate-900 group">
                              <img src={newTemplate.signatureUrl} alt="Signature" className="h-10 object-contain" />
                              <Button type="button" variant="ghost" size="sm" onClick={() => setNewTemplate({...newTemplate, signatureUrl: ""})} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">Remove</Button>
                            </div>
                          ) : (
                            <CloudinaryUploader onUploadSuccess={(url) => setNewTemplate({...newTemplate, signatureUrl: url})} buttonText="Upload Signature PNG" />
                          )}
                      </div>
                    </div>
                    <Button type="submit" className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 w-full font-bold h-11">Save Template Layout</Button>
                 </form>
               </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {templates.map(tpl => (
                <Card key={tpl.id} className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm group">
                   <div className="aspect-[1.414/1] bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 relative overflow-hidden flex items-start justify-start">
                      <div style={{ transform: "scale(0.31)", transformOrigin: "top left" }} className="pointer-events-none">
                         {tpl.themeName === "ModernDark" ? (
                            <ModernDarkTheme 
                               studentName="Jane Doe" 
                               courseName="Sample Course Mastery" 
                               date={new Date().toLocaleDateString()} 
                               primaryColor={tpl.primaryColor}
                               logoUrl={tpl.logoUrl}
                               signatureUrl={tpl.signatureUrl}
                            />
                         ) : (
                            <ClassicGoldTheme 
                               studentName="Jane Doe" 
                               courseName="Sample Course Mastery" 
                               date={new Date().toLocaleDateString()} 
                               primaryColor={tpl.primaryColor}
                               logoUrl={tpl.logoUrl}
                               signatureUrl={tpl.signatureUrl}
                            />
                         )}
                      </div>

                      {tpl.isDefault && (
                          <Badge className="absolute top-4 left-4 bg-emerald-500 shadow-md border-none font-black text-[10px] uppercase z-10 w-auto">Default</Badge>
                      )}
                   </div>
                   <CardContent className="p-5">
                      <h3 className="font-bold text-lg mb-1">{tpl.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2">{tpl.description || "No description provided."}</p>
                   </CardContent>
                </Card>
             ))}
             {templates.length === 0 && !isCreatingTemplate && (
                <div className="col-span-full text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                   <Award className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                   <h3 className="font-bold text-slate-900 dark:text-white">No Designs Found</h3>
                   <p className="text-slate-500 mt-1">Upload your first certificate template.</p>
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
