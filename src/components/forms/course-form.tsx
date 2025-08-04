// components/forms/course-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const courseFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  shortDescription: z.string().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  duration: z.number().min(1, "Duration must be at least 1 hour"),
  price: z.number().min(0).optional(),
  tags: z.string().optional(),
  prerequisites: z.string().optional(),
  syllabus: z.string().optional(),
  learningOutcomes: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  course?: any;
  onSuccess?: () => void;
  isEdit?: boolean;
}

export function CourseForm({
  course,
  onSuccess,
  isEdit = false,
}: CourseFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: course?.title || "",
      description: course?.description || "",
      shortDescription: course?.shortDescription || "",
      difficulty: course?.difficulty || "BEGINNER",
      duration: course?.duration || 1,
      price: course?.price || 0,
      tags: course?.tags?.join(", ") || "",
      prerequisites: course?.prerequisites?.join(", ") || "",
      syllabus: course?.syllabus || "",
      learningOutcomes: course?.learningOutcomes?.join("\n") || "",
    },
  });

  const onSubmit = async (data: CourseFormData) => {
    setLoading(true);
    try {
      const url = isEdit ? `/api/courses/${course.id}` : "/api/courses";
      const method = isEdit ? "PUT" : "POST";

      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
        prerequisites: data.prerequisites
          ? data.prerequisites.split(",").map((req) => req.trim())
          : [],
        learningOutcomes: data.learningOutcomes
          ? data.learningOutcomes
              .split("\n")
              .filter((outcome) => outcome.trim())
          : [],
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Something went wrong");
      }

      toast({
        title: "Success",
        description: `Course ${isEdit ? "updated" : "created"} successfully`,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/admin/courses");
      }
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

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEdit ? "Edit Course" : "Create New Course"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update course information"
            : "Add a new course to the system"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Enter course title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-600">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">Short Description</Label>
            <Input
              id="shortDescription"
              {...form.register("shortDescription")}
              placeholder="Brief description for course cards"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Full Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Detailed course description"
              rows={4}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("difficulty", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                {...form.register("duration", { valueAsNumber: true })}
                placeholder="Course duration"
                min="1"
              />
              {form.formState.errors.duration && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.duration.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                {...form.register("price", { valueAsNumber: true })}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              {...form.register("tags")}
              placeholder="Separate tags with commas (e.g., computer basics, beginner, essential skills)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prerequisites">Prerequisites</Label>
            <Input
              id="prerequisites"
              {...form.register("prerequisites")}
              placeholder="Separate prerequisites with commas"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="syllabus">Syllabus</Label>
            <Textarea
              id="syllabus"
              {...form.register("syllabus")}
              placeholder="Course syllabus and structure"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="learningOutcomes">Learning Outcomes</Label>
            <Textarea
              id="learningOutcomes"
              {...form.register("learningOutcomes")}
              placeholder="Enter each learning outcome on a new line"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Course"
                : "Create Course"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
