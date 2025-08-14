// components/quiz/quiz-builder.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { QuestionEditor } from "./question-editor";
import { QuizPreview } from "./quiz-preview";
import { Plus, Save, Eye, EyeOff, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export interface QuestionData {
  id?: string;
  questionText: string;
  questionType:
    | "MULTIPLE_CHOICE"
    | "MULTIPLE_SELECT"
    | "TRUE_FALSE"
    | "SHORT_ANSWER"
    | "LONG_ANSWER"
    | "MATCHING"
    | "ORDERING";
  points: number;
  explanation?: string;
  hint?: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  tags: string[];
  timeLimit?: number;
  allowPartialCredit: boolean;
  caseSensitive: boolean;
  options: {
    id?: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }[];
  orderIndex?: number;
  isActive?: boolean;
}

interface QuizBuilderProps {
  quiz: any;
}

export function QuizBuilder({ quiz }: QuizBuilderProps) {
  const [questions, setQuestions] = useState<QuestionData[]>(() => {
    return quiz.questions.map((q: any) => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType,
      points: q.points,
      explanation: q.explanation || "",
      hint: q.hint || "",
      difficulty: q.difficulty,
      tags: q.tags || [],
      timeLimit: q.timeLimit,
      allowPartialCredit: q.allowPartialCredit,
      caseSensitive: q.caseSensitive,
      options: q.options.map((opt: any) => ({
        id: opt.id,
        text: opt.text,
        isCorrect: opt.isCorrect,
        explanation: opt.explanation || "",
      })),
      orderIndex: q.orderIndex,
      isActive: q.isActive,
    }));
  });

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");
  const router = useRouter();
  const { toast } = useToast();

  const addQuestion = () => {
    const newQuestion: QuestionData = {
      questionText: "",
      questionType: "MULTIPLE_CHOICE",
      points: 1,
      explanation: "",
      hint: "",
      difficulty: "MEDIUM",
      tags: [],
      allowPartialCredit: false,
      caseSensitive: false,
      options: [
        { text: "", isCorrect: true, explanation: "" },
        { text: "", isCorrect: false, explanation: "" },
        { text: "", isCorrect: false, explanation: "" },
        { text: "", isCorrect: false, explanation: "" },
      ],
      orderIndex: questions.length,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updatedQuestion: QuestionData) => {
    const newQuestions = [...questions];
    newQuestions[index] = updatedQuestion;
    setQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    // Update order indices
    const reorderedQuestions = newQuestions.map((q, i) => ({
      ...q,
      orderIndex: i,
    }));
    setQuestions(reorderedQuestions);
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < questions.length) {
      const newQuestions = [...questions];
      [newQuestions[index], newQuestions[newIndex]] = [
        newQuestions[newIndex],
        newQuestions[index],
      ];
      // Update order indices
      newQuestions[index].orderIndex = index;
      newQuestions[newIndex].orderIndex = newIndex;
      setQuestions(newQuestions);
    }
  };

  const saveQuiz = async () => {
    setLoading(true);
    try {
      // Validate all questions
      const validationErrors = [];
      questions.forEach((question, index) => {
        if (!question.questionText.trim()) {
          validationErrors.push(
            `Question ${index + 1}: Question text is required`
          );
        }

        const requiresOptions = [
          "MULTIPLE_CHOICE",
          "MULTIPLE_SELECT",
          "TRUE_FALSE",
          "MATCHING",
          "ORDERING",
        ].includes(question.questionType);
        if (requiresOptions) {
          const validOptions = question.options.filter((opt) =>
            opt.text.trim()
          );
          if (validOptions.length === 0) {
            validationErrors.push(
              `Question ${index + 1}: At least one option is required`
            );
          }

          const correctAnswers = validOptions.filter((opt) => opt.isCorrect);
          if (correctAnswers.length === 0) {
            validationErrors.push(
              `Question ${index + 1}: At least one correct answer is required`
            );
          }

          if (
            (question.questionType === "MULTIPLE_CHOICE" ||
              question.questionType === "TRUE_FALSE") &&
            correctAnswers.length > 1
          ) {
            validationErrors.push(
              `Question ${
                index + 1
              }: Only one correct answer allowed for this question type`
            );
          }
        }
      });

      if (validationErrors.length > 0) {
        toast({
          title: "Validation Error",
          description: validationErrors[0],
          variant: "destructive",
        });
        return;
      }

      // Save all questions
      const response = await fetch(`/api/quizzes/${quiz.id}/questions/bulk`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save quiz");
      }

      toast({
        title: "Success",
        description: "Quiz saved successfully",
      });

      // Redirect user back to the previous page
      router.back();
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

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-6">
      {/* Quiz Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {quiz.title}
                <Badge variant="outline">{questions.length} Questions</Badge>
                <Badge variant="secondary">{totalPoints} Points</Badge>
              </CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setActiveTab(activeTab === "preview" ? "builder" : "preview")
                }
              >
                {activeTab === "preview" ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {activeTab === "preview" ? "Edit" : "Preview"}
              </Button>
              <Button onClick={saveQuiz} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? "Saving..." : "Save Quiz"}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quiz Builder Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="builder">Builder</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          {questions.map((question, index) => (
            <QuestionEditor
              key={index}
              question={question}
              index={index}
              onUpdate={(updatedQuestion) =>
                updateQuestion(index, updatedQuestion)
              }
              onRemove={() => removeQuestion(index)}
              onMoveUp={() => moveQuestion(index, "up")}
              onMoveDown={() => moveQuestion(index, "down")}
              canMoveUp={index > 0}
              canMoveDown={index < questions.length - 1}
              totalQuestions={questions.length}
            />
          ))}

          {questions.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  No questions yet. Add your first question to get started.
                </p>
                <Button onClick={addQuestion}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Question
                </Button>
              </CardContent>
            </Card>
          )}

          {questions.length > 0 && (
            <div className="text-center">
              <Button onClick={addQuestion} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="preview">
          <QuizPreview quiz={quiz} questions={questions} />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Quiz Settings</CardTitle>
              <CardDescription>
                Configure quiz behavior and requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Time Limit:</span>{" "}
                  {quiz.timeLimit ? `${quiz.timeLimit} minutes` : "No limit"}
                </div>
                <div>
                  <span className="font-medium">Passing Score:</span>{" "}
                  {quiz.passingScore}%
                </div>
                <div>
                  <span className="font-medium">Max Attempts:</span>{" "}
                  {quiz.maxAttempts || "Unlimited"}
                </div>
                <div>
                  <span className="font-medium">Shuffle Questions:</span>{" "}
                  {quiz.shuffleQuestions ? "Yes" : "No"}
                </div>
                <div>
                  <span className="font-medium">Shuffle Options:</span>{" "}
                  {quiz.shuffleOptions ? "Yes" : "No"}
                </div>
                <div>
                  <span className="font-medium">Show Feedback:</span>{" "}
                  {quiz.showFeedback ? "Yes" : "No"}
                </div>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/quizzes/${quiz.id}/edit`)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Quiz Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
