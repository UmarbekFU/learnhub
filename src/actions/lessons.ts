"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createLessonSchema, updateLessonSchema } from "@/schemas/lesson";
import { revalidatePath } from "next/cache";

export async function createLesson(chapterId: string, values: { title: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    include: { course: true },
  });
  if (!chapter) return { error: "Chapter not found" };
  if (chapter.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }

  const validated = createLessonSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const lastLesson = await db.lesson.findFirst({
    where: { chapterId },
    orderBy: { position: "desc" },
  });

  const lesson = await db.lesson.create({
    data: {
      title: validated.data.title,
      chapterId,
      position: (lastLesson?.position ?? -1) + 1,
    },
  });

  revalidatePath(`/instructor/courses/${chapter.courseId}`);
  return { success: true, lessonId: lesson.id };
}

export async function updateLesson(
  lessonId: string,
  values: {
    title?: string;
    description?: string;
    content?: string;
    type?: "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT";
    videoUrl?: string;
    isFree?: boolean;
    muxAssetId?: string;
    muxPlaybackId?: string;
    duration?: number;
  }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: { include: { course: true } } },
  });
  if (!lesson) return { error: "Lesson not found" };
  if (lesson.chapter.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }

  await db.lesson.update({
    where: { id: lessonId },
    data: values,
  });

  revalidatePath(`/instructor/courses/${lesson.chapter.courseId}`);
  return { success: true };
}

export async function publishLesson(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: { include: { course: true } } },
  });
  if (!lesson) return { error: "Lesson not found" };
  if (lesson.chapter.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }

  if (!lesson.title) {
    return { error: "Lesson must have a title" };
  }

  if (lesson.type === "VIDEO" && !lesson.muxPlaybackId && !lesson.videoUrl) {
    return { error: "Video lesson must have a video" };
  }

  if (lesson.type === "TEXT" && !lesson.content) {
    return { error: "Text lesson must have content" };
  }

  await db.lesson.update({
    where: { id: lessonId },
    data: { isPublished: true },
  });

  revalidatePath(`/instructor/courses/${lesson.chapter.courseId}`);
  return { success: true };
}

export async function unpublishLesson(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: { include: { course: true } } },
  });
  if (!lesson) return { error: "Lesson not found" };
  if (lesson.chapter.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }

  await db.lesson.update({
    where: { id: lessonId },
    data: { isPublished: false },
  });

  revalidatePath(`/instructor/courses/${lesson.chapter.courseId}`);
  return { success: true };
}

export async function deleteLesson(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: { include: { course: true } } },
  });
  if (!lesson) return { error: "Lesson not found" };
  if (lesson.chapter.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }

  await db.lesson.delete({ where: { id: lessonId } });
  revalidatePath(`/instructor/courses/${lesson.chapter.courseId}`);
  return { success: true };
}

export async function reorderLessons(
  chapterId: string,
  updateData: { id: string; position: number }[]
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    include: { course: true },
  });
  if (!chapter) return { error: "Chapter not found" };
  if (chapter.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }

  await db.$transaction(
    updateData.map((item) =>
      db.lesson.update({
        where: { id: item.id },
        data: { position: item.position },
      })
    )
  );

  revalidatePath(`/instructor/courses/${chapter.courseId}`);
  return { success: true };
}
