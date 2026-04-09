"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CloudinaryUploader } from "@/components/ui/cloudinary-uploader";
import { User, Phone, MapPin, Calendar, Loader2, Save, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export function ProfileSettingsForm() {
  const { data: session, update } = useSession();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    profileImage: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/user/profile"); 
        const data = await response.json();
        if (data.success) {
            const user = data.user;
            setFormData({
                firstName: user.firstName || "",
                lastName: user.lastName || "",
                phoneNumber: user.phoneNumber || "",
                address: user.address || "",
                dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
                profileImage: user.profileImage || "",
            });
        }
      } catch {
          // ignore
      } finally {
        setIsLoading(false);
      }
    };
    if (session?.user) {
        fetchProfile();
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageSuccess = (url: string) => {
    setFormData(prev => ({ ...prev, profileImage: url }));
    toast.success("Image uploaded globally. Remember to save changes.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const resp = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "Failed to update profile");

      // Update NextAuth session state locally to reflect everywhere instantly
      await update({
          firstName: formData.firstName,
          lastName: formData.lastName,
          profileImage: formData.profileImage
      });

      toast.success("Profile demographics updated successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update preferences");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
      return (
          <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
      );
  }

  return (
    <Card className="rounded-[2rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-[#080e1a] shadow-sm overflow-hidden mb-8">
      <form onSubmit={handleSubmit}>
        <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-6 bg-slate-50/50 dark:bg-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <User className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Identity Configuration</CardTitle>
              <CardDescription>Manage your public profile and demographics</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-8 space-y-8">
          
          {/* Avatar Upload Sectio */}
          <div className="flex flex-col sm:flex-row gap-8 items-start pb-8 border-b border-slate-100 dark:border-slate-800/60">
              <div className="shrink-0 relative group">
                  {formData.profileImage ? (
                      <div className="h-32 w-32 rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl relative">
                          <img src={formData.profileImage} alt="Profile" className="h-full w-full object-cover" />
                      </div>
                  ) : (
                      <div className="h-32 w-32 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl">
                           <User className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                      </div>
                  )}
              </div>
              <div className="space-y-3 flex-1 w-full max-w-sm">
                  <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><ImageIcon className="h-3 w-3 text-blue-500" /> Profile Subject Portrait</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-4 leading-relaxed">
                      This avatar represents you globally across the Tech Hill matrix. Recommended size: 500x500px.
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      <CloudinaryUploader 
                          onSuccess={handleImageSuccess}
                          folder={`tech-hill/profiles/${session?.user?.id || 'unknown'}`}
                      />
                  </div>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">First Name</Label>
              <Input 
                  name="firstName"
                  value={formData.firstName} 
                  onChange={handleChange}
                  className="h-12 bg-white dark:bg-slate-950/50 font-medium" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Last Name</Label>
              <Input 
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange} 
                  className="h-12 bg-white dark:bg-slate-950/50 font-medium" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Phone className="h-3 w-3 text-emerald-500" /> Phone Number</Label>
              <Input 
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange} 
                  placeholder="Optional" 
                  className="h-12 bg-white dark:bg-slate-950/50 font-medium" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><Calendar className="h-3 w-3 text-orange-500" /> Date of Birth</Label>
              <Input 
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange} 
                  className="h-12 bg-white dark:bg-slate-950/50 font-medium text-slate-500 dark:text-slate-400" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2"><MapPin className="h-3 w-3 text-rose-500" /> Physical Address</Label>
            <Input 
                name="address"
                value={formData.address}
                onChange={handleChange} 
                placeholder="Optional" 
                className="h-12 bg-white dark:bg-slate-950/50 font-medium" 
            />
          </div>
        </CardContent>

        <CardFooter className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-transparent flex justify-end">
             <Button 
                type="submit" 
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[11px] tracking-widest h-11 px-8 rounded-xl shadow-lg transition-all"
             >
                 {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                 Synchronize Profile
             </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
