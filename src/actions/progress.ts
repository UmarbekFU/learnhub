"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function markLessonComplete(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { chapter: { include: { course: true } } },
  });
  if (!lesson) return { error: "Lesson not found" };

  const courseId = lesson.chapter.courseId;

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (!enrollment) return { error: "Not enrolled" };

  await db.userProgress.upsert({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    update: { isCompleted: true, completedAt: new Date() },
    create: {
      userId: session.user.id,
      lessonId,
      isCompleted: true,
      completedAt: new Date(),
    },
  });

  // Check if entire course is complete
  const allLessons = await db.lesson.findMany({
    where: {
      chapter: { courseId, isPublished: true },
      isPublished: true,
    },
    select: { id: true },
  });

  const completedLessons = await db.userProgress.count({
    where: {
      userId: session.user.id,
      lessonId: { in: allLessons.map((l) => l.id) },
      isCompleted: true,
    },
  });

  let courseCompleted = false;

  if (completedLessons === allLessons.length && allLessons.length > 0) {
    await db.enrollment.update({
      where: { userId_courseId: { userId: session.user.id, courseId } },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    const existingCert = await db.certificate.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    });

    if (!existingCert) {
      await db.certificate.create({
        data: { userId: session.user.id, courseId },
      });
    }

    courseCompleted = true;
  }

  revalidatePath(`/courses/${lesson.chapter.course.slug}/learn/${lessonId}`);
  return { success: true, courseCompleted };
}

export async function markLessonIncomplete(lessonId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await db.userProgress.update({
    where: { userId_lessonId: { userId: session.user.id, lessonId } },
    data: { isCompleted: false, completedAt: null },
  });

  return { success: true };
}

export async function getCourseProgress(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const allLessons = await db.lesson.findMany({
    where: {
      chapter: { courseId, isPublished: true },
      isPublished: true,
    },
    select: { id: true },
  });

  if (allLessons.length === 0) return { percentage: 0, completed: 0, total: 0 };

  const completedCount = await db.userProgress.count({
    where: {
      userId: session.user.id,
      lessonId: { in: allLessons.map((l) => l.id) },
      isCompleted: true,
    },
  });

  return {
    percentage: Math.round((completedCount / allLessons.length) * 100),
    completed: completedCount,
    total: allLessons.length,
  };
}
