// components/courses/course-actions.tsx
"use client";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Archive, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function CourseActions({ course }: { course: any }) {
  const { toast } = useToast();
  const router = useRouter();

  const handlePublish = async () => {
    try {
      const response = await fetch(`/api/courses/${course.id}/publish`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: "Success",
        description: "Course published successfully",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUnpublish = async () => {
    if (!confirm("Are you sure you want to unpublish this course?")) return;

    try {
      const response = await fetch(`/api/courses/${course.id}/publish`, {
        method: "PUT",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: "Success",
        description: "Course unpublished successfully",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleArchive = async () => {
    if (
      !confirm(
        "Are you sure you want to archive this course? Students will no longer be able to enroll."
      )
    )
      return;

    try {
      const response = await fetch(`/api/courses/${course.id}/archive`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: "Success",
        description: "Course archived successfully",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex space-x-2">
      {course.status === "DRAFT" && (
        <Button onClick={handlePublish}>
          <CheckCircle className="h-4 w-4 mr-2" />
          Publish Course
        </Button>
      )}

      {course.status === "PUBLISHED" && (
        <>
          <Button onClick={handleUnpublish} variant="outline">
            <XCircle className="h-4 w-4 mr-2" />
            Unpublish
          </Button>
          <Button onClick={handleArchive} variant="outline">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        </>
      )}

      <Link href={`/admin/courses/${course.id}/edit`}>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Course
        </Button>
      </Link>

      <Button variant="destructive">
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>
    </div>
  );
}
