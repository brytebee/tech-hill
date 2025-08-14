// components/students/QuizInterface.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  FileText,
  Award,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Save,
  Send,
  Timer,
} from "lucide-react";

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  id: string;
  questionText: string;
  questionType:
    | "MULTIPLE_CHOICE"
    | "MULTIPLE_SELECT"
    | "TRUE_FALSE"
    | "SHORT_ANSWER"
    | "ESSAY";
  points: number;
  required: boolean;
  options?: QuizOption[];
  sampleAnswer?: string;
  minWords?: number;
  maxWords?: number;
}

interface Quiz {
  id: string;
  title: string;
  description?: string;
  passingScore: number;
  timeLimit?: number;
  allowRetakes: boolean;
  maxAttempts?: number;
  shuffleQuestions: boolean;
  showResults: boolean;
  topic: {
    id: string;
    title: string;
    module: {
      title: string;
      course: {
        id: string;
        title: string;
      };
    };
  };
  questions: QuizQuestion[];
}

interface QuizInterfaceProps {
  quiz: Quiz;
  attempts: any[];
  userId: string;
  topicId?: string;
}

type Answer = string | string[];

export function QuizInterface({
  quiz,
  attempts,
  userId,
  topicId,
}: QuizInterfaceProps) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [timeLeft, setTimeLeft] = useState(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // Timer effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          // Auto-submit when time runs out
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleAnswerChange = (questionId: string, answer: Answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  const getProgressPercentage = () => {
    return Math.round((getAnsweredCount() / quiz.questions.length) * 100);
  };

  const handleSubmitQuiz = async () => {
    setIsSubmitting(true);
    try {
      // In real app: submit answers to API
      const submitData = {
        quizId: quiz.id,
        userId,
        topicId,
        answers,
        timeSpent: quiz.timeLimit
          ? quiz.timeLimit * 60 - (timeLeft || 0)
          : null,
      };

      console.log("Submitting quiz:", submitData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to results page
      router.push(`/student/quiz/${quiz.id}/results?attempt=latest`);
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      setIsSubmitting(false);
    }
  };

  const canSubmit = () => {
    const requiredQuestions = quiz.questions.filter((q) => q.required);
    const answeredRequired = requiredQuestions.filter(
      (q) => answers[q.id]
    ).length;
    return answeredRequired === requiredQuestions.length;
  };

  const renderQuestion = (question: QuizQuestion, index: number) => {
    const answer = answers[question.id];

    switch (question.questionType) {
      case "MULTIPLE_CHOICE":
      case "TRUE_FALSE":
        return (
          <RadioGroup
            value={(answer as string) || ""}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.id} id={option.id} />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "MULTIPLE_SELECT":
        const selectedOptions = (answer as string[]) || [];
        return (
          <div className="space-y-3">
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={selectedOptions.includes(option.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAnswerChange(question.id, [
                        ...selectedOptions,
                        option.id,
                      ]);
                    } else {
                      handleAnswerChange(
                        question.id,
                        selectedOptions.filter((id) => id !== option.id)
                      );
                    }
                  }}
                />
                <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                  {option.text}
                </Label>
              </div>
            ))}
          </div>
        );

      case "SHORT_ANSWER":
        return (
          <Textarea
            placeholder="Enter your answer..."
            value={(answer as string) || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="min-h-[100px]"
          />
        );

      case "ESSAY":
        const wordCount = (((answer as string) || "").match(/\S+/g) || [])
          .length;
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="Write your essay here..."
              value={(answer as string) || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="min-h-[200px]"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>Word count: {wordCount}</span>
              {question.minWords && (
                <span
                  className={
                    wordCount >= question.minWords
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  Minimum: {question.minWords} words
                </span>
              )}
            </div>
          </div>
        );

      default:
        return <div>Unsupported question type</div>;
    }
  };

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{quiz.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {quiz.topic.module.course.title}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {quiz.questions.length} questions
                </span>
                <span className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  {quiz.passingScore}% to pass
                </span>
              </div>
            </div>

            <div className="text-right">
              {timeLeft !== null && (
                <div
                  className={`flex items-center gap-2 text-lg font-mono ${
                    timeLeft < 300 ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  <Timer className="h-5 w-5" />
                  {formatTime(timeLeft)}
                </div>
              )}
              {attempts.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Attempt {attempts.length + 1} of {quiz.maxAttempts || "∞"}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Quiz Progress</span>
            <span className="text-sm text-gray-600">
              {getAnsweredCount()} of {quiz.questions.length} answered
            </span>
          </div>
          <Progress value={getProgressPercentage()} className="h-2" />
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </Badge>
              <Badge className="bg-blue-100 text-blue-800">
                {currentQ.points} points
              </Badge>
              {currentQ.required && <Badge variant="secondary">Required</Badge>}
            </div>

            <div className="flex items-center gap-2">
              {answers[currentQ.id] && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>

          <CardTitle className="text-lg leading-relaxed mt-4">
            {currentQ.questionText}
          </CardTitle>
        </CardHeader>

        <CardContent>{renderQuestion(currentQ, currentQuestion)}</CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-2">
          {quiz.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                index === currentQuestion
                  ? "bg-blue-600 text-white"
                  : answers[quiz.questions[index].id]
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion < quiz.questions.length - 1 ? (
          <Button
            onClick={() =>
              setCurrentQuestion((prev) =>
                Math.min(quiz.questions.length - 1, prev + 1)
              )
            }
          >
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <AlertDialog
            open={showSubmitDialog}
            onOpenChange={setShowSubmitDialog}
          >
            <AlertDialogTrigger asChild>
              <Button
                className="bg-green-600 hover:bg-green-700"
                disabled={!canSubmit()}
              >
                <Send className="h-4 w-4 mr-2" />
                Submit Quiz
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    You have answered {getAnsweredCount()} out of{" "}
                    {quiz.questions.length} questions.
                  </p>
                  {!canSubmit() && (
                    <div className="text-red-600 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Please answer all required questions before submitting.
                    </div>
                  )}
                  <p>
                    Once submitted, you cannot change your answers. Are you sure
                    you want to submit?
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Review Answers</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleSubmitQuiz}
                  disabled={!canSubmit() || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Quiz"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {/* Auto-save indicator */}
      <div className="text-center">
        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <Save className="h-3 w-3" />
          Answers are saved automatically
        </p>
      </div>
    </div>
  );
}
