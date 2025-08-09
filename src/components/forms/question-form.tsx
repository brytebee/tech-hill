// components/forms/question-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, MoveUp, MoveDown } from "lucide-react";

const optionSchema = z.object({
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean().default(false),
  explanation: z.string().optional(),
});

const questionFormSchema = z.object({
  questionText: z.string().min(1, "Question text is required"),
  questionType: z.enum([
    'MULTIPLE_CHOICE',
    'MULTIPLE_SELECT',
    'TRUE_FALSE',
    'SHORT_ANSWER',
    'LONG_ANSWER',
    'MATCHING',
    'ORDERING'
  ]).default('MULTIPLE_CHOICE'),
  points: z.number().min(1, "Points must be at least 1").default(1),
  explanation: z.string().optional(),
  hint: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  tags: z.string().optional(),
  timeLimit: z.number().min(1).optional(),
  allowPartialCredit: z.boolean().default(false),
  caseSensitive: z.boolean().default(false),
  options: z.array(optionSchema).optional(),
});

type QuestionFormData = z.infer<typeof questionFormSchema>;

interface QuestionFormProps {
  quizId: string;
  quiz?: any;
  question?: any;
  onSuccess?: () => void;
  isEdit?: boolean;
}

const QUESTION_TYPES = [
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice (Single Answer)', requiresOptions: true },
  { value: 'MULTIPLE_SELECT', label: 'Multiple Select (Multiple Answers)', requiresOptions: true },
  { value: 'TRUE_FALSE', label: 'True/False', requiresOptions: true },
  { value: 'SHORT_ANSWER', label: 'Short Answer', requiresOptions: false },
  { value: 'LONG_ANSWER', label: 'Long Answer', requiresOptions: false },
  { value: 'MATCHING', label: 'Matching', requiresOptions: true },
  { value: 'ORDERING', label: 'Ordering', requiresOptions: true },
];

export function QuestionForm({
  quizId,
  quiz,
  question,
  onSuccess,
  isEdit = false,
}: QuestionFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      questionText: question?.questionText || "",
      questionType: question?.questionType || 'MULTIPLE_CHOICE',
      points: question?.points || 1,
      explanation: question?.explanation || "",
      hint: question?.hint || "",
      difficulty: question?.difficulty || 'MEDIUM',
      tags: question?.tags?.join(", ") || "",
      timeLimit: question?.timeLimit || undefined,
      allowPartialCredit: question?.allowPartialCredit || false,
      caseSensitive: question?.caseSensitive || false,
      options: question?.options || [
        { text: "", isCorrect: true, explanation: "" },
        { text: "", isCorrect: false, explanation: "" },
        { text: "", isCorrect: false, explanation: "" },
        { text: "", isCorrect: false, explanation: "" },
      ],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const questionType = form.watch("questionType");

  // Update options when question type changes
  useEffect(() => {
    const currentType = QUESTION_TYPES.find(type => type.value === questionType);
    
    if (!currentType?.requiresOptions) {
      // Clear options for text-based questions
      form.setValue("options", []);
      return;
    }

    if (questionType === 'TRUE_FALSE') {
      // Set up True/False options
      form.setValue("options", [
        { text: "True", isCorrect: true, explanation: "" },
        { text: "False", isCorrect: false, explanation: "" },
      ]);
    } else if (fields.length === 0) {
      // Initialize with default options for other types
      form.setValue("options", [
        { text: "", isCorrect: true, explanation: "" },
        { text: "", isCorrect: false, explanation: "" },
        { text: "", isCorrect: false, explanation: "" },
        { text: "", isCorrect: false, explanation: "" },
      ]);
    }
  }, [questionType, form, fields.length]);

  const requiresOptions = QUESTION_TYPES.find(type => type.value === questionType)?.requiresOptions;

  const addOption = () => {
    append({ text: "", isCorrect: false, explanation: "" });
  };

  const removeOption = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  const moveOption = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < fields.length) {
      move(index, newIndex);
    }
  };

  const onSubmit = async (data: QuestionFormData) => {
    setLoading(true);
    try {
      const url = isEdit 
        ? `/api/questions/${question.id}` 
        : `/api/quizzes/${quizId}/questions`;
      const method = isEdit ? "PUT" : "POST";

      // Process form data
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
        options: requiresOptions ? data.options?.filter(opt => opt.text.trim()) : undefined,
      };

      // Remove undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === "") {
          delete payload[key];
        }
      });

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
        description: `Question ${isEdit ? "updated" : "created"} successfully`,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        // Redirect back to quiz questions list
        router.push(`/admin/quizzes/${quizId}/questions`);
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
        <CardTitle>{isEdit ? "Edit Question" : "Create New Question"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update question details and options"
            : quiz 
              ? `Add a new question to "${quiz.title}"`
              : "Add a new question to the quiz"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Question Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="questionText">Question Text</Label>
              <Textarea
                id="questionText"
                {...form.register("questionText")}
                placeholder="Enter your question here"
                rows={3}
              />
              {form.formState.errors.questionText && (
                <p className="text-sm text-red-600">
                  {form.formState.errors.questionText.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="questionType">Question Type</Label>
                <Select
                  onValueChange={(value) => form.setValue("questionType", value as any)}
                  defaultValue={form.watch("questionType")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select question type" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUESTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select
                  onValueChange={(value) => form.setValue("difficulty", value as any)}
                  defaultValue={form.watch("difficulty")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  type="number"
                  {...form.register("points", { valueAsNumber: true })}
                  min="1"
                />
                {form.formState.errors.points && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.points.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                <Input
                  id="timeLimit"
                  type="number"
                  {...form.register("timeLimit", { valueAsNumber: true })}
                  placeholder="No limit"
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  {...form.register("tags")}
                  placeholder="Separate with commas"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Answer Options */}
          {requiresOptions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Answer Options</h3>
                {questionType !== 'TRUE_FALSE' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">
                        Option {index + 1}
                      </Label>
                      <div className="flex items-center space-x-2">
                        {questionType !== 'TRUE_FALSE' && (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => moveOption(index, 'up')}
                              disabled={index === 0}
                            >
                              <MoveUp className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => moveOption(index, 'down')}
                              disabled={index === fields.length - 1}
                            >
                              <MoveDown className="w-4 h-4" />
                            </Button>
                            {fields.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                      <div className="md:col-span-1 flex items-center">
                        <Checkbox
                          {...form.register(`options.${index}.isCorrect`)}
                        />
                        <Label className="ml-2 text-xs text-muted-foreground">
                          Correct
                        </Label>
                      </div>
                      
                      <div className="md:col-span-6">
                        <Input
                          {...form.register(`options.${index}.text`)}
                          placeholder="Option text"
                        />
                      </div>
                      
                      <div className="md:col-span-5">
                        <Input
                          {...form.register(`options.${index}.explanation`)}
                          placeholder="Explanation (optional)"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Additional Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Settings</h3>
            
            <div className="space-y-2">
              <Label htmlFor="hint">Hint</Label>
              <Input
                id="hint"
                {...form.register("hint")}
                placeholder="Optional hint for students"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="explanation">Explanation</Label>
              <Textarea
                id="explanation"
                {...form.register("explanation")}
                placeholder="Detailed explanation shown after answering"
                rows={3}
              />
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowPartialCredit"
                  {...form.register("allowPartialCredit")}
                />
                <Label htmlFor="allowPartialCredit" className="text-sm">
                  Allow Partial Credit
                </Label>
              </div>

              {['SHORT_ANSWER', 'LONG_ANSWER'].includes(questionType) && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="caseSensitive"
                    {...form.register("caseSensitive")}
                  />
                  <Label htmlFor="caseSensitive" className="text-sm">
                    Case Sensitive
                  </Label>
                </div>
              )}
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
              {loading
                ? "Saving..."
                : isEdit
                ? "Update Question"
                : "Create Question"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
