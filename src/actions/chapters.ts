"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createChapterSchema, updateChapterSchema } from "@/schemas/chapter";
import { revalidatePath } from "next/cache";

export async function createChapter(courseId: string, values: { title: string }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return { error: "Course not found" };
  if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }

  const validated = createChapterSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const lastChapter = await db.chapter.findFirst({
    where: { courseId },
    orderBy: { position: "desc" },
  });

  const chapter = await db.chapter.create({
    data: {
      title: validated.data.title,
      courseId,
      position: (lastChapter?.position ?? -1) + 1,
    },
  });

  revalidatePath(`/instructor/courses/${courseId}`);
  return { success: true, chapterId: chapter.id };
}

export async function updateChapter(
  chapterId: string,
  values: { title?: string; description?: string; isFree?: boolean }
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

  const validated = updateChapterSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  await db.chapter.update({
    where: { id: chapterId },
    data: validated.data,
  });

  revalidatePath(`/instructor/courses/${chapter.courseId}`);
  return { success: true };
}

export async function publishChapter(chapterId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const chapter = await db.chapter.findUnique({
    where: { id: chapterId },
    include: { course: true, lessons: true },
  });
  if (!chapter) return { error: "Chapter not found" };
  if (chapter.course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }

  const hasPublishedLesson = chapter.lessons.some((l) => l.isPublished);
  if (!hasPublishedLesson) {
    return { error: "Chapter must have at least one published lesson" };
  }

  await db.chapter.update({
    where: { id: chapterId },
    data: { isPublished: true },
  });

  revalidatePath(`/instructor/courses/${chapter.courseId}`);
  return { success: true };
}

export async function unpublishChapter(chapterId: string) {
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

  await db.chapter.update({
    where: { id: chapterId },
    data: { isPublished: false },
  });

  revalidatePath(`/instructor/courses/${chapter.courseId}`);
  return { success: true };
}

export async function deleteChapter(chapterId: string) {
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

  await db.chapter.delete({ where: { id: chapterId } });
  revalidatePath(`/instructor/courses/${chapter.courseId}`);
  return { success: true };
}

export async function reorderChapters(
  courseId: string,
  updateData: { id: string; position: number }[]
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return { error: "Course not found" };
  if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }

  await db.$transaction(
    updateData.map((item) =>
      db.chapter.update({
        where: { id: item.id },
        data: { position: item.position },
      })
    )
  );

  revalidatePath(`/instructor/courses/${courseId}`);
  return { success: true };
}
