import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { LessonEditForm } from "@/components/instructor/lesson-form";
import { Banner } from "@/components/shared/banner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Edit Lesson",
};

export default async function LessonEditorPage({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string; lessonId: string }>;
}) {
  const { courseId, chapterId, lessonId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId, chapterId: chapterId },
    include: {
      chapter: { include: { course: true } },
    },
  });

  if (!lesson) redirect(`/instructor/courses/${courseId}/chapters/${chapterId}`);
  if (lesson.chapter.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/instructor/courses");
  }

  return (
    <div className="space-y-6">
      {!lesson.isPublished && (
        <Banner
          label="This lesson is not published. It will not be visible to students."
          variant="warning"
        />
      )}

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/instructor/courses/${courseId}/chapters/${chapterId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Lesson</h1>
          <p className="text-sm text-muted-foreground">
            {lesson.chapter.title} &bull; {lesson.chapter.course.title}
          </p>
        </div>
      </div>

      <LessonEditForm
        lesson={lesson}
        courseId={courseId}
        chapterId={chapterId}
      />
    </div>
  );
}
