// app/(dashboard)/admin/topics/[topicId]/edit/page.tsx
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

interface EditTopicPageProps {
  params: Promise<{
    topicId: string;
  }>;
}

interface Topic {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  duration: number;
  topicType: string;
  videoUrl: string;
  passingScore: number;
  maxAttempts: number | null;
  isRequired: boolean;
  allowSkip: boolean;
  prerequisiteTopicId: string | null;
  module: {
    id: string;
    title: string;
    course: {
      id: string;
      title: string;
    };
  };
}

interface PrerequisiteTopic {
  id: string;
  title: string;
  orderIndex: number;
}

export default function EditTopicPage({ params }: EditTopicPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [topicId, setTopicId] = useState<string>("");
  const [topic, setTopic] = useState<Topic | null>(null);
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
    prerequisiteTopicId: "",
  });

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setTopicId(resolvedParams.topicId);

      try {
        const topicResponse = await fetch(
          `/api/topics/${resolvedParams.topicId}`
        );

        if (topicResponse.ok) {
          const topicData = await topicResponse.json();
          setTopic(topicData);
          setFormData({
            title: topicData.title,
            slug: topicData.slug,
            description: topicData.description || "",
            content: topicData.content,
            duration: topicData.duration || 30,
            topicType: topicData.topicType,
            videoUrl: topicData.videoUrl || "",
            passingScore: topicData.passingScore,
            maxAttempts: topicData.maxAttempts,
            isRequired: topicData.isRequired,
            allowSkip: topicData.allowSkip,
            prerequisiteTopicId: topicData.prerequisiteTopicId || "",
          });

          // Fetch prerequisites for the module
          const prereqResponse = await fetch(
            `/api/modules/${topicData.module.id}/topics`
          );
          if (prereqResponse.ok) {
            const prereqData = await prereqResponse.json();
            // Exclude current topic from prerequisites
            setPrerequisites(
              prereqData.topics.filter(
                (t: any) => t.id !== resolvedParams.topicId
              )
            );
          }
        }
      } catch (error) {
        console.error("Error fetching topic:", error);
        toast({
          title: "Error",
          description: "Failed to load topic data",
          variant: "destructive",
        });
      } finally {
        setFetchLoading(false);
      }
    };
    getParams();
  }, [params, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/topics/${topicId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          prerequisiteTopicId: formData.prerequisiteTopicId || null,
          maxAttempts: formData.maxAttempts || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update topic");
      }

      toast({
        title: "Success",
        description: "Topic updated successfully",
      });

      router.push(`/admin/courses/${topic?.module.course.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update topic",
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

  if (fetchLoading) {
    return (
      <AdminLayout title="Edit Topic" description="Update topic information">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading topic...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!topic) {
    return (
      <AdminLayout
        title="Topic Not Found"
        description="The requested topic could not be found"
      >
        <div className="text-center py-8">
          <p>Topic not found</p>
          <Link href="/admin/courses">
            <Button className="mt-4">Back to Courses</Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={`Edit: ${topic.title}`}
      description="Update topic information"
    >
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Link href={`/admin/courses/${topic.module.course.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course
            </Button>
          </Link>
        </div>

        <Card>
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
              submitLabel="Update Topic"
              cancelHref={`/admin/courses/${topic.module.course.id}`}
              isEdit={true}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
