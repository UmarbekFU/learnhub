"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizQuestionData {
  question: string;
  options: QuizOption[];
  explanation: string;
  points: number;
}

interface QuizEditorProps {
  questions: QuizQuestionData[];
  onChange: (questions: QuizQuestionData[]) => void;
}

export function QuizEditor({ questions, onChange }: QuizEditorProps) {
  function addQuestion() {
    onChange([
      ...questions,
      {
        question: "",
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
        explanation: "",
        points: 1,
      },
    ]);
  }

  function removeQuestion(index: number) {
    onChange(questions.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, data: Partial<QuizQuestionData>) {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...data };
    onChange(updated);
  }

  function updateOption(qIndex: number, oIndex: number, data: Partial<QuizOption>) {
    const updated = [...questions];
    const options = [...updated[qIndex].options];
    options[oIndex] = { ...options[oIndex], ...data };

    // If marking as correct, unmark others
    if (data.isCorrect) {
      options.forEach((opt, i) => {
        if (i !== oIndex) opt.isCorrect = false;
      });
    }

    updated[qIndex] = { ...updated[qIndex], options };
    onChange(updated);
  }

  return (
    <div className="space-y-4">
      {questions.map((q, qIndex) => (
        <Card key={qIndex}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Question {qIndex + 1}</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeQuestion(qIndex)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Question</Label>
              <Textarea
                value={q.question}
                onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                placeholder="Enter question..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Options (check the correct answer)</Label>
              {q.options.map((opt, oIndex) => (
                <div key={oIndex} className="flex items-center gap-2">
                  <Checkbox
                    checked={opt.isCorrect}
                    onCheckedChange={(checked) =>
                      updateOption(qIndex, oIndex, { isCorrect: !!checked })
                    }
                  />
                  <Input
                    value={opt.text}
                    onChange={(e) => updateOption(qIndex, oIndex, { text: e.target.value })}
                    placeholder={`Option ${oIndex + 1}`}
                  />
                </div>
              ))}
            </div>

            <div>
              <Label>Explanation (shown after answering)</Label>
              <Textarea
                value={q.explanation}
                onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                placeholder="Explain the correct answer..."
                rows={2}
              />
            </div>

            <div className="w-24">
              <Label>Points</Label>
              <Input
                type="number"
                min={1}
                value={q.points}
                onChange={(e) => updateQuestion(qIndex, { points: parseInt(e.target.value) || 1 })}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addQuestion} className="w-full">
        <Plus className="mr-2 h-4 w-4" /> Add Question
      </Button>
    </div>
  );
}
