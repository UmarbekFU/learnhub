"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { markLessonComplete, markLessonIncomplete } from "@/actions/progress";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useConfettiStore } from "@/stores/use-confetti-store";

interface ProgressButtonProps {
  lessonId: string;
  isCompleted: boolean;
}

export function ProgressButton({ lessonId, isCompleted }: ProgressButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const confetti = useConfettiStore();

  function handleClick() {
    startTransition(async () => {
      if (isCompleted) {
        const result = await markLessonIncomplete(lessonId);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Marked as incomplete");
      } else {
        const result = await markLessonComplete(lessonId);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.courseCompleted) {
          confetti.onOpen();
          toast.success("Congratulations! You completed the course!");
        } else {
          toast.success("Marked as complete!");
        }
      }
      router.refresh();
    });
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={isCompleted ? "outline" : "default"}
      className="w-full"
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isCompleted ? (
        <XCircle className="mr-2 h-4 w-4" />
      ) : (
        <CheckCircle className="mr-2 h-4 w-4" />
      )}
      {isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
    </Button>
  );
}
