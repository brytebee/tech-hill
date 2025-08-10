// components/quiz/quiz-overview.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Edit, 
  Settings, 
  Play, 
  BarChart3, 
  Users, 
  Clock,
  Target,
  FileQuestion,
  Zap,
  Eye
} from "lucide-react";
import { format } from "date-fns";

interface QuizOverviewProps {
  quiz: any;
}

export function QuizOverview({ quiz }: QuizOverviewProps) {
  const router = useRouter();

  const totalPoints = quiz.questions.reduce((sum: number, q: any) => sum + q.points, 0);
  const averageScore = quiz.attempts.length > 0 
    ? Math.round(quiz.attempts.reduce((sum: number, a: any) => sum + a.score, 0) / quiz.attempts.length)
    : 0;
  const passRate = quiz.attempts.length > 0
    ? Math.round((quiz.attempts.filter((a: any) => a.passed).length / quiz.attempts.length) * 100)
    : 0;

  const difficultyStats = quiz.questions.reduce((acc: any, q: any) => {
    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Quiz Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {quiz.title}
                <Badge variant={quiz.isActive ? "default" : "secondary"}>
                  {quiz.isActive ? "Active" : "Inactive"}
                </Badge>
              </CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/quizzes/${quiz.id}/builder`)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Questions
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/admin/quizzes/${quiz.id}/edit`)}
              >
                <Settings className="w-4 h-4 mr-2" />
                Quiz Settings
              </Button>
              <Button onClick={() => router.push(`/quiz/${quiz.id}`)}>
                <Play className="w-4 h-4 mr-2" />
                Take Quiz
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quiz Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quiz._count.questions}</div>
            <p className="text-xs text-muted-foreground">
              {totalPoints} total points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attempts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quiz._count.attempts}</div>
            <p className="text-xs text-muted-foreground">
              Total submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              Across all attempts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{passRate}%</div>
            <p className="text-xs text-muted-foreground">
              {quiz.passingScore}% required
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quiz Configuration</CardTitle>
            <CardDescription>Current quiz settings and requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Time Limit:</span>
                <p className="text-muted-foreground">
                  {quiz.timeLimit ? `${quiz.timeLimit} minutes` : 'No limit'}
                </p>
              </div>
              <div>
                <span className="font-medium">Passing Score:</span>
                <p className="text-muted-foreground">{quiz.passingScore}%</p>
              </div>
              <div>
                <span className="font-medium">Max Attempts:</span>
                <p className="text-muted-foreground">{quiz.maxAttempts || 'Unlimited'}</p>
              </div>
              <div>
                <span className="font-medium">Shuffle Questions:</span>
                <p className="text-muted-foreground">{quiz.shuffleQuestions ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="font-medium">Shuffle Options:</span>
                <p className="text-muted-foreground">{quiz.shuffleOptions ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="font-medium">Show Feedback:</span>
                <p className="text-muted-foreground">{quiz.showFeedback ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="font-medium">Allow Review:</span>
                <p className="text-muted-foreground">{quiz.allowReview ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="font-medium">Practice Mode:</span>
                <p className="text-muted-foreground">{quiz.practiceMode ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {(quiz.adaptiveDifficulty || quiz.requireMastery) && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Advanced Features:</p>
                <div className="flex flex-wrap gap-2">
                  {quiz.adaptiveDifficulty && (
                    <Badge variant="outline">
                      <Zap className="w-3 h-3 mr-1" />
                      Adaptive Difficulty
                    </Badge>
                  )}
                  {quiz.requireMastery && (
                    <Badge variant="outline">
                      <Target className="w-3 h-3 mr-1" />
                      Requires Mastery
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Question Breakdown</CardTitle>
            <CardDescription>Analysis of quiz questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Difficulty Distribution</span>
                <span>{quiz.questions.length} questions</span>
              </div>
              <div className="space-y-2">
                {Object.entries(difficultyStats).map(([difficulty, count]) => (
                  <div key={difficulty} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={
                          difficulty === 'EASY' ? 'text-green-600 border-green-200' :
                          difficulty === 'MEDIUM' ? 'text-yellow-600 border-yellow-200' :
                          'text-red-600 border-red-200'
                        }
                      >
                        {difficulty.toLowerCase()}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {count} question{(count as number) !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between text-sm mb-2">
                <span>Question Types</span>
              </div>
              <div className="space-y-2">
                {Object.entries(
                  quiz.questions.reduce((acc: any, q: any) => {
                    const type = q.questionType.replace('_', ' ').toLowerCase();
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                  }, {})
                ).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="capitalize">{type}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attempts */}
      {quiz.attempts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Attempts</CardTitle>
                <CardDescription>Latest quiz submissions</CardDescription>
              </div>
              <Button 
                variant="outline" 
                onClick={() => router.push(`/admin/quizzes/${quiz.id}/attempts`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time Spent</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quiz.attempts.map((attempt: any) => (
                  <TableRow key={attempt.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {attempt.user.firstName} {attempt.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {attempt.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{attempt.score}%</span>
                        {attempt.isPractice && (
                          <Badge variant="outline" className="text-xs">
                            Practice
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={attempt.passed ? "default" : "destructive"}
                      >
                        {attempt.passed ? "Passed" : "Failed"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {attempt.timeSpent ? `${Math.round(attempt.timeSpent / 60)}m` : 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(attempt.createdAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Questions</CardTitle>
              <CardDescription>All questions in this quiz</CardDescription>
            </div>
            <Button onClick={() => router.push(`/admin/quizzes/${quiz.id}/builder`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Questions
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {quiz.questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No questions added yet.</p>
              <Button onClick={() => router.push(`/admin/quizzes/${quiz.id}/builder`)}>
                <FileQuestion className="w-4 h-4 mr-2" />
                Add Questions
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {quiz.questions.map((question: any, index: number) => (
                <div key={question.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">Question {index + 1}</span>
                        <Badge variant="outline">{question.points} pt{question.points !== 1 ? 's' : ''}</Badge>
                        <Badge variant="secondary">{question.difficulty}</Badge>
                        <Badge variant="outline">
                          {question.questionType.replace('_', ' ').toLowerCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {question.questionText}
                      </p>
                      {question.options.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {question.options.length} option{question.options.length !== 1 ? 's' : ''} • 
                          {question.options.filter((opt: any) => opt.isCorrect).length} correct answer{question.options.filter((opt: any) => opt.isCorrect).length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
