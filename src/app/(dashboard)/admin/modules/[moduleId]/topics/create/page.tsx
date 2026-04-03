// app/(dashboard)/admin/modules/[moduleId]/topics/create/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TopicForm } from "@/components/forms/topic-form";

interface CreateTopicPageProps {
  params: Promise<{
    moduleId: string;
  }>;
}

interface Module {
  id: string;
  title: string;
  course: {
    id: string;
    title: string;
  };
}

interface PrerequisiteTopic {
  id: string;
  title: string;
  orderIndex: number;
}

export default function CreateTopicPage({ params }: CreateTopicPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [moduleId, setModuleId] = useState<string>("");
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [prerequisites, setPrerequisites] = useState<PrerequisiteTopic[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    duration: 30,
    topicType: "LESSON",
    videoUrl: "",
    passingScore: 80,
    maxAttempts: null as number | null,
    isRequired: true,
    allowSkip: false,
    isPreview: false,
    prerequisiteTopicId: "",
  });

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setModuleId(resolvedParams.moduleId);

      try {
        const [moduleResponse, topicsResponse] = await Promise.all([
          fetch(`/api/modules/${resolvedParams.moduleId}`),
          fetch(`/api/modules/${resolvedParams.moduleId}/topics`),
        ]);

        if (moduleResponse.ok) {
          const moduleData = await moduleResponse.json();
          setModule(moduleData);
        }

        if (topicsResponse.ok) {
          const topicsData = await topicsResponse.json();
          setPrerequisites(topicsData.topics);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load module data",
          variant: "destructive",
        });
      } finally {
        setFetchLoading(false);
      }
    };
    getParams();
  }, [params, toast]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/modules/${moduleId}/topics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          slug: formData.slug || generateSlug(formData.title),
          prerequisiteTopicId: formData.prerequisiteTopicId || null,
          maxAttempts: formData.maxAttempts || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create topic");
      }

      toast({
        title: "Success",
        description: "Topic created successfully",
      });

      router.push(`/admin/courses/${module?.course.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create topic",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto-generate slug when title changes and slug is empty
      if (field === "title" && !prev.slug) {
        updated.slug = generateSlug(value);
      }

      return updated;
    });
  };

  if (fetchLoading) {
    return (
      <AdminLayout
        title="Create Topic"
        description="Add a new topic to the module"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

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
      title="Create Topic"
      description={`Add a topic to ${module.title}`}
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

        <Card className="bg-white dark:bg-slate-900/50 dark:backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
          <CardHeader>
            <CardTitle>Topic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <TopicForm
              formData={formData}
              prerequisites={prerequisites}
              onSubmit={handleSubmit}
              onInputChange={handleInputChange}
              loading={loading}
              submitLabel="Create Topic"
              cancelHref={`/admin/courses/${module.course.id}`}
              isEdit={false}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
