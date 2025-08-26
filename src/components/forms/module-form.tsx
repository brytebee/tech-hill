// components/forms/module-form.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Module {
  id: string;
  title: string;
  description: string;
  duration: number;
  passingScore: number;
  prerequisiteModuleId: string | null;
  isRequired: boolean;
  unlockDelay: number | null;
  course: {
    id: string;
    title: string;
  };
}

interface EditModulePageProps {
  module: Module;
}

interface PrerequisiteModule {
  id: string;
  title: string;
  order: number;
}

export default function EditModuleForm({ module }: EditModulePageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [moduleId, setModuleId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [prerequisites, setPrerequisites] = useState<PrerequisiteModule[]>([]);
  const [formData, setFormData] = useState({
    title: module.title || "",
    description: module.description || "",
    duration: module.duration || 60,
    passingScore: module.passingScore || 80,
    prerequisiteModuleId: module.prerequisiteModuleId || "",
    isRequired: module.isRequired || true,
    unlockDelay: module.unlockDelay || 0,
  });

  // useEffect(() => {
  //   const getParams = async () => {
  //     const resolvedParams = await params;
  //     setModuleId(resolvedParams.moduleId);

  //     // Fetch module data
  //     try {
  //       const [moduleResponse, prerequisitesResponse] = await Promise.all([
  //         fetch(`/api/modules/${resolvedParams.moduleId}`),
  //         fetch(`/api/courses/${resolvedParams.moduleId}/modules`), // This will need to be updated to get courseId first
  //       ]);

  //       if (moduleResponse.ok) {
  //         const moduleData = await moduleResponse.json();
  //         setModule(moduleData);
  //         setFormData({
  //           title: moduleData.title,
  //           description: moduleData.description || "",
  //           duration: moduleData.duration,
  //           passingScore: moduleData.passingScore,
  //           prerequisiteModuleId: moduleData.prerequisiteModuleId || "",
  //           isRequired: moduleData.isRequired,
  //           unlockDelay: moduleData.unlockDelay || 0,
  //         });

  //         // Fetch prerequisites for the course
  //         const coursePrereqResponse = await fetch(
  //           `/api/courses/${moduleData.course.id}/modules`
  //         );
  //         if (coursePrereqResponse.ok) {
  //           const prereqData = await coursePrereqResponse.json();
  //           // Exclude current module from prerequisites
  //           setPrerequisites(
  //             prereqData.modules.filter(
  //               (m: any) => m.id !== resolvedParams.moduleId
  //             )
  //           );
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Error fetching module:", error);
  //       toast({
  //         title: "Error",
  //         description: "Failed to load module data",
  //         variant: "destructive",
  //       });
  //     } finally {
  //       setFetchLoading(false);
  //     }
  //   };
  //   getParams();
  // }, [params, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/modules/${module.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          prerequisiteModuleId: formData.prerequisiteModuleId || null,
          unlockDelay: formData.unlockDelay || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: "Success",
        description: "Module updated successfully",
      });

      router.push(`/admin/courses/${module?.course.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // if (fetchLoading) {
  //   return (
  //     <AdminLayout title="Edit Module" description="Update module information">
  //       <div className="flex items-center justify-center h-64">
  //         <div className="text-lg">Loading module...</div>
  //       </div>
  //     </AdminLayout>
  //   );
  // }

  if (!module) {
    return (
      <AdminLayout
        title="Module Not Found"
        description="The requested module could not be found"
      >
        <div className="text-center py-8">
          <p>Module not found</p>
          <Link href="/admin/courses">
            <Button className="mt-4">Back to Courses</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={`Edit: ${module.title}`}
      description="Update module information"
    >
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Link href={`/admin/courses/${module.course.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Module Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Module Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter module title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) =>
                      handleInputChange("duration", parseInt(e.target.value))
                    }
                    placeholder="60"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Describe what students will learn in this module"
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passingScore">Passing Score (%)</Label>
                  <Input
                    id="passingScore"
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) =>
                      handleInputChange(
                        "passingScore",
                        parseInt(e.target.value)
                      )
                    }
                    min="0"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unlockDelay">Unlock Delay (hours)</Label>
                  <Input
                    id="unlockDelay"
                    type="number"
                    value={formData.unlockDelay}
                    onChange={(e) =>
                      handleInputChange("unlockDelay", parseInt(e.target.value))
                    }
                    min="0"
                    placeholder="0 for immediate access"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prerequisite">Prerequisite Module</Label>
                <Select
                  value={formData.prerequisiteModuleId}
                  onValueChange={(value) =>
                    handleInputChange("prerequisiteModuleId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select prerequisite module (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No prerequisite</SelectItem>
                    {prerequisites.map((prereqModule) => (
                      <SelectItem key={prereqModule.id} value={prereqModule.id}>
                        Module {prereqModule.order}: {prereqModule.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isRequired"
                  checked={formData.isRequired}
                  onCheckedChange={(checked) =>
                    handleInputChange("isRequired", checked)
                  }
                />
                <Label htmlFor="isRequired">
                  This module is required for course completion
                </Label>
              </div>

              <div className="flex space-x-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update Module"}
                </Button>
                <Link href={`/admin/courses/${module.course.id}`}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
