// components/modules/ModuleActions.tsx
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

interface ModuleActionsProps {
  module: {
    id: string;
    status: string;
    isRequired: boolean;
    course: {
      id: string;
    };
  };
}

export function ModuleActions({ module }: ModuleActionsProps) {
  const { toast } = useToast();
  const router = useRouter();

  const handlePublish = async () => {
    try {
      const response = await fetch(`/api/modules/${module.id}/publish`, {
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
        description: error.message || "Failed to publish module",
        variant: "destructive",
      });
    }
  };

  const handleUnpublish = async () => {
    if (!confirm("Are you sure you want to unpublish this module? Students will lose access to its content.")) return;

    try {
      const response = await fetch(`/api/modules/${module.id}/publish`, {
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
        description: error.message || "Failed to unpublish module",
        variant: "destructive",
      });
    }
  };

  const handleToggleRequired = async () => {
    const action = module.isRequired ? "make optional" : "make required";
    if (!confirm(`Are you sure you want to ${action} this module?`)) return;

    try {
      const response = await fetch(`/api/modules/${module.id}/required`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isRequired: !module.isRequired,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: "Success",
        description: `Module ${module.isRequired ? "made optional" : "made required"} successfully`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update module requirement",
        variant: "destructive",
      });
    }
  };

  const handleDuplicate = async () => {
    try {
      const response = await fetch(`/api/modules/${module.id}/duplicate`, {
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

      router.push(`/admin/modules/${duplicatedModule.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to duplicate module",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async () => {
    if (
      !confirm(
        "Are you sure you want to archive this module? It will be hidden from students but preserved for reference."
      )
    )
      return;

    try {
      const response = await fetch(`/api/modules/${module.id}/archive`, {
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
        description: error.message || "Failed to archive module",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this module? This action cannot be undone and will permanently remove all topics and quizzes within this module."
      )
    )
      return;

    try {
      const response = await fetch(`/api/modules/${module.id}`, {
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

      router.push(`/admin/courses/${module.course.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete module",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Primary Actions */}
      <div className="flex space-x-2">
        {module.status === "DRAFT" && (
          <Button onClick={handlePublish}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Publish Module
          </Button>
        )}

        {module.status === "PUBLISHED" && (
          <Button onClick={handleUnpublish} variant="outline">
            <XCircle className="h-4 w-4 mr-2" />
            Unpublish
          </Button>
        )}

        <Link href={`/admin/modules/${module.id}/topics/create`}>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Topic
          </Button>
        </Link>
      </div>

      {/* Secondary Actions */}
      <div className="flex space-x-2">
        <Button onClick={handleToggleRequired} variant="outline">
          {module.isRequired ? (
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

        <Link href={`/admin/modules/${module.id}/edit`}>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Module
          </Button>
        </Link>
      </div>

      {/* Destructive Actions */}
      <div className="flex space-x-2">
        {module.status === "PUBLISHED" && (
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
