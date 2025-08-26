// components/forms/topic-form.tsx
"use client";

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
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

interface PrerequisiteTopic {
  id: string;
  title: string;
  orderIndex: number;
}

interface TopicFormData {
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
  prerequisiteTopicId: string;
}

interface TopicFormProps {
  formData: TopicFormData;
  prerequisites: PrerequisiteTopic[];
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (field: string, value: any) => void;
  loading: boolean;
  submitLabel: string;
  cancelHref: string;
  isEdit?: boolean;
}

export function TopicForm({
  formData,
  prerequisites,
  onSubmit,
  onInputChange,
  loading,
  submitLabel,
  cancelHref,
  isEdit = false,
}: TopicFormProps) {
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (value: string) => {
    onInputChange("title", value);
    // Auto-generate slug when title changes (only for create mode)
    if (!isEdit && !formData.slug) {
      onInputChange("slug", generateSlug(value));
    }
  };

  const handlePrerequisiteChange = (value: string) => {
    // Convert "none" to empty string for the form data
    onInputChange("prerequisiteTopicId", value === "none" ? "" : value);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="title">Topic Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter topic title"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">URL Slug *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => onInputChange("slug", e.target.value)}
            placeholder="url-friendly-slug"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange("description", e.target.value)}
          placeholder="Brief description of the topic"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => onInputChange("content", e.target.value)}
          placeholder="Enter the main content for this topic (supports rich text)"
          rows={10}
          required
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="topicType">Topic Type</Label>
          <Select
            value={formData.topicType}
            onValueChange={(value) => onInputChange("topicType", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LESSON">Lesson</SelectItem>
              <SelectItem value="PRACTICE">Practice</SelectItem>
              <SelectItem value="ASSESSMENT">Assessment</SelectItem>
              <SelectItem value="RESOURCE">Resource</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) =>
              onInputChange("duration", parseInt(e.target.value))
            }
            min="1"
            placeholder="30"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="passingScore">Passing Score (%)</Label>
          <Input
            id="passingScore"
            type="number"
            value={+(formData.passingScore || "0")}
            onChange={(e) =>
              onInputChange("passingScore", parseInt(e.target.value))
            }
            min="0"
            max="100"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoUrl">Video URL (optional)</Label>
        <Input
          id="videoUrl"
          value={formData.videoUrl}
          onChange={(e) => onInputChange("videoUrl", e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          type="url"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="prerequisite">Prerequisite Topic</Label>
          <Select
            value={formData.prerequisiteTopicId || "none"}
            onValueChange={handlePrerequisiteChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select prerequisite topic (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No prerequisite</SelectItem>
              {prerequisites.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.orderIndex}. {topic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxAttempts">Max Attempts (optional)</Label>
          <Input
            id="maxAttempts"
            type="number"
            value={formData.maxAttempts || ""}
            onChange={(e) =>
              onInputChange(
                "maxAttempts",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            min="1"
            placeholder="Unlimited"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isRequired"
            checked={formData.isRequired}
            onCheckedChange={(checked) => onInputChange("isRequired", checked)}
          />
          <Label htmlFor="isRequired">
            This topic is required for module completion
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="allowSkip"
            checked={formData.allowSkip}
            onCheckedChange={(checked) => onInputChange("allowSkip", checked)}
          />
          <Label htmlFor="allowSkip">
            Allow students to skip this topic if struggling
          </Label>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button type="submit" disabled={loading}>
          {loading ? `${submitLabel}...` : submitLabel}
        </Button>
        <Link href={cancelHref}>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
