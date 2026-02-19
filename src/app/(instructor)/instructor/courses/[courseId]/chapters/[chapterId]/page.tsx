import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ChapterEditForm } from "@/components/instructor/chapter-form";
import { LessonsList } from "@/components/instructor/lesson-list";
import { Banner } from "@/components/shared/banner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Edit Chapter",
};

export default async function ChapterEditorPage({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const { courseId, chapterId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const chapter = await db.chapter.findUnique({
    where: { id: chapterId, courseId: courseId },
    include: {
      course: true,
      lessons: { orderBy: { position: "asc" } },
    },
  });

  if (!chapter) redirect(`/instructor/courses/${courseId}`);
  if (chapter.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/instructor/courses");
  }

  return (
    <div className="space-y-6">
      {!chapter.isPublished && (
        <Banner
          label="This chapter is not published. It will not be visible to students."
          variant="warning"
        />
      )}

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/instructor/courses/${courseId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Chapter</h1>
          <p className="text-sm text-muted-foreground">{chapter.course.title}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChapterEditForm chapter={chapter} courseId={courseId} />
        <LessonsList
          chapterId={chapter.id}
          courseId={courseId}
          lessons={chapter.lessons}
        />
      </div>
    </div>
  );
}
