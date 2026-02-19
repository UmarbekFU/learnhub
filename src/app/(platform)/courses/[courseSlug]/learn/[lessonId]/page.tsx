import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProgressButton } from "@/components/lessons/progress-button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Video, FileText, HelpCircle } from "lucide-react";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}) {
  const { courseSlug, lessonId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      chapter: {
        include: {
          course: true,
          lessons: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
            select: { id: true },
          },
        },
      },
      progress: {
        where: { userId: session.user.id },
      },
    },
  });

  if (!lesson) redirect(`/courses/${courseSlug}`);

  const isCompleted = lesson.progress?.[0]?.isCompleted || false;

  // Get all lessons in course for navigation
  const allChapters = await db.chapter.findMany({
    where: { courseId: lesson.chapter.courseId, isPublished: true },
    orderBy: { position: "asc" },
    include: {
      lessons: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        select: { id: true },
      },
    },
  });

  const allLessonIds = allChapters.flatMap((ch) => ch.lessons.map((l) => l.id));
  const currentIndex = allLessonIds.indexOf(lessonId);
  const prevLessonId = currentIndex > 0 ? allLessonIds[currentIndex - 1] : null;
  const nextLessonId =
    currentIndex < allLessonIds.length - 1
      ? allLessonIds[currentIndex + 1]
      : null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Video / Content Area */}
      <div className="space-y-4">
        {lesson.type === "VIDEO" && (
          <div className="aspect-video rounded-lg bg-black flex items-center justify-center">
            {lesson.muxPlaybackId ? (
              <div className="w-full h-full flex items-center justify-center text-white">
                <Video className="mr-2 h-8 w-8" />
                <span>Video Player (Mux Playback: {lesson.muxPlaybackId})</span>
              </div>
            ) : lesson.videoUrl ? (
              <video
                src={lesson.videoUrl}
                controls
                className="w-full h-full rounded-lg"
              />
            ) : (
              <div className="text-white text-center">
                <Video className="mx-auto h-12 w-12 mb-2" />
                <p>No video uploaded yet</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{lesson.title}</h1>
              <Badge variant="outline">{lesson.type}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {lesson.chapter.title}
            </p>
          </div>
        </div>

        <ProgressButton lessonId={lesson.id} isCompleted={isCompleted} />

        {lesson.description && (
          <>
            <Separator />
            <p className="text-muted-foreground">{lesson.description}</p>
          </>
        )}

        {(lesson.type === "TEXT" || lesson.type === "ASSIGNMENT") && lesson.content && (
          <>
            <Separator />
            <div className="prose dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap">{lesson.content}</div>
            </div>
          </>
        )}

        {lesson.type === "QUIZ" && (
          <>
            <Separator />
            <div className="rounded-lg border p-8 text-center">
              <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-lg font-semibold">Quiz</p>
              <p className="text-sm text-muted-foreground">
                Quiz functionality coming soon
              </p>
            </div>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        {prevLessonId ? (
          <Button variant="outline" asChild>
            <Link href={`/courses/${courseSlug}/learn/${prevLessonId}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous Lesson
            </Link>
          </Button>
        ) : (
          <div />
        )}
        {nextLessonId ? (
          <Button asChild>
            <Link href={`/courses/${courseSlug}/learn/${nextLessonId}`}>
              Next Lesson
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
