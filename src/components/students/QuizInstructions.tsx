// components/students/QuizInstructions.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Shield,
  Wifi,
  Volume2,
  Eye,
  Clock,
  Save,
  AlertTriangle,
  CheckCircle,
  Timer,
  Monitor,
  BookOpen,
  Award,
  User,
  FileText,
} from "lucide-react";

interface QuizInstructionsProps {
  quiz: {
    id: string;
    title: string;
    description?: string;
    passingScore: number;
    timeLimit?: number;
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
    questions: any[];
  };
  metadata: {
    totalQuestions: number;
    totalPoints: number;
    attemptNumber: number;
    attemptsRemaining: number | null;
    hasPassedQuiz: boolean;
  };
  onStartQuiz: () => void;
}

export function QuizInstructions({
  quiz,
  metadata,
  onStartQuiz,
}: QuizInstructionsProps) {
  const [acknowledgedItems, setAcknowledgedItems] = useState<Set<string>>(
    new Set()
  );
  const [showConnectionTest, setShowConnectionTest] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "testing" | "good" | "poor" | null
  >(null);

  const instructions = [
    {
      id: "connection",
      title: "Stable Internet Connection Required",
      description:
        "Ensure you have a stable internet connection throughout the quiz. Connection issues may result in lost answers.",
      icon: Wifi,
      critical: true,
    },
    {
      id: "environment",
      title: "Quiet Environment",
      description:
        "Choose a quiet, distraction-free environment where you can focus completely on the quiz.",
      icon: Volume2,
      critical: true,
    },
    {
      id: "attention",
      title: "Full Attention Required",
      description:
        "Give your complete attention to the quiz. Avoid multitasking or checking other applications.",
      icon: Eye,
      critical: true,
    },
    {
      id: "no-close",
      title: "Do Not Close Browser Tab/Window",
      description:
        "Keep this browser tab open and active. Closing or refreshing may result in lost progress.",
      icon: Monitor,
      critical: true,
    },
    {
      id: "auto-submit",
      title: "Automatic Submission",
      description:
        "If the timer expires before you finish, your current progress will be automatically submitted.",
      icon: Timer,
      critical: true,
    },
    {
      id: "save-frequently",
      title: "Answers Auto-Save",
      description:
        "Your answers are automatically saved as you progress, but ensure each answer is complete before moving on.",
      icon: Save,
      critical: false,
    },
    {
      id: "no-back-button",
      title: "Browser Navigation",
      description:
        "Do not use browser back/forward buttons. Use only the navigation buttons provided in the quiz interface.",
      icon: AlertTriangle,
      critical: false,
    },
    {
      id: "read-carefully",
      title: "Read Questions Carefully",
      description:
        "Read each question thoroughly. Pay attention to keywords like 'not', 'except', 'all', 'some', etc.",
      icon: BookOpen,
      critical: false,
    },
  ];

  const testConnection = async () => {
    setConnectionStatus("testing");
    setShowConnectionTest(true);

    try {
      const start = Date.now();
      const response = await fetch("/api/health-check", {
        method: "GET",
        cache: "no-cache",
      });
      const end = Date.now();
      const latency = end - start;

      if (response.ok && latency < 2000) {
        setConnectionStatus("good");
      } else {
        setConnectionStatus("poor");
      }
    } catch (error) {
      setConnectionStatus("poor");
    }
  };

  const handleAcknowledge = (instructionId: string, checked: boolean) => {
    const newAcknowledged = new Set(acknowledgedItems);
    if (checked) {
      newAcknowledged.add(instructionId);
    } else {
      newAcknowledged.delete(instructionId);
    }
    setAcknowledgedItems(newAcknowledged);
  };

  const criticalInstructions = instructions.filter((i) => i.critical);
  const allCriticalAcknowledged = criticalInstructions.every((i) =>
    acknowledgedItems.has(i.id)
  );

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} minutes`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Overview */}
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-900 flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Quiz Instructions & Setup
          </CardTitle>
          <div className="text-blue-700">
            Please read all instructions carefully before starting your quiz.
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Quiz Information</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">{quiz.title}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>
                    {quiz.topic.module.course.title} - {quiz.topic.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span>{metadata.totalQuestions} questions</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-gray-500" />
                  <span>{metadata.totalPoints} total points</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-green-600" />
                  <span>{quiz.passingScore}% required to pass</span>
                </div>
                {quiz.timeLimit && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="font-medium text-orange-600">
                      Time limit: {formatTime(quiz.timeLimit)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Attempt Information</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Attempt Number:</span>
                  <Badge variant="outline">{metadata.attemptNumber}</Badge>
                </div>
                {metadata.attemptsRemaining !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Attempts Remaining:</span>
                    <Badge
                      variant={
                        metadata.attemptsRemaining <= 1
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {metadata.attemptsRemaining}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Retakes Allowed:</span>
                  <Badge variant={quiz.allowRetakes ? "default" : "secondary"}>
                    {quiz.allowRetakes ? "Yes" : "No"}
                  </Badge>
                </div>
                {metadata.hasPassedQuiz && (
                  <div className="mt-3 p-2 bg-green-100 rounded-lg">
                    <div className="flex items-center gap-2 text-green-800 text-sm">
                      <CheckCircle className="h-4 w-4" />
                      You have already passed this quiz
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Test */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Connection Test</h3>
            <Button
              variant="outline"
              onClick={testConnection}
              disabled={connectionStatus === "testing"}
            >
              {connectionStatus === "testing" ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Testing...
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>
          </div>

          {connectionStatus === "good" && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle className="h-4 w-4" />
              Connection is stable and ready for quiz
            </div>
          )}

          {connectionStatus === "poor" && (
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Connection appears unstable. Please check your internet before
              proceeding.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Quiz Instructions</CardTitle>
          <div className="text-sm text-gray-600">
            Please acknowledge that you understand each instruction before
            proceeding.
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {instructions.map((instruction) => {
              const Icon = instruction.icon;
              const isAcknowledged = acknowledgedItems.has(instruction.id);

              return (
                <Card
                  key={instruction.id}
                  className={
                    instruction.critical
                      ? "border-orange-200 bg-orange-50/50"
                      : ""
                  }
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          instruction.critical ? "bg-orange-100" : "bg-blue-100"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            instruction.critical
                              ? "text-orange-600"
                              : "text-blue-600"
                          }`}
                        />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{instruction.title}</h4>
                          {instruction.critical && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {instruction.description}
                        </p>

                        <div className="flex items-center space-x-2 mt-3">
                          <Checkbox
                            id={instruction.id}
                            checked={isAcknowledged}
                            onCheckedChange={(checked) =>
                              handleAcknowledge(
                                instruction.id,
                                checked as boolean
                              )
                            }
                          />
                          <Label
                            htmlFor={instruction.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            I understand and acknowledge this instruction
                          </Label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Start Quiz Button */}
      <div className="text-center">
        <Button
          size="lg"
          onClick={onStartQuiz}
          disabled={!allCriticalAcknowledged}
          className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
        >
          {!allCriticalAcknowledged ? (
            <>
              <AlertTriangle className="h-5 w-5 mr-2" />
              Acknowledge Required Instructions
            </>
          ) : (
            <>
              <CheckCircle className="h-5 w-5 mr-2" />
              Start Quiz
            </>
          )}
        </Button>

        {!allCriticalAcknowledged && (
          <p className="text-sm text-red-600 mt-2">
            Please acknowledge all required instructions before starting the
            quiz.
          </p>
        )}
      </div>

      {/* Alert Dialog for Connection Test */}
      <AlertDialog
        open={showConnectionTest}
        onOpenChange={setShowConnectionTest}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Connection Test Results</AlertDialogTitle>
            <AlertDialogDescription>
              {connectionStatus === "good" && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Your connection is stable and ready for the quiz.
                </div>
              )}
              {connectionStatus === "poor" && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Your connection appears to be unstable.
                  </div>
                  <p className="text-sm">
                    This may cause issues during the quiz. Please check your
                    internet connection or try again later.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowConnectionTest(false)}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
