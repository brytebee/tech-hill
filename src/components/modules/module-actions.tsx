// components/modules/module-actions.tsx
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
  Plus,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Users,
  BookOpen,
  Settings,
  Eye
} from "lucide-react";
import Link from "next/link";

interface ModuleActionsProps {
  module: {
    id: string;
    title: string;
    slug: string;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    isRequired: boolean;
    orderIndex: number;
    estimatedHours?: number;
    course: {
      id: string;
    };
  };
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  totalModules: number;
  topicCount: number;
}

export function ModuleActions({ 
  module, 
  canMoveUp = false, 
  canMoveDown = false,
  totalModules,
  topicCount 
}: ModuleActionsProps) {
  const { toast } = useToast();
  const router = useRouter();

  const handlePublish = async () => {
    if (topicCount === 0) {
      toast({
        title: "Cannot Publish",
        description: "Module must have at least one topic before publishing",
        variant: "destructive",
      });
      return;
    }

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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "DRAFT" }),
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

  const handleReorderModule = async (direction: "up" | "down") => {
    try {
      const response = await fetch(`/api/modules/${module.id}/reorder`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ direction }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: "Success",
        description: `Module moved ${direction} successfully`,
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || `Failed to move module ${direction}`,
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
    if (!confirm("This will duplicate the module and all its topics. Continue?")) return;

    try {
      const response = await fetch(`/api/modules/${module.id}/duplicate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          includeTopics: true,
          includeQuizzes: true,
        }),
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

  const handleRestore = async () => {
    try {
      const response = await fetch(`/api/modules/${module.id}/restore`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      toast({
        title: "Success",
        description: "Module restored successfully",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore module",
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
      {/* Status & Order Controls */}
      <div className="flex items-center space-x-2">
        <div className={`px-2 py-1 rounded text-sm font-medium ${
          module.status === "PUBLISHED" ? "bg-green-100 text-green-800" :
          module.status === "ARCHIVED" ? "bg-gray-100 text-gray-800" :
          "bg-yellow-100 text-yellow-800"
        }`}>
          {module.status}
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            onClick={() => handleReorderModule("up")}
            disabled={!canMoveUp}
            variant="outline"
            size="sm"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleReorderModule("down")}
            disabled={!canMoveDown}
            variant="outline"
            size="sm"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500 px-2">
            {module.orderIndex} of {totalModules}
          </span>
        </div>
      </div>

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

        {module.status === "ARCHIVED" && (
          <Button onClick={handleRestore} variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Restore
          </Button>
        )}

        <Link href={`/admin/modules/${module.id}/topics/create`}>
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Topic ({topicCount})
          </Button>
        </Link>

        <Link href={`/admin/modules/${module.id}`}>
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            View Module
          </Button>
        </Link>
      </div>

      {/* Settings & Management */}
      <div className="flex space-x-2">
        <Button onClick={handleToggleRequired} variant="outline" size="sm">
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

        <Button onClick={handleDuplicate} variant="outline" size="sm">
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </Button>

        <Link href={`/admin/modules/${module.id}/edit`}>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </Link>

        <Link href={`/admin/modules/${module.id}/preview`}>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </Link>
      </div>

      {/* Analytics & Reports */}
      <div className="flex space-x-2">
        <Link href={`/admin/modules/${module.id}/analytics`}>
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </Link>

        <Link href={`/admin/modules/${module.id}/progress`}>
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Student Progress
          </Button>
        </Link>

        <Link href={`/admin/modules/${module.id}/settings`}>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </Link>
      </div>

      {/* Destructive Actions */}
      <div className="flex space-x-2">
        {module.status === "PUBLISHED" && (
          <Button onClick={handleArchive} variant="outline" size="sm">
            <Archive className="h-4 w-4 mr-2" />
            Archive
          </Button>
        )}

        <Button onClick={handleDelete} variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}
