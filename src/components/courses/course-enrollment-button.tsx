"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { enrollInCourse } from "@/actions/enrollments";
import { createCourseCheckout } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CourseEnrollmentButtonProps {
  courseId: string;
  courseSlug: string;
  price: number | null;
  isEnrolled: boolean;
}

export function CourseEnrollmentButton({
  courseId,
  courseSlug,
  price,
  isEnrolled,
}: CourseEnrollmentButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (isEnrolled) {
    return (
      <Button
        className="w-full"
        onClick={() => router.push(`/courses/${courseSlug}/learn`)}
      >
        Continue Learning
      </Button>
    );
  }

  function handleEnroll() {
    startTransition(async () => {
      if (price && price > 0) {
        const result = await createCourseCheckout(courseId);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.url) {
          window.location.href = result.url;
        }
        return;
      }

      const result = await enrollInCourse(courseId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Enrolled successfully!");
      router.push(`/courses/${courseSlug}/learn`);
    });
  }

  return (
    <Button className="w-full" onClick={handleEnroll} disabled={isPending}>
      {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {price && price > 0 ? `Enroll - $${price.toFixed(2)}` : "Enroll for Free"}
    </Button>
  );
}
