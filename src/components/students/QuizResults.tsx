"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  BookOpen,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Trophy,
  AlertCircle,
  Target,
  Calendar,
  BarChart3,
  ListRestart
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export interface Question {
  id: string;
  questionText: string;
  questionType: string;
  points: number;
  options: string[];
  correctAnswers: string[];
}
export interface QuizAnswer {
  question: Question;
  questionId: string;
  points: number;
  earnedPoints: number;
  selectedOptions: string[];
  textAnswer: string | null;
  isCorrect: boolean;
  feedback?: string;
}

export interface QuizAttempt {
  id: string;
  score: number;
  questionsTotal: number;
  questionsCorrect: number;
  passed: boolean;
  completedAt: Date;
  timeSpent: number;
  answers: QuizAnswer[];
}

export interface Quiz {
  id: string;
  title: string;
  passingScore: number;
  allowRetakes: boolean;
  maxAttempts?: number;
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
}

export interface QuizResultsProps {
  attempt: QuizAttempt;
  quiz: Quiz;
  allAttempts: QuizAttempt[];
  userId: string;
  topicId?: string;
  nextTopicId?: string;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function QuestionReview({
  answer,
  index,
}: {
  answer: QuizAnswer;
  index: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderAnswer = (answerData: string[] | string | null) => {
    if (Array.isArray(answerData)) {
      return answerData.length > 0
        ? answerData.join(", ")
        : "No selection made";
    }
    if (typeof answerData === "string") {
      return answerData || "Blank execution";
    }
    return "Untouched logic block";
  };

  return (
    <Card
      className={`border-l-[6px] transition-all bg-white dark:bg-slate-900 border-r-slate-200 border-t-slate-200 border-b-slate-200 dark:border-r-slate-800 dark:border-t-slate-800 dark:border-b-slate-800 shadow-sm overflow-hidden ${
        answer.isCorrect ? "border-l-emerald-500" : "border-l-red-500"
      }`}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <div className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors p-5 border-b border-transparent data-[state=open]:border-slate-100 data-[state=open]:dark:border-slate-800/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 w-3/4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-inner ${answer.isCorrect ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'}`}>
                  {answer.isCorrect ? (
                    <CheckCircle className="h-4.5 w-4.5" />
                  ) : (
                    <XCircle className="h-4.5 w-4.5" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base mb-1">
                    Question {index + 1}
                  </h4>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-snug">
                    {answer.question.questionText.length > 80
                      ? `${answer.question.questionText.substring(0, 80)}...`
                      : answer.question.questionText}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex flex-col items-end gap-1.5">
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {answer.points} <span className="opacity-50 mx-0.5">/</span> {answer.question.points} pts
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700">
                    {answer.question.questionType
                      .toLowerCase()
                      .replace("_", " ")}
                  </Badge>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  {isExpanded ? (
                    <ChevronDown className="h-4.5 w-4.5" />
                  ) : (
                    <ChevronRight className="h-4.5 w-4.5" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-900/40 space-y-6">
            <div>
               <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5"/> Original Prompt</h5>
               <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">{answer.question.questionText}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="flex flex-col h-full">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> Your Execution</h5>
                <div
                  className={`flex-1 p-4 rounded-xl border relative shadow-sm ${
                    answer.isCorrect
                      ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-300"
                      : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-900 dark:text-red-300"
                  }`}
                >
                  {answer.isCorrect && <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-emerald-500/50" />}
                  {!answer.isCorrect && <XCircle className="absolute top-3 right-3 w-4 h-4 text-red-500/50" />}
                  <p className="text-sm font-semibold leading-relaxed mt-1">
                    {answer.textAnswer
                      ? renderAnswer(answer.textAnswer)
                      : renderAnswer(answer.selectedOptions)}
                  </p>
                </div>
              </div>

              {!answer.isCorrect && (
                <div className="flex flex-col h-full">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Validated Solution</h5>
                  <div className="flex-1 p-4 rounded-xl border bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30 shadow-sm relative">
                     <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-emerald-500" />
                     <div className="text-sm font-semibold text-emerald-900 dark:text-emerald-300 leading-relaxed mt-1 space-y-2">
                       {answer.question.correctAnswers.map((txts: any, i: number) => (
                         <div key={i} className="flex gap-2 isolate"><span className="opacity-50 shrink-0">•</span> {txts}</div>
                       ))}
                     </div>
                  </div>
                </div>
              )}
            </div>

            {answer.feedback && (
              <div>
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" /> Evaluator Feedback</h5>
                <div className="p-4 rounded-xl border bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30 shadow-sm">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300 leading-relaxed">{answer.feedback}</p>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

export function QuizResults({
  attempt,
  quiz,
  allAttempts,
  userId,
  topicId,
  nextTopicId,
}: QuizResultsProps) {
  const router = useRouter();
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleRetakeQuiz = () => {
    router.push(
      `/student/quiz/${quiz.id}${topicId ? `?topicId=${topicId}` : ""}`
    );
  };

  const canRetake =
    quiz.allowRetakes &&
    (!quiz.maxAttempts || allAttempts.length < quiz.maxAttempts);

  const correctAnswers = attempt.answers.filter((a) => a.isCorrect).length;
  const incorrectAnswers = attempt.answers.length - correctAnswers;

  const isPerfectScore = attempt.score === 100;

  const handleMarkCompleteAndContinue = async () => {
    if (!topicId) return;
    setIsCompleting(true);
    try {
      const response = await fetch(`/api/student/topics/${topicId}/mark-complete`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Topic completed!");
        if (nextTopicId) {
          router.push(`/student/topics/${nextTopicId}`);
        } else {
          router.push(`/student/courses/${quiz.topic.module.course.id}`);
        }
      } else {
        toast.error("Failed to mark complete. Please do it from the topic page.");
        router.push(`/student/topics/${topicId}`);
      }
    } catch (error) {
      console.error("Error marking complete:", error);
      toast.error("Something went wrong");
      setIsCompleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in relative z-10">
      
      {/* Dynamic Background Glow mapped to state */}
      <div className={`absolute top-0 right-1/2 translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none -z-10 opacity-30 ${attempt.passed ? (isPerfectScore ? 'bg-amber-500/20' : 'bg-emerald-500/20') : 'bg-red-500/20'}`} />

      {/* Deep Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
        <Link
          href={`/student/courses/${quiz.topic.module.course.id}`}
          className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {quiz.topic.module.course.title}
        </Link>
        <span className="opacity-50">/</span>
        <Link
          href={`/student/topics/${quiz.topic.id}`}
          className="hover:text-slate-900 dark:hover:text-white transition-colors truncate max-w-[120px] sm:max-w-none"
        >
          {quiz.topic.title}
        </Link>
        <span className="opacity-50">/</span>
        <span className="text-slate-900 dark:text-white truncate">Quiz Results</span>
      </nav>

      {/* Hero Header Outcome Block */}
      <Card className={`border-0 shadow-xl overflow-hidden relative ${
         attempt.passed
          ? isPerfectScore 
            ? "bg-gradient-to-br from-amber-500 to-orange-600 outline outline-amber-500/50" 
            : "bg-gradient-to-br from-emerald-500 to-green-600"
          : "bg-gradient-to-br from-red-500 to-rose-600"
      }`}>
         <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none mix-blend-overlay" />
         
         <CardContent className="p-8 sm:p-12 relative z-10 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-8">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-inner">
               {attempt.passed ? (
                 isPerfectScore ? (
                   <Trophy className="h-10 w-10 text-amber-100 drop-shadow-md" />
                 ) : (
                   <CheckCircle className="h-12 w-12 text-emerald-100 drop-shadow-md" />
                 )
               ) : (
                 <AlertCircle className="h-12 w-12 text-red-100 drop-shadow-md pb-0.5" />
               )}
            </div>

            <div className="flex-1 space-y-3">
               <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-center sm:justify-start">
                 <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white drop-shadow-sm">
                   {attempt.passed ? (isPerfectScore ? "Perfect Score! 🏆" : "Quiz Passed!") : "Not Passed Yet"}
                 </h1>
                 <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 font-bold backdrop-blur-md px-3 py-1 shadow-sm w-fit mx-auto sm:mx-0">
                    {attempt.passed ? "PASSED" : "NEEDS REVIEW"}
                 </Badge>
               </div>
               <p className="text-white/80 text-lg font-medium leading-relaxed max-w-xl">
                 Target: <strong className="text-white"> {quiz.title}</strong>
               </p>
            </div>
         </CardContent>
      </Card>

      {/* Mathematical Breakdown Board */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm flex flex-col justify-center relative overflow-hidden">
           <div className={`absolute top-0 inset-x-0 h-1 ${attempt.passed ? 'bg-emerald-500' : 'bg-red-500'}`} />
           <div className={`text-4xl font-black tracking-tight mb-2 ${attempt.passed ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
             {attempt.score}%
           </div>
           <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Yield</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm flex flex-col justify-center">
           <div className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-2">
             {attempt.questionsCorrect}<span className="text-slate-300 dark:text-slate-700 mx-1">/</span><span className="text-lg opacity-70">{attempt.questionsTotal}</span>
           </div>
           <p className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1.5"><Target className="w-3.5 h-3.5" /> Nodes Hit</p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm flex flex-col justify-center bg-blue-50/50 dark:bg-blue-900/10">
           <div className="text-3xl font-bold tracking-tight text-blue-600 dark:text-blue-500 mb-2">
             {correctAnswers}<span className="text-blue-200 dark:text-blue-900 mx-1">/</span><span className="text-lg opacity-70">{attempt.answers.length}</span>
           </div>
           <p className="text-xs font-bold uppercase tracking-widest text-blue-500/80 flex items-center justify-center gap-1.5"><CheckCircle className="w-3.5 h-3.5" /> Accurate</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center shadow-sm flex flex-col justify-center">
           <div className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-2 mt-1">
             {formatTime(attempt.timeSpent)}
           </div>
           <p className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center justify-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Compute</p>
        </div>
      </div>

      {/* Progress Ruler */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-widest">Performance</span>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-300 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-inner">
              Minimum Threshold: {quiz.passingScore}%
            </span>
          </div>
          <div className="relative pt-2 pb-6">
            <Progress value={attempt.score} className={`h-4 border border-slate-200 dark:border-slate-800 shadow-inner ${attempt.passed ? 'bg-slate-100 dark:bg-slate-800' : 'bg-red-50 dark:bg-red-950/20'}`} />
            
            {/* Threshold Line Layer */}
            <div
              className="absolute top-0 bottom-6 w-0.5 bg-slate-900 dark:bg-slate-400 z-10"
              style={{ left: `${quiz.passingScore}%` }}
            >
               <div className="absolute top-full mt-2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                 <div className="w-px h-2 bg-slate-900 dark:bg-slate-400 mb-1" />
                 <span className="text-[10px] font-bold text-slate-900 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded shadow-sm border border-slate-200 dark:border-slate-700 whitespace-nowrap">Pass Rate: {quiz.passingScore}%</span>
               </div>
            </div>

            {/* Current Score Tag */}
            <div
              className={`absolute top-0 bottom-6 w-0.5 z-20 transition-all duration-1000 ${attempt.passed ? 'bg-emerald-500' : 'bg-red-500'}`}
              style={{ left: `${attempt.score}%` }}
            >
               <div className="absolute bottom-full mb-1 -translate-x-1/2 flex flex-col items-center pointer-events-none">
                 <span className={`text-[11px] font-black px-2 py-0.5 rounded shadow-md border ${attempt.passed ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-red-500 text-white border-red-600'}`}>You: {attempt.score}%</span>
                 <div className={`w-1 h-2 -mt-[1px] rotate-180 border-t ${attempt.passed ? 'border-t-emerald-500' : 'border-t-red-500'}`} style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
               </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Retake & Continue Action Bar */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                 {!attempt.passed 
                    ? "Almost there! Keep trying." 
                    : isPerfectScore 
                       ? "Excellent work! Perfect score." 
                       : "Great job! You passed."}
              </h3>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                 {!attempt.passed 
                    ? "Review your answers below and try again to improve your score."
                    : "You are ready to move on to the next topic."}
              </p>
              {allAttempts.length > 0 && (
                <p className="text-xs font-bold text-blue-600 dark:text-blue-500 mt-3 inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/10 px-2.5 py-1 rounded-md border border-blue-200 dark:border-blue-900/30">
                  <ListRestart className="w-3.5 h-3.5"/> This was attempt {allAttempts.length} out of {quiz.maxAttempts || "∞"} allowed.wed.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
               {attempt.passed && topicId ? (
                 <Button onClick={handleMarkCompleteAndContinue} disabled={isCompleting} className="w-full sm:w-auto h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold sm:px-6 shadow-md shadow-emerald-500/20">
                   {isCompleting ? "Saving..." : "Mark Complete & Continue"}
                   {!isCompleting && <ChevronRight className="h-4.5 w-4.5 ml-2" />}
                 </Button>
               ) : (
                 <Link href={topicId ? `/student/topics/${topicId}` : `/student/courses/${quiz.topic.module.course.id}`} className="w-full sm:w-auto">
                   <Button variant="outline" className="h-12 border-2 border-slate-200 dark:border-slate-700 w-full font-bold sm:px-6">
                     <ArrowLeft className="h-4.5 w-4.5 mr-2" />
                     Back to Topic
                   </Button>
                 </Link>
               )}

              {canRetake && (
                <Button onClick={handleRetakeQuiz} className="h-12 bg-slate-900 hover:bg-slate-800 text-white dark:bg-blue-600 dark:hover:bg-blue-500 w-full sm:w-auto shadow-md shadow-slate-900/20 dark:shadow-blue-900/30 font-bold sm:px-8">
                  <RotateCcw className="h-4.5 w-4.5 mr-2" />
                  Retake Quiz
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logic Breakdown Console */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 px-6 py-5">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="flex items-center gap-2.5 text-lg font-bold">
              <BookOpen className="h-5 w-5 text-blue-500" />
              Your Answer Review
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllQuestions(!showAllQuestions)}
              className="font-bold border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
            >
              {showAllQuestions ? "Hide All Questions" : "Show All Questions"}
            </Button>
          </CardTitle>
        </CardHeader>

        {showAllQuestions && (
          <CardContent className="p-6 bg-slate-50 dark:bg-slate-950 sm:p-8">
            <div className="space-y-6">
              {attempt.answers.map((answer, index) => (
                <QuestionReview
                  key={answer.questionId}
                  answer={answer}
                  index={index}
                />
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Registry DB (Historical Attempts) */}
      {allAttempts.length > 1 && (
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm mt-10">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/60 pb-5">
            <CardTitle className="flex items-center gap-2 text-base uppercase tracking-widest text-slate-500 dark:text-slate-400">
              <BarChart3 className="h-5 w-5" />
              State Architecture Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-3">
              {allAttempts.map((pastAttempt, index) => (
                <div
                  key={pastAttempt.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all shadow-sm ${
                    pastAttempt.id === attempt.id
                      ? "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30 ring-2 ring-blue-500/20 ring-offset-2 dark:ring-offset-slate-950"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-80 hover:opacity-100 scale-[0.99] hover:scale-100"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-4 sm:mb-0">
                    <Badge variant="outline" className="font-bold border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">Run {index + 1}</Badge>
                    <span className="text-sm font-semibold flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5"/> {pastAttempt.completedAt.toLocaleDateString()}
                    </span>
                    {pastAttempt.id === attempt.id && (
                      <Badge className="bg-blue-500 text-white border-0 shadow-sm ml-2">PRIMARY FOCUS</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 border-t sm:border-0 border-slate-100 dark:border-slate-800/60 pt-3 sm:pt-0">
                    <div className="flex flex-col items-end">
                       <span
                         className={`text-xl font-black ${pastAttempt.passed ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}
                       >
                         {pastAttempt.score}%
                       </span>
                    </div>
                    <Badge className={`font-bold py-1 px-3 shadow-sm ${pastAttempt.passed ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200' : 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300 hover:bg-red-200'}`}>
                      {pastAttempt.passed ? "CERTIFIED" : "FAILED"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
