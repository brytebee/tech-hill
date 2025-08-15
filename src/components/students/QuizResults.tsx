// students/QuizResults.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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
} from "lucide-react";
import Link from "next/link";

interface Question {
  id: string;
  questionText: string;
  questionType: string;
}
interface QuizAnswer {
  question: Question;
  questionId: string;
  points: number;
  earnedPoints: number;
  textAnswer: string;
  isCorrect: boolean;
  feedback?: string;
}

interface QuizAttempt {
  id: string;
  score: number;
  questionsTotal: number;
  questionsCorrect: number;
  passed: boolean;
  completedAt: Date;
  timeSpent: number;
  answers: QuizAnswer[];
}

interface Quiz {
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

interface QuizResultsProps {
  attempt: QuizAttempt;
  quiz: Quiz;
  allAttempts: QuizAttempt[];
  userId: string;
  topicId?: string;
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function getScoreColor(score: number, passingScore: number) {
  if (score >= passingScore) {
    return "text-green-600";
  } else if (score >= passingScore * 0.7) {
    return "text-yellow-600";
  } else {
    return "text-red-600";
  }
}

function getScoreBadgeStyle(passed: boolean) {
  if (passed) {
    return "bg-green-100 text-green-800 border-green-200";
  } else {
    return "bg-red-100 text-red-800 border-red-200";
  }
}

function QuestionReview({
  answer,
  index,
}: {
  answer: QuizAnswer;
  index: number;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const renderAnswer = (answerData: string | string[]) => {
    if (Array.isArray(answerData)) {
      return answerData.join(", ");
    }
    return answerData;
  };

  return (
    <Card
      className={`border-l-4 ${
        answer.isCorrect ? "border-l-green-500" : "border-l-red-500"
      }`}
    >
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger>
          <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {answer.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base">
                    Question {index + 1}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {answer.question.questionText.length > 80
                      ? `${answer.question.questionText.substring(0, 80)}...`
                      : answer.question.questionText}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {answer.earnedPoints}/{answer.points} pts
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {answer.question.questionType
                      .toLowerCase()
                      .replace("_", " ")}
                  </Badge>
                </div>
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
                <p className="text-gray-700">{answer.question.questionText}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Your Answer:
                  </h4>
                  <div
                    className={`p-3 rounded-lg border ${
                      answer.isCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <p className="text-sm">{renderAnswer(answer.textAnswer)}</p>
                  </div>
                </div>

                {!answer.isCorrect && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Correct Answer:
                    </h4>
                    <div className="p-3 rounded-lg border bg-green-50 border-green-200">
                      <p className="text-sm">
                        {renderAnswer(answer.textAnswer)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {answer.feedback && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Feedback:</h4>
                  <div className="p-3 rounded-lg border bg-blue-50 border-blue-200">
                    <p className="text-sm text-blue-800">{answer.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
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
}: QuizResultsProps) {
  const router = useRouter();
  const [showAllQuestions, setShowAllQuestions] = useState(false);

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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <Link
          href={`/student/courses/${quiz.topic.module.course.id}`}
          className="hover:text-gray-700"
        >
          {quiz.topic.module.course.title}
        </Link>
        <span>/</span>
        <Link
          href={`/student/topics/${quiz.topic.id}`}
          className="hover:text-gray-700"
        >
          {quiz.topic.title}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Quiz Results</span>
      </nav>

      {/* Results Header */}
      <Card
        className={`border-t-4 ${
          attempt.passed ? "border-t-green-500" : "border-t-red-500"
        }`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                {attempt.passed ? (
                  <Trophy className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-500" />
                )}
                Quiz {attempt.passed ? "Passed!" : "Not Passed"}
              </CardTitle>
              <p className="text-gray-600 mt-1">{quiz.title}</p>
            </div>
            <Badge className={getScoreBadgeStyle(attempt.passed)}>
              {attempt.passed ? "PASSED" : "FAILED"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          {/* Score Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div
                className={`text-3xl font-bold ${getScoreColor(
                  attempt.score,
                  quiz.passingScore
                )}`}
              >
                {attempt.score}%
              </div>
              <p className="text-sm text-gray-600">Final Score</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">
                {attempt.questionsCorrect}/{attempt.questionsTotal}
              </div>
              <p className="text-sm text-gray-600">Points Earned</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {correctAnswers}/{attempt.answers.length}
              </div>
              <p className="text-sm text-gray-600">Correct Answers</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-gray-700">
                {formatTime(attempt.timeSpent)}
              </div>
              <p className="text-sm text-gray-600">Time Spent</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Score Breakdown</span>
              <span className="text-sm text-gray-600">
                Passing Score: {quiz.passingScore}%
              </span>
            </div>
            <div className="relative">
              <Progress value={attempt.score} className="h-3" />
              <div
                className="absolute top-0 h-3 w-0.5 bg-red-500 rounded"
                style={{ left: `${quiz.passingScore}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span className="text-red-600">
                ← {quiz.passingScore}% required
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Correct: {correctAnswers}</span>
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <span className="font-medium">
                  Incorrect: {incorrectAnswers}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="font-medium">
                  Completed: {attempt.completedAt.toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              {!attempt.passed ? (
                <p className="text-sm text-gray-600 mb-2">
                  Don't worry! You can review your answers and try again.
                </p>
              ) : (
                <p className="text-sm text-gray-600 mb-2">
                  Congratulations! You've successfully completed this quiz.
                </p>
              )}
              {allAttempts.length > 0 && (
                <p className="text-xs text-gray-500">
                  Attempt {allAttempts.length} of {quiz.maxAttempts || "∞"}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              {canRetake && (
                <Button onClick={handleRetakeQuiz} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake Quiz
                </Button>
              )}

              <Link
                href={
                  topicId
                    ? `/student/topics/${topicId}`
                    : `/student/courses/${quiz.topic.module.course.id}`
                }
              >
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {topicId ? "Back to Topic" : "Back to Course"}
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Question Review
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllQuestions(!showAllQuestions)}
            >
              {showAllQuestions ? "Hide" : "Show"} All Questions
            </Button>
          </CardTitle>
        </CardHeader>

        {showAllQuestions && (
          <CardContent>
            <div className="space-y-4">
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

      {/* Previous Attempts (if any) */}
      {allAttempts.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Attempt History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allAttempts.map((pastAttempt, index) => (
                <div
                  key={pastAttempt.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    pastAttempt.id === attempt.id
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Attempt {index + 1}</Badge>
                    <span className="text-sm">
                      {pastAttempt.completedAt.toLocaleDateString()}
                    </span>
                    {pastAttempt.id === attempt.id && (
                      <Badge variant="secondary">Current</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-medium ${getScoreColor(
                        pastAttempt.score,
                        quiz.passingScore
                      )}`}
                    >
                      {pastAttempt.score}%
                    </span>
                    <Badge className={getScoreBadgeStyle(pastAttempt.passed)}>
                      {pastAttempt.passed ? "PASSED" : "FAILED"}
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
