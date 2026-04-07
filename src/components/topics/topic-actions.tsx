// components/topics/topic-actions.tsx
"use client";

import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
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
  Play,
  FileText,
  Brain,
  BookOpen,
  Eye,
  EyeOff,
  SkipForward,
} from "lucide-react";
import Link from "next/link";

interface TopicActionsProps {
  topic: {
    id: string;
    title: string;
    slug: string;
    orderIndex: number;
    topicType: "LESSON" | "PRACTICE" | "ASSESSMENT" | "RESOURCE";
    isRequired: boolean;
    allowSkip: boolean;
    maxAttempts: number | null;
    prerequisiteTopicId: string | null;
    module: {
      id: string;
      course: {
        id: string;
      };
    };
  };
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  totalTopics: number;
}

export function TopicActions({
  topic,
  canMoveUp = false,
  canMoveDown = false,
  totalTopics,
}: TopicActionsProps) {
  const { toast } = useToast();
  const router = useRouter();

  const getTopicTypeIcon = (type: string) => {
    switch (type) {
      case "LESSON":
        return <BookOpen className="h-4 w-4" />;
      case "PRACTICE":
        return <Play className="h-4 w-4" />;
      case "ASSESSMENT":
        return <Brain className="h-4 w-4" />;
      case "RESOURCE":
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const { showConfirm } = useModal();

  const handleReorderTopic = async (direction: "up" | "down") => {
    // ...
  };

  const handleToggleRequired = async () => {
    const actionLabel = topic.isRequired ? "make optional" : "make required";

    showConfirm({
      title: `${topic.isRequired ? "Make Optional" : "Make Required"}`,
      description: `Are you sure you want to ${actionLabel} this topic?`,
      confirmText: "Confirm",
      onConfirm: async () => {
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
            description: `Topic ${
              topic.isRequired ? "made optional" : "made required"
            } successfully`,
          });

          router.refresh();
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to update topic requirement",
            variant: "destructive",
          });
        }
      },
    });
  };

  const handleToggleSkipAllowed = async () => {
    const actionLabel = topic.allowSkip ? "disable skipping" : "allow skipping";

    showConfirm({
      title: `${topic.allowSkip ? "Disable Skipping" : "Allow Skipping"}`,
      description: `Are you sure you want to ${actionLabel} for this topic?`,
      confirmText: "Confirm",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/topics/${topic.id}/skip`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              allowSkip: !topic.allowSkip,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error);
          }

          toast({
            title: "Success",
            description: `Skipping ${
              topic.allowSkip ? "disabled" : "enabled"
            } for topic successfully`,
          });

          router.refresh();
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to update topic skip setting",
            variant: "destructive",
          });
        }
      },
    });
  };

  const handleDuplicate = async () => {
    // ...
  };

  const handleDelete = async () => {
    showConfirm({
      title: "Delete Topic",
      description:
        "Are you sure you want to delete this topic? This action cannot be undone and will permanently remove all quizzes and progress data associated with this topic.",
      confirmText: "Delete",
      variant: "error",
      onConfirm: async () => {
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
            description: "Topic deleted successfully",
          });

          router.push(`/admin/modules/${topic.module.id}`);
        } catch (error: any) {
          toast({
            title: "Error",
            description: error.message || "Failed to delete topic",
            variant: "destructive",
          });
        }
      },
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {/* Topic Type & Order Controls */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded text-sm">
          {getTopicTypeIcon(topic.topicType)}
          <span className="ml-1 font-medium">{topic.topicType}</span>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            onClick={() => handleReorderTopic("up")}
            disabled={!canMoveUp}
            variant="outline"
            size="sm"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => handleReorderTopic("down")}
            disabled={!canMoveDown}
            variant="outline"
            size="sm"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-500 px-2">
            {topic.orderIndex} of {totalTopics}
          </span>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex space-x-2">
        <Link href={`/admin/topics/${topic.id}/edit`}>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Topic
          </Button>
        </Link>

        {topic.topicType === "ASSESSMENT" && (
          <Link href={`/admin/topics/${topic.id}/quizzes/create`}>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Quiz
            </Button>
          </Link>
        )}

        <Link href={`/admin/topics/${topic.id}/preview`}>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </Link>
      </div>

      {/* Settings Actions */}
      <div className="flex space-x-2">
        <Button onClick={handleToggleRequired} variant="outline" size="sm">
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

        <Button onClick={handleToggleSkipAllowed} variant="outline" size="sm">
          {topic.allowSkip ? (
            <>
              <EyeOff className="h-4 w-4 mr-2" />
              Disable Skip
            </>
          ) : (
            <>
              <SkipForward className="h-4 w-4 mr-2" />
              Allow Skip
            </>
          )}
        </Button>

        <Button onClick={handleDuplicate} variant="outline" size="sm">
          <Copy className="h-4 w-4 mr-2" />
          Duplicate
        </Button>
      </div>

      {/* Analytics & Management */}
      <div className="flex space-x-2">
        <Link href={`/admin/topics/${topic.id}/analytics`}>
          <Button variant="outline" size="sm">
            <Brain className="h-4 w-4 mr-2" />
            Analytics
          </Button>
        </Link>

        {topic.topicType === "ASSESSMENT" && (
          <Link href={`/admin/topics/${topic.id}/submissions`}>
            <Button variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-2" />
              Submissions
            </Button>
          </Link>
        )}
      </div>

      {/* Destructive Actions */}
      <div className="flex space-x-2">
        <Button onClick={handleDelete} variant="destructive" size="sm">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  );
}
