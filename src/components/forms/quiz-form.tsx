// components/forms/quiz-form.tsx
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const quizFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  timeLimit: z.number().min(1).optional(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  showFeedback: z.boolean().optional(),
  allowReview: z.boolean().optional(),
  passingScore: z
    .number()
    .min(0)
    .max(100, "Passing score must be between 0 and 100"),
  maxAttempts: z.number().min(1).optional(),
  adaptiveDifficulty: z.boolean().optional(),
  requireMastery: z.boolean().optional(),
  practiceMode: z.boolean().optional(),
});

type QuizFormData = z.infer<typeof quizFormSchema>;

interface QuizFormProps {
  topicId: string;
  topic?: any;
  quiz?: any;
  onSuccess?: () => void;
  isEdit?: boolean;
}

export function QuizForm({
  topicId,
  topic,
  quiz,
  onSuccess,
  isEdit = false,
}: QuizFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<QuizFormData>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: {
      title: quiz?.title || "",
      description: quiz?.description || "",
      timeLimit: quiz?.timeLimit || undefined,
      shuffleQuestions: quiz?.shuffleQuestions || false,
      shuffleOptions: quiz?.shuffleOptions || false,
      showFeedback: quiz?.showFeedback ?? true,
      allowReview: quiz?.allowReview ?? true,
      passingScore: quiz?.passingScore || 80,
      maxAttempts: quiz?.maxAttempts || undefined,
      adaptiveDifficulty: quiz?.adaptiveDifficulty || false,
      requireMastery: quiz?.requireMastery || false,
      practiceMode: quiz?.practiceMode || false,
    },
  });

  const onSubmit = async (data: QuizFormData) => {
    setLoading(true);
    try {
      const url = isEdit
        ? `/api/quizzes/${quiz.id}`
        : `/api/topics/${topicId}/quizzes`;
      const method = isEdit ? "PUT" : "POST";

      // Clean up undefined values
      const payload = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Something went wrong");
      }

      const result = await response.json();

      toast({
        title: "Success",
        description: `Quiz ${isEdit ? "updated" : "created"} successfully`,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect to quiz questions page or back to topic
        if (isEdit) {
          router.push(`/admin/quizzes/${quiz.id}/builder`);
        } else {
          router.push(`/admin/quizzes/${result.id}/builder`);
        }
      }
    } catch (error: any) {
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
        <CardTitle>{isEdit ? "Edit Quiz" : "Create New Quiz"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update quiz settings and configuration"
            : topic
            ? `Add a new quiz to "${topic.title}"`
            : "Add a new quiz to the topic"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Enter quiz title"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Brief description of the quiz (optional)"
                rows={3}
              />
            </div>
          </div>

          <Separator />

          {/* Quiz Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Quiz Configuration</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  {...form.register("timeLimit", { valueAsNumber: true })}
                  placeholder="No limit"
                  min="1"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for no time limit
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passingScore">Passing Score (%)</Label>
                <Input
                  id="passingScore"
                  type="number"
                  {...form.register("passingScore", { valueAsNumber: true })}
                  placeholder="80"
                  min="0"
                  max="100"
                />
                {form.formState.errors.passingScore && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.passingScore.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttempts">Max Attempts</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  {...form.register("maxAttempts", { valueAsNumber: true })}
                  placeholder="Unlimited"
                  min="1"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for unlimited attempts
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Quiz Behavior */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Quiz Behavior</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shuffleQuestions"
                    {...form.register("shuffleQuestions")}
                  />
                  <Label htmlFor="shuffleQuestions" className="text-sm">
                    Shuffle Questions
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Randomize question order for each attempt
                </p>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="shuffleOptions"
                    {...form.register("shuffleOptions")}
                  />
                  <Label htmlFor="shuffleOptions" className="text-sm">
                    Shuffle Answer Options
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Randomize answer option order
                </p>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showFeedback"
                    {...form.register("showFeedback")}
                  />
                  <Label htmlFor="showFeedback" className="text-sm">
                    Show Feedback
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Display correct answers after completion
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowReview"
                    {...form.register("allowReview")}
                  />
                  <Label htmlFor="allowReview" className="text-sm">
                    Allow Review
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Let students review their answers
                </p>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="practiceMode"
                    {...form.register("practiceMode")}
                  />
                  <Label htmlFor="practiceMode" className="text-sm">
                    Practice Mode
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Quiz doesn't count toward progress
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Advanced Features */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Advanced Features</h3>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="adaptiveDifficulty"
                  {...form.register("adaptiveDifficulty")}
                />
                <Label htmlFor="adaptiveDifficulty" className="text-sm">
                  Adaptive Difficulty
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Adjust question difficulty based on student performance
              </p>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="requireMastery"
                  {...form.register("requireMastery")}
                />
                <Label htmlFor="requireMastery" className="text-sm">
                  Require Mastery
                </Label>
              </div>
              <p className="text-xs text-muted-foreground ml-6">
                Students must get all questions correct to pass
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : isEdit ? "Update Quiz" : "Create Quiz"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
