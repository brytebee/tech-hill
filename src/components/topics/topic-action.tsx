// components/topics/topic-actions.tsx
"use client";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash2, 
  Archive, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Unlock,
  Copy,
  Plus
} from "lucide-react";
import Link from "next/link";

interface TopicActionsProps {
  topic: {
    id: string;
    status: string;
    isRequired: boolean;
    module: {
      id: string;
      course: {
        id: string;
      };
    }
  };
}

export function ModuleActions({ topic }: TopicActionsProps) {
  const { toast } = useToast();
  const router = useRouter();

  const handlePublish = async () => {
    try {
      const response = await fetch(`/api/topics/${topic.id}/publish`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: "Success",
        description: "Module published successfully",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to publish topic",
        variant: "destructive",
      });
    }
  };

  const handleUnpublish = async () => {
    if (!confirm("Are you sure you want to unpublish this topic? Students will lose access to its content.")) return;

    try {
      const response = await fetch(`/api/topics/${topic.id}/publish`, {
        method: "PUT",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: "Success",
        description: "Module unpublished successfully",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to unpublish topic",
        variant: "destructive",
      });
    }
  };

  const handleToggleRequired = async () => {
    const action = topic.isRequired ? "make optional" : "make required";
    if (!confirm(`Are you sure you want to ${action} this topic?`)) return;

    try {
      const response = await fetch(`/api/topics/${topic.id}/required`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isRequired: !topic.isRequired,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: "Success",
        description: `Module ${topic.isRequired ? "made optional" : "made required"} successfully`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update topic requirement",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async () => {
    try {
      const response = await fetch(`/api/topics/${topic.id}/duplicate`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const duplicatedModule = await response.json();

      toast({
        title: "Success",
        description: "Module duplicated successfully",
      });

      router.push(`/admin/topics/${duplicatedModule.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate topic",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async () => {
    if (
      !confirm(
        "Are you sure you want to archive this topic? It will be hidden from students but preserved for reference."
      )
    )
      return;

    try {
      const response = await fetch(`/api/topics/${topic.id}/archive`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: "Success",
        description: "Module archived successfully",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to archive topic",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this topic? This action cannot be undone and will permanently remove all topics and quizzes within this topic."
      )
    )
      return;

    try {
      const response = await fetch(`/api/topics/${topic.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: "Success",
        description: "Module deleted successfully",
      });

      router.push(`/admin/courses/${topic.course.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete topic",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Primary Actions */}
      <div className="flex space-x-2">
        {topic.status === "DRAFT" && (
          <Button onClick={handlePublish}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Publish Module
          </Button>
        )}

        {topic.status === "PUBLISHED" && (
          <Button onClick={handleUnpublish} variant="outline">
            <XCircle className="h-4 w-4 mr-2" />
            Unpublish
          </Button>
        )}

        <Link href={`/admin/topics/${topic.id}/topics/create`}>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
        </Link>
      </div>

      {/* Secondary Actions */}
      <div className="flex space-x-2">
        <Button onClick={handleToggleRequired} variant="outline">
          {topic.isRequired ? (
            <>
              <Unlock className="h-4 w-4 mr-2" />
              Make Optional
            </>
          ) : (
            <>
              <Lock className="h-4 w-4 mr-2" />
              Make Required
            </>
          )}
        </Button>

        <Button onClick={handleDuplicate} variant="outline">
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </Button>

        <Link href={`/admin/topics/${topic.id}/edit`}>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Module
          </Button>
        </Link>
      </div>

      {/* Destructive Actions */}
      <div className="flex space-x-2">
        {topic.status === "PUBLISHED" && (
          <Button onClick={handleArchive} variant="outline">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        )}

        <Button onClick={handleDelete} variant="destructive">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}
