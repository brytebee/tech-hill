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

interface EditTopicProps {
  topic: Topic;
}

export default function EditTopic({ topic }: EditTopicProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prerequisites, setPrerequisites] = useState<PrerequisiteTopic[]>([]);
  const [formData, setFormData] = useState({
    title: topic.title || "",
    slug: topic.slug || "",
    description: topic.description || "",
    content: topic.content || "",
    duration: topic.duration || 30,
    topicType: topic.topicType || "LESSON",
    videoUrl: topic.videoUrl || "",
    passingScore: topic.passingScore || 80,
    maxAttempts: topic.maxAttempts || (null as number | null),
    isRequired: topic.isRequired || true,
    allowSkip: topic.allowSkip || false,
    prerequisiteTopicId: topic.prerequisiteTopicId || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/topics/${topic.id}`, {
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
          <Link href={`/admin/modules/${topic.module.id}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
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
              cancelHref={`/admin/modules/${topic.module.id}`}
              isEdit={true}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
