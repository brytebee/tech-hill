// components/questions/question-list.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Plus,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

type QuestionType =
  | "MULTIPLE_CHOICE"
  | "MULTIPLE_SELECT"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "LONG_ANSWER"
  | "MATCHING"
  | "ORDERING";

type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface Question {
  id: string;
  questionText: string;
  questionType: QuestionType;
  orderIndex: number;
  points: number;
  explanation?: string;
  hint?: string;
  difficulty: QuestionDifficulty;
  tags: string[];
  timeLimit?: number;
  allowPartialCredit: boolean;
  caseSensitive: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  options: Option[];
  quiz: {
    id: string;
    title: string;
    topic: {
      id: string;
      title: string;
      module: {
        id: string;
        title: string;
        course: {
          id: string;
          title: string;
        };
      };
    };
  };
}

interface QuestionListProps {
  questions: Question[];
  quizId: string;
}

const questionTypeLabels: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: "Multiple Choice",
  MULTIPLE_SELECT: "Multiple Select",
  TRUE_FALSE: "True/False",
  SHORT_ANSWER: "Short Answer",
  LONG_ANSWER: "Long Answer",
  MATCHING: "Matching",
  ORDERING: "Ordering",
};

const difficultyColors = {
  EASY: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HARD: "bg-red-100 text-red-800",
};

export function QuestionList({ questions, quizId }: QuestionListProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const sortedQuestions = [...questions].sort(
    (a, b) => a.orderIndex - b.orderIndex
  );

  const handleDeleteQuestion = async (question: Question) => {
    setSelectedQuestion(question);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedQuestion) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/admin/questions/${selectedQuestion.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      toast.success("Question deleted successfully");
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete question");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedQuestion(null);
    }
  };

  const handleDuplicateQuestion = async (question: Question) => {
    try {
      const response = await fetch(
        `/api/admin/questions/${question.id}/duplicate`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to duplicate question");
      }

      toast.success("Question duplicated successfully");
      router.refresh();
    } catch (error) {
      console.error("Duplicate error:", error);
      toast.error("Failed to duplicate question");
    }
  };

  const toggleQuestionStatus = async (question: Question) => {
    try {
      const response = await fetch(`/api/admin/questions/${question.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !question.isActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update question status");
      }

      toast.success(
        `Question ${
          question.isActive ? "deactivated" : "activated"
        } successfully`
      );
      router.refresh();
    } catch (error) {
      console.error("Status update error:", error);
      toast.error("Failed to update question status");
    }
  };

  const getCorrectAnswersCount = (question: Question) => {
    if (
      question.questionType === "SHORT_ANSWER" ||
      question.questionType === "LONG_ANSWER"
    ) {
      return "Text Answer";
    }
    return question.options.filter((opt) => opt.isCorrect).length;
  };

  const renderQuestionPreview = (question: Question) => {
    const preview =
      question.questionText.length > 100
        ? question.questionText.substring(0, 100) + "..."
        : question.questionText;

    return <p className="text-sm text-gray-600 mt-1">{preview}</p>;
  };

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No questions yet
        </h3>
        <p className="text-gray-500 mb-4">
          Get started by creating your first question for this quiz.
        </p>
        <Button onClick={() => router.push(`/admin/quizzes/${quizId}/builder`)}>
          <Plus className="h-4 w-4 mr-2" />
          Create First Question
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Quiz Questions ({questions.length})
          </h2>
          <p className="text-gray-600 mt-1">
            Manage questions for "{questions[0]?.quiz.title}"
          </p>
        </div>
        <Button onClick={() => router.push(`/admin/quizzes/${quizId}/builder`)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>

      {/* Quiz Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{questions[0]?.quiz.title}</h3>
              <p className="text-sm text-gray-600">
                {questions[0]?.quiz.topic.module.course.title} •{" "}
                {questions[0]?.quiz.topic.module.title} •{" "}
                {questions[0]?.quiz.topic.title}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}
              </p>
              <p className="text-sm text-gray-600">
                Active Questions: {questions.filter((q) => q.isActive).length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      <div className="grid gap-4">
        {sortedQuestions.map((question, index) => (
          <Card
            key={question.id}
            className={!question.isActive ? "opacity-60" : ""}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge variant="outline" className="font-mono">
                      #{index + 1}
                    </Badge>
                    <Badge variant="secondary">
                      {questionTypeLabels[question.questionType]}
                    </Badge>
                    <Badge className={difficultyColors[question.difficulty]}>
                      {question.difficulty}
                    </Badge>
                    <Badge variant="outline">{question.points} pts</Badge>
                    {!question.isActive && (
                      <Badge variant="destructive">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                    {question.timeLimit && (
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        {question.timeLimit}s
                      </Badge>
                    )}
                  </div>

                  <CardTitle className="text-lg leading-relaxed">
                    {question.questionText}
                  </CardTitle>

                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                    <span>Options: {question.options.length}</span>
                    <span>Correct: {getCorrectAnswersCount(question)}</span>
                    {question.allowPartialCredit && (
                      <span className="text-blue-600">Partial Credit</span>
                    )}
                    {question.hint && (
                      <span className="text-purple-600">Has Hint</span>
                    )}
                    {question.explanation && (
                      <span className="text-green-600">Has Explanation</span>
                    )}
                  </div>

                  {question.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {question.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/admin/quizzes/${quizId}/questions/${question.id}`
                        )
                      }
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/admin/quizzes/${quizId}/questions/${question.id}/edit`
                        )
                      }
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Question
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDuplicateQuestion(question)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => toggleQuestionStatus(question)}
                    >
                      {question.isActive ? (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteQuestion(question)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            {/* Show options preview for multiple choice */}
            {(question.questionType === "MULTIPLE_CHOICE" ||
              question.questionType === "MULTIPLE_SELECT" ||
              question.questionType === "TRUE_FALSE") && (
              <CardContent>
                <div className="space-y-2">
                  {question.options.slice(0, 3).map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      {option.isCorrect ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span
                        className={
                          option.isCorrect
                            ? "font-medium text-green-700"
                            : "text-gray-600"
                        }
                      >
                        {option.text}
                      </span>
                    </div>
                  ))}
                  {question.options.length > 3 && (
                    <p className="text-xs text-gray-500">
                      +{question.options.length - 3} more options...
                    </p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot
              be undone.
              <br />
              <br />
              <strong>"{selectedQuestion?.questionText}"</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
