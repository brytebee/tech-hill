// components/quiz/quiz-preview.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, HelpCircle, CheckCircle, XCircle } from "lucide-react";
import { QuestionData } from "./quiz-builder";

interface QuizPreviewProps {
  quiz: any;
  questions: QuestionData[];
}

export function QuizPreview({ quiz, questions }: QuizPreviewProps) {
  const [showAnswers, setShowAnswers] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, any>>({});

  const validQuestions = questions.filter(q => q.questionText.trim());
  const totalPoints = validQuestions.reduce((sum, q) => sum + q.points, 0);

  const handleAnswerChange = (questionIndex: number, value: any) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));
  };

  const renderQuestion = (question: QuestionData, index: number) => {
    const selectedAnswer = selectedAnswers[index];

    return (
      <Card key={index} className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                Question {index + 1}
                <Badge variant="outline">{question.points} pt{question.points !== 1 ? 's' : ''}</Badge>
                <Badge variant="secondary">{question.difficulty}</Badge>
              </CardTitle>
              <CardDescription className="mt-2 text-base text-foreground">
                {question.questionText}
              </CardDescription>
              
              {question.hint && (
                <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <HelpCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    <span className="font-medium">Hint:</span> {question.hint}
                  </p>
                </div>
              )}

              {question.timeLimit && (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Time limit: {question.timeLimit} seconds
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {question.questionType === 'MULTIPLE_CHOICE' && (
            <RadioGroup
              value={selectedAnswer}
              onValueChange={(value) => handleAnswerChange(index, value)}
            >
              <div className="space-y-3">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-start space-x-2">
                    <RadioGroupItem 
                      value={optionIndex.toString()} 
                      id={`q${index}-option${optionIndex}`}
                      disabled={showAnswers}
                    />
                    <Label 
                      htmlFor={`q${index}-option${optionIndex}`}
                      className={`flex-1 cursor-pointer ${
                        showAnswers 
                          ? option.isCorrect 
                            ? 'text-green-700 font-medium' 
                            : selectedAnswer === optionIndex.toString() && !option.isCorrect
                              ? 'text-red-700'
                              : 'text-muted-foreground'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {option.text}
                        {showAnswers && option.isCorrect && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {showAnswers && selectedAnswer === optionIndex.toString() && !option.isCorrect && (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      {showAnswers && option.explanation && (
                        <p className="mt-1 text-sm text-muted-foreground italic">
                          {option.explanation}
                        </p>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {question.questionType === 'MULTIPLE_SELECT' && (
            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-start space-x-2">
                  <Checkbox 
                    id={`q${index}-option${optionIndex}`}
                    checked={(selectedAnswer || []).includes(optionIndex)}
                    onCheckedChange={(checked) => {
                      const currentSelected = selectedAnswer || [];
                      if (checked) {
                        handleAnswerChange(index, [...currentSelected, optionIndex]);
                      } else {
                        handleAnswerChange(index, currentSelected.filter((i: number) => i !== optionIndex));
                      }
                    }}
                    disabled={showAnswers}
                  />
                  <Label 
                    htmlFor={`q${index}-option${optionIndex}`}
                    className={`flex-1 cursor-pointer ${
                      showAnswers 
                        ? option.isCorrect 
                          ? 'text-green-700 font-medium' 
                          : (selectedAnswer || []).includes(optionIndex) && !option.isCorrect
                            ? 'text-red-700'
                            : 'text-muted-foreground'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {option.text}
                      {showAnswers && option.isCorrect && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                      {showAnswers && (selectedAnswer || []).includes(optionIndex) && !option.isCorrect && (
                        <XCircle className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                    {showAnswers && option.explanation && (
                      <p className="mt-1 text-sm text-muted-foreground italic">
                        {option.explanation}
                      </p>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {question.questionType === 'TRUE_FALSE' && (
            <RadioGroup
              value={selectedAnswer}
              onValueChange={(value) => handleAnswerChange(index, value)}
            >
              <div className="space-y-3">
                {question.options.map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-start space-x-2">
                    <RadioGroupItem 
                      value={optionIndex.toString()} 
                      id={`q${index}-option${optionIndex}`}
                      disabled={showAnswers}
                    />
                    <Label 
                      htmlFor={`q${index}-option${optionIndex}`}
                      className={`flex-1 cursor-pointer ${
                        showAnswers 
                          ? option.isCorrect 
                            ? 'text-green-700 font-medium' 
                            : selectedAnswer === optionIndex.toString() && !option.isCorrect
                              ? 'text-red-700'
                              : 'text-muted-foreground'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {option.text}
                        {showAnswers && option.isCorrect && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {showAnswers && selectedAnswer === optionIndex.toString() && !option.isCorrect && (
                          <XCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          )}

          {(question.questionType === 'SHORT_ANSWER' || question.questionType === 'LONG_ANSWER') && (
            <div className="space-y-2">
              <Textarea
                placeholder="Type your answer here..."
                value={selectedAnswer || ''}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                rows={question.questionType === 'LONG_ANSWER' ? 6 : 3}
                disabled={showAnswers}
              />
              {question.caseSensitive && (
                <p className="text-xs text-muted-foreground">
                  Note: This answer is case-sensitive
                </p>
              )}
            </div>
          )}

          {showAnswers && question.explanation && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-blue-800">Explanation:</p>
                  <p className="mt-1 text-sm text-blue-700">{question.explanation}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (validQuestions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">No valid questions to preview yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Quiz Preview
                <Badge>{validQuestions.length} Questions</Badge>
                <Badge variant="outline">{totalPoints} Points</Badge>
              </CardTitle>
              <CardDescription>
                See how your quiz will appear to students
              </CardDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowAnswers(!showAnswers)}
            >
              {showAnswers ? 'Hide' : 'Show'} Answers
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Quiz Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {quiz.timeLimit && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>Time Limit: {quiz.timeLimit} minutes</span>
              </div>
            )}
            <p>• You need {quiz.passingScore}% to pass this quiz</p>
            {quiz.maxAttempts && (
              <p>• Maximum attempts: {quiz.maxAttempts}</p>
            )}
            {quiz.shuffleQuestions && (
              <p>• Questions will be presented in random order</p>
            )}
            {quiz.shuffleOptions && (
              <p>• Answer options will be shuffled</p>
            )}
            {quiz.allowReview && (
              <p>• You can review your answers before submitting</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div>
        {validQuestions.map((question, index) => renderQuestion(question, index))}
      </div>

      {/* Submit Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              This is where students would see the submit button
            </p>
            <Button disabled>Submit Quiz</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
