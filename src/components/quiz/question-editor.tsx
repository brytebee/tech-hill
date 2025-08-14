// components/quiz/question-editor.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  Minus,
  GripVertical,
  Settings2,
  HelpCircle,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { QuestionData } from "./quiz-builder";

interface QuestionEditorProps {
  question: QuestionData;
  index: number;
  onUpdate: (question: QuestionData) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  totalQuestions: number;
}

const QUESTION_TYPES = [
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice", requiresOptions: true },
  { value: "MULTIPLE_SELECT", label: "Multiple Select", requiresOptions: true },
  { value: "TRUE_FALSE", label: "True/False", requiresOptions: true },
  { value: "SHORT_ANSWER", label: "Short Answer", requiresOptions: false },
  { value: "LONG_ANSWER", label: "Long Answer", requiresOptions: false },
];

export function QuestionEditor({
  question,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  totalQuestions,
}: QuestionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentType = QUESTION_TYPES.find(
    (type) => type.value === question.questionType
  );
  const requiresOptions = currentType?.requiresOptions;

  const updateQuestion = (updates: Partial<QuestionData>) => {
    onUpdate({ ...question, ...updates });
  };

  const updateQuestionType = (newType: QuestionData["questionType"]) => {
    let newOptions = question.options;

    if (newType === "TRUE_FALSE") {
      newOptions = [
        { text: "True", isCorrect: true, explanation: "" },
        { text: "False", isCorrect: false, explanation: "" },
      ];
    } else if (
      !QUESTION_TYPES.find((t) => t.value === newType)?.requiresOptions
    ) {
      newOptions = [];
    } else if (question.options.length === 0) {
      newOptions = [
        { text: "", isCorrect: true, explanation: "" },
        { text: "", isCorrect: false, explanation: "" },
        { text: "", isCorrect: false, explanation: "" },
        { text: "", isCorrect: false, explanation: "" },
      ];
    }

    updateQuestion({ questionType: newType, options: newOptions });
  };

  const addOption = () => {
    const newOptions = [
      ...question.options,
      { text: "", isCorrect: false, explanation: "" },
    ];
    updateQuestion({ options: newOptions });
  };

  const removeOption = (optionIndex: number) => {
    if (question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== optionIndex);
      updateQuestion({ options: newOptions });
    }
  };

  const updateOption = (
    optionIndex: number,
    updates: Partial<QuestionData["options"][0]>
  ) => {
    const newOptions = question.options.map((option, i) =>
      i === optionIndex ? { ...option, ...updates } : option
    );
    updateQuestion({ options: newOptions });
  };

  const toggleCorrectAnswer = (optionIndex: number) => {
    const newOptions = question.options.map((option, i) => {
      if (
        question.questionType === "MULTIPLE_CHOICE" ||
        question.questionType === "TRUE_FALSE"
      ) {
        // Single correct answer - uncheck others
        return { ...option, isCorrect: i === optionIndex };
      } else {
        // Multiple correct answers allowed
        return i === optionIndex
          ? { ...option, isCorrect: !option.isCorrect }
          : option;
      }
    });
    updateQuestion({ options: newOptions });
  };

  const getValidationErrors = () => {
    const errors = [];

    if (!question.questionText.trim()) {
      errors.push("Question text is required");
    }

    if (requiresOptions) {
      const validOptions = question.options.filter((opt) => opt.text.trim());
      if (validOptions.length === 0) {
        errors.push("At least one option is required");
      }

      const correctAnswers = validOptions.filter((opt) => opt.isCorrect);
      if (correctAnswers.length === 0) {
        errors.push("At least one correct answer is required");
      }
    }

    return errors;
  };

  const errors = getValidationErrors();
  const hasErrors = errors.length > 0;

  return (
    <Card className={`${hasErrors ? "border-red-200 bg-red-50/50" : ""}`}>
      <CardHeader className="pb-3">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger>
              <Button
                variant="ghost"
                className="p-0 h-auto font-medium text-left"
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span>Question {index + 1}</span>
                  <Badge variant={hasErrors ? "destructive" : "secondary"}>
                    {currentType?.label}
                  </Badge>
                  {question.points !== 1 && (
                    <Badge variant="outline">{question.points} pts</Badge>
                  )}
                  {hasErrors && (
                    <Badge variant="destructive" className="text-xs">
                      {errors.length} error{errors.length > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveUp}
                disabled={!canMoveUp}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveDown}
                disabled={!canMoveDown}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
              {totalQuestions > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onRemove}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <CollapsibleContent className="space-y-4 mt-4">
            <CardContent className="pt-0 space-y-4">
              {/* Question Text */}
              <div className="space-y-2">
                <Label htmlFor={`question-${index}`}>Question Text</Label>
                <Textarea
                  id={`question-${index}`}
                  value={question.questionText}
                  onChange={(e) =>
                    updateQuestion({ questionText: e.target.value })
                  }
                  placeholder="Enter your question here..."
                  rows={2}
                />
              </div>

              {/* Question Type and Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select
                    value={question.questionType}
                    onValueChange={updateQuestionType}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label>Difficulty</Label>
                  <Select
                    value={question.difficulty}
                    onValueChange={(value: any) =>
                      updateQuestion({ difficulty: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    min="1"
                    value={question.points}
                    onChange={(e) =>
                      updateQuestion({ points: parseInt(e.target.value) || 1 })
                    }
                  />
                </div>
              </div>

              {/* Answer Options */}
              {requiresOptions && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Answer Options</Label>
                    {question.questionType !== "TRUE_FALSE" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Option
                      </Button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex items-center gap-2 p-3 border rounded-lg"
                      >
                        <Checkbox
                          checked={option.isCorrect}
                          onCheckedChange={() =>
                            toggleCorrectAnswer(optionIndex)
                          }
                        />
                        <Input
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option.text}
                          onChange={(e) =>
                            updateOption(optionIndex, { text: e.target.value })
                          }
                          className="flex-1"
                        />
                        {question.questionType !== "TRUE_FALSE" &&
                          question.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(optionIndex)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Advanced Settings */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
                <CollapsibleTrigger>
                  <Button
                    variant="ghost"
                    className="p-0 h-auto text-sm text-muted-foreground"
                  >
                    <Settings2 className="w-4 h-4 mr-2" />
                    Advanced Settings
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="space-y-4 mt-4 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hint (Optional)</Label>
                      <Input
                        value={question.hint || ""}
                        onChange={(e) =>
                          updateQuestion({ hint: e.target.value })
                        }
                        placeholder="Helpful hint for students"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Time Limit (seconds)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={question.timeLimit || ""}
                        onChange={(e) =>
                          updateQuestion({
                            timeLimit: e.target.value
                              ? parseInt(e.target.value)
                              : undefined,
                          })
                        }
                        placeholder="No limit"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Explanation (Optional)</Label>
                    <Textarea
                      value={question.explanation || ""}
                      onChange={(e) =>
                        updateQuestion({ explanation: e.target.value })
                      }
                      placeholder="Explain the correct answer..."
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`partial-${index}`}
                        checked={question.allowPartialCredit}
                        onCheckedChange={(checked) =>
                          updateQuestion({ allowPartialCredit: !!checked })
                        }
                      />
                      <Label htmlFor={`partial-${index}`} className="text-sm">
                        Allow Partial Credit
                      </Label>
                    </div>

                    {!requiresOptions && (
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`case-${index}`}
                          checked={question.caseSensitive}
                          onCheckedChange={(checked) =>
                            updateQuestion({ caseSensitive: !!checked })
                          }
                        />
                        <Label htmlFor={`case-${index}`} className="text-sm">
                          Case Sensitive
                        </Label>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Validation Errors */}
              {hasErrors && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">
                        This question needs attention:
                      </p>
                      <ul className="mt-1 text-sm text-red-700">
                        {errors.map((error, i) => (
                          <li key={i} className="list-disc list-inside">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </CardHeader>
    </Card>
  );
}
