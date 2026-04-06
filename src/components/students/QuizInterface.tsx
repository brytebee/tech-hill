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
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export interface QuizOption {
  id: string;
  text: string;
  orderIndex: number;
}

export interface QuizQuestion {
  id: string;
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
  required: boolean;
  options: QuizOption[];
  hint?: string;
  timeLimit?: number;
  allowPartialCredit?: boolean;
  caseSensitive?: boolean;
  orderIndex: number;
}

export interface Quiz {
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
      id: string;
      title: string;
      course: {
        id: string;
        title: string;
      };
    };
  };
  questions: QuizQuestion[];
}

export interface AttemptData {
  id: string;
  score: number;
  passed: boolean;
  startedAt: Date;
  completedAt: Date | null;
  timeSpent: number | null;
  questionsCorrect: number;
  questionsTotal: number;
}

export interface QuizMetadata {
  totalQuestions: number;
  totalPoints: number;
  attemptNumber: number;
  attemptsRemaining: number | null;
  hasPassedQuiz: boolean;
}

export interface QuizInterfaceProps {
  quiz: Quiz;
  attempts: AttemptData[];
  userId: string;
  topicId?: string;
  metadata: QuizMetadata;
  activeAttempt: any;
}

type Answer = string | string[];

export function QuizInterface({
  quiz,
  attempts,
  userId,
  topicId,
  metadata,
  activeAttempt,
}: QuizInterfaceProps) {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>(
    (activeAttempt?.draftAnswers as Record<string, Answer>) || {}
  );
  const [timeLeft, setTimeLeft] = useState(
    quiz.timeLimit ? quiz.timeLimit * 60 : null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [quizStartTime] = useState(Date.now());

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

  // Auto-save answers periodically
  useEffect(() => {
    const saveInterval = setInterval(async () => {
      if (Object.keys(answers).length > 0) {
        try {
          await fetch(`/api/student/quiz/${quiz.id}/draft`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ attemptId: activeAttempt.id, answers })
          });
        } catch (error) {
          console.error("Failed to auto-save:", error);
        }
      }
    }, 15000); // Save every 15 seconds for snappier experience

    return () => clearInterval(saveInterval);
  }, [answers, quiz.id, activeAttempt?.id]);

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
      const timeSpent = Math.floor((Date.now() - quizStartTime) / 1000); // Convert to seconds

      const submitData = {
        answers,
        timeSpent,
        topicId,
      };

      const response = await fetch(`/api/student/quiz/${quiz.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit quiz");
      }

      const result = await response.json();

      toast.success("Quiz submitted successfully!");

      // Redirect to results page
      router.push(
        `/student/quiz/${quiz.id}/results?attempt=${result.attempt.id}`
      );
    } catch (error: any) {
      console.error("Failed to submit quiz:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit quiz"
      );
      setIsSubmitting(false);
    }
  };

  const canSubmit = () => {
    const requiredQuestions = quiz.questions.filter((q) => q.required);
    const answeredRequired = requiredQuestions.filter((q) => {
      const ans = answers[q.id];
      if (!ans) return false;
      if (typeof ans === "string") return ans.trim() !== "";
      if (Array.isArray(ans)) return ans.length > 0;
      return false;
    }).length;
    return answeredRequired === requiredQuestions.length;
  };

  const renderQuestion = (question: QuizQuestion, index: number) => {
    const answer = answers[question.id];

    switch (question.questionType) {
      case "MULTIPLE_CHOICE":
      case "TRUE_FALSE":
        return (
          <div className="space-y-3">
            <RadioGroup
              value={(answer as string) || ""}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
              className="grid gap-3"
            >
              {question.options.map((option) => (
                <div key={option.id} className="relative">
                  <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                  <Label
                    htmlFor={option.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/80 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/50 dark:peer-data-[state=checked]:border-blue-500 dark:peer-data-[state=checked]:bg-blue-900/20"
                  >
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {option.text}
                    </span>
                    <div className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-600 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-600 flex items-center justify-center">
                       {/* Circle Indicator */}
                       {(answer as string) === option.id && <div className="h-2 w-2 rounded-full bg-white shadow-sm" />}
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "MULTIPLE_SELECT":
        const selectedOptions = (answer as string[]) || [];
        return (
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Select all that apply:</p>
            <div className="grid gap-3">
              {question.options.map((option) => (
                <div key={option.id} className="relative">
                  <Checkbox
                    id={option.id}
                    checked={selectedOptions.includes(option.id)}
                    className="peer sr-only"
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
                  <Label
                    htmlFor={option.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/80 peer-data-[state=checked]:border-blue-600 peer-data-[state=checked]:bg-blue-50/50 dark:peer-data-[state=checked]:border-blue-500 dark:peer-data-[state=checked]:bg-blue-900/20"
                  >
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {option.text}
                    </span>
                    <div className={`h-4 w-4 rounded-[4px] border ${selectedOptions.includes(option.id) ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-600'} flex items-center justify-center transition-colors`}>
                       {selectedOptions.includes(option.id) && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case "SHORT_ANSWER":
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="Enter your short answer..."
              value={(answer as string) || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="min-h-[100px] border-slate-200 dark:border-slate-800 dark:bg-slate-900/50 focus-visible:ring-blue-500 rounded-xl resize-y"
            />
            {question.caseSensitive && (
              <p className="text-xs font-medium text-amber-600 dark:text-amber-500 flex items-center gap-1.5 mt-2">
                <AlertTriangle className="h-3.5 w-3.5" /> Note: This exact answer is case-sensitive.
              </p>
            )}
          </div>
        );

      case "LONG_ANSWER":
        const wordCount = (((answer as string) || "").match(/\S+/g) || [])
          .length;
        return (
          <div className="space-y-2">
            <Textarea
              placeholder="Write your detailed answer here..."
              value={(answer as string) || ""}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              className="min-h-[200px] border-slate-200 dark:border-slate-800 dark:bg-slate-900/50 focus-visible:ring-blue-500 rounded-xl resize-y p-5 leading-relaxed"
            />
            <div className="flex items-center justify-between text-xs font-medium bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-lg mt-2">
              <span className="text-slate-600 dark:text-slate-400">Word count: <strong className="text-slate-900 dark:text-white">{wordCount}</strong></span>
              <span className="text-blue-600 dark:text-blue-400 opacity-90">
                Detailed answers are manually graded
              </span>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/30 font-medium">
            Unsupported question type: {question.questionType}
          </div>
        );
    }
  };

  const currentQ = quiz.questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in relative z-10 pb-20">
      
      {/* Sticky Header Status Bar */}
      <div className="sticky top-[72px] z-40 -mx-4 sm:mx-0 px-4 sm:px-0 py-2 sm:py-0 w-auto">
         <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-y sm:border sm:rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
           {/* Progress Line */}
           <div className="w-full md:w-1/2">
             <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5"><Save className="h-3 w-3" /> Auto-Saving...</span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  {getAnsweredCount()} / {quiz.questions.length} <span className="opacity-70 text-[10px] ml-1 uppercase">Filled</span>
                </span>
             </div>
             <Progress value={getProgressPercentage()} className="h-2 bg-slate-100 dark:bg-slate-800 shadow-inner" />
           </div>

           {/* Metrics */}
           <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 divide-x divide-slate-200 dark:divide-slate-800">
             <div className="flex items-center gap-1.5 sm:pl-0 sm:border-0 border-l pl-3 ml-3 sm:ml-0 border-slate-200 dark:border-slate-800 sm:w-auto w-full">
               <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pass</span>
               <span className="text-sm font-bold text-slate-900 dark:text-white">{quiz.passingScore}%</span>
             </div>
             {timeLeft !== null && (
                <div className="pl-3 sm:pl-6 flex items-center gap-2">
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold tracking-tight shadow-sm transition-colors ${
                      timeLeft < 300
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/30 animate-pulse ring-4 ring-red-500/10"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    <Timer className={`h-4 w-4 ${timeLeft < 300 ? 'animate-bounce' : ''}`} />
                    {formatTime(timeLeft)}
                  </div>
                </div>
              )}
           </div>
         </div>
      </div>

      {/* Main Core Form Content */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

        {/* Question Paginator Side */}
        <Card className="lg:w-72 shrink-0 border-slate-200 dark:border-slate-800 shadow-sm sticky top-[160px] hidden lg:block overflow-hidden">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/50 pb-4">
             <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
               <Award className="h-4.5 w-4.5 text-blue-500" /> Assessment Grid
             </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
             <div className="grid grid-cols-5 gap-2">
               {quiz.questions.map((_, index) => {
                 const isAnswered = answers[quiz.questions[index].id];
                 const isActive = index === currentQuestion;
                 return (
                   <button
                     key={index}
                     onClick={() => setCurrentQuestion(index)}
                     className={`w-full aspect-square rounded-xl text-sm font-bold transition-all shadow-sm ${
                       isActive
                         ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25 ring-2 ring-blue-600/20 ring-offset-2 dark:ring-offset-slate-950 scale-105"
                         : isAnswered
                         ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30 hover:bg-green-200 dark:hover:bg-green-500/30"
                         : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-500"
                     }`}
                   >
                     {index + 1}
                   </button>
                 );
               })}
             </div>
             {attempts.length > 0 && (
                <div className="mt-6 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/50 text-center">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Attempt</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {metadata.attemptNumber} <span className="text-slate-400 dark:text-slate-500">of</span> {quiz.maxAttempts || "∞"}
                  </p>
                </div>
              )}
          </CardContent>
        </Card>

        {/* Primary Question Rendering Area */}
        <div className="flex-1 w-full flex flex-col gap-6">
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            {/* Soft decorative background pulse for the active question form */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-800/50 pt-8 pb-6 relative z-10">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider py-1 px-3 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 shadow-sm bg-white dark:bg-slate-900">
                    Question {currentQuestion + 1} <span className="opacity-50 mx-1">/</span> {quiz.questions.length}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 font-bold border-0 hover:bg-blue-100 py-1 px-3">
                    {currentQ.points} points
                  </Badge>
                  {currentQ.required && <Badge variant="secondary" className="font-bold py-1 shadow-sm dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Required</Badge>}
                  {currentQ.timeLimit && (
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/30 dark:bg-amber-900/10 dark:text-amber-400 font-bold py-1">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {currentQ.timeLimit}s cap
                    </Badge>
                  )}
                </div>

                <div className="shrink-0 flex items-center justify-end">
                  {answers[currentQ.id] && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-500/10 py-1.5 px-3 rounded-full border border-green-200 dark:border-green-500/20">
                      <CheckCircle className="h-4 w-4" /> Answered
                    </div>
                  )}
                </div>
              </div>

              <CardTitle className="text-2xl font-bold leading-relaxed text-slate-900 dark:text-white mt-6 break-words">
                {currentQ.questionText}
              </CardTitle>

              {currentQ.hint && (
                <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl flex items-start gap-3 w-full">
                  <div className="mt-0.5 rounded-full p-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="text-blue-800 dark:text-blue-300 text-sm">
                    <strong className="block font-bold mb-0.5">Hint</strong> 
                    <p className="opacity-90 leading-relaxed">{currentQ.hint}</p>
                  </div>
                </div>
              )}
            </CardHeader>

            <CardContent className="pt-8 pb-10 sm:px-8 relative z-10">
              {renderQuestion(currentQ, currentQuestion)}
            </CardContent>
          </Card>

          {/* Form Actions (Prev, Next, Paginators Mobile) */}
          <div className="flex flex-col gap-6">
             {/* Mobile only paginator */}
             <div className="lg:hidden">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Jump to Question:</p>
                <div className="flex flex-wrap items-center gap-2">
                  {quiz.questions.map((_, index) => {
                    const isAnswered = answers[quiz.questions[index].id];
                    const isActive = index === currentQuestion;
                    return (
                      <button
                        key={index}
                        onClick={() => setCurrentQuestion(index)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all shadow-sm ${
                          isActive
                            ? "bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-600/20 ring-offset-1 dark:ring-offset-slate-950 scale-105"
                            : isAnswered
                            ? "bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/30"
                            : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
             </div>

             {/* Action Bar */}
             <div className="flex items-center justify-between p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  className="w-full sm:w-auto h-12 font-semibold shadow-sm dark:border-slate-700 dark:hover:bg-slate-800 border-2 border-slate-200"
                >
                  <ArrowLeft className="h-4.5 w-4.5 mr-2" />
                  Previous
                </Button>

                {currentQuestion < quiz.questions.length - 1 ? (
                  <Button
                    size="lg"
                    onClick={() =>
                      setCurrentQuestion((prev) =>
                        Math.min(quiz.questions.length - 1, prev + 1)
                      )
                    }
                    className="w-full sm:w-auto h-12 font-semibold shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 ml-3"
                  >
                    Next Question
                    <ArrowRight className="h-4.5 w-4.5 ml-2" />
                  </Button>
                ) : (
                  <AlertDialog
                    open={showSubmitDialog}
                    onOpenChange={setShowSubmitDialog}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        size="lg"
                        className="w-full sm:w-auto h-12 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25 font-bold ml-3"
                        disabled={!canSubmit()}
                      >
                        <Send className="h-4.5 w-4.5 mr-2" />
                        Final Submit
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Ready to hand it in?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-4 text-base pt-2 text-slate-600 dark:text-slate-300">
                          <p className="font-medium">
                            You have filled out <strong className="text-slate-900 dark:text-white">{getAnsweredCount()}</strong> out of{" "}
                            <strong className="text-slate-900 dark:text-white">{quiz.questions.length}</strong> questions natively.
                          </p>
                          {!canSubmit() && (
                            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 flex flex-col items-center justify-center text-center rounded-xl font-medium gap-1.5 shadow-sm">
                              <AlertTriangle className="h-6 w-6" />
                              <p>Mandatory blanks exist. Fill all REQUIRED designated questions.</p>
                            </div>
                          )}
                          <p>
                            Warning: A submission operates strictly. This locks the test and cannot be reversed or undone mid-flight. Pressing submit acts as an immutable ledger transition.
                          </p>
                          {timeLeft !== null && timeLeft < 60 && (
                            <div className="text-amber-600 dark:text-amber-500 flex items-center gap-2 font-bold px-4 py-2 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg w-fit">
                              <Timer className="h-5 w-5 animate-bounce" />
                              Under 60 seconds left to execute!
                            </div>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="mt-8 border-t border-slate-100 dark:border-slate-800/80 pt-6">
                        <AlertDialogCancel disabled={isSubmitting} className="h-11 dark:hover:bg-slate-800 font-semibold border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300">
                          Go back to Review
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleSubmitQuiz}
                          disabled={!canSubmit() || isSubmitting}
                          className="h-11 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-green-500/25 font-bold"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2.5"></div>
                              Calculating & Submitting...
                            </>
                          ) : (
                            "Agree & Submit Evaluation"
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
