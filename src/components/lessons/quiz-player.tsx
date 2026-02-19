"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { markLessonComplete } from "@/actions/progress";

interface QuizQuestion {
  id: string;
  question: string;
  options: { text: string; isCorrect: boolean }[];
  explanation: string | null;
  points: number;
}

interface QuizPlayerProps {
  lessonId: string;
  questions: QuizQuestion[];
}

export function QuizPlayer({ lessonId, questions }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentQuestion = questions[currentIndex];
  const totalPoints = questions.reduce((acc, q) => acc + q.points, 0);

  function handleAnswer(optionIndex: number) {
    if (showResult) return;
    setSelectedAnswer(optionIndex);
  }

  function handleCheck() {
    if (selectedAnswer === null) return;
    setShowResult(true);
    const isCorrect = currentQuestion.options[selectedAnswer]?.isCorrect;
    if (isCorrect) {
      setScore((s) => s + currentQuestion.points);
    }
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setIsFinished(true);
      startTransition(async () => {
        const finalScore = score + (currentQuestion.options[selectedAnswer!]?.isCorrect ? currentQuestion.points : 0);
        await markLessonComplete(lessonId);
      });
    }
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No quiz questions available for this lesson.
        </CardContent>
      </Card>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / totalPoints) * 100);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quiz Complete!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-5xl font-bold">
            {percentage}%
          </div>
          <p className="text-lg">
            You scored {score} out of {totalPoints} points
          </p>
          <Badge variant={percentage >= 70 ? "default" : "destructive"} className="text-lg px-4 py-1">
            {percentage >= 70 ? "Passed!" : "Try Again"}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Question {currentIndex + 1} of {questions.length}</CardTitle>
          <Badge variant="outline">{currentQuestion.points} pts</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg font-medium">{currentQuestion.question}</p>

        <div className="space-y-2">
          {currentQuestion.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={showResult}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selectedAnswer === i
                  ? showResult
                    ? option.isCorrect
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-primary bg-primary/5"
                  : showResult && option.isCorrect
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex-1">{option.text}</span>
                {showResult && option.isCorrect && (
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                )}
                {showResult && selectedAnswer === i && !option.isCorrect && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </button>
          ))}
        </div>

        {showResult && currentQuestion.explanation && (
          <div className="rounded-lg bg-muted p-3 text-sm">
            <p className="font-medium">Explanation:</p>
            <p className="text-muted-foreground">{currentQuestion.explanation}</p>
          </div>
        )}

        <div className="flex justify-end gap-2">
          {!showResult ? (
            <Button onClick={handleCheck} disabled={selectedAnswer === null}>
              Check Answer
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {currentIndex < questions.length - 1 ? (
                <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
              ) : (
                "Finish Quiz"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
