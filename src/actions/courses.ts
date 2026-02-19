"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createCourseSchema,
  updateCourseSchema,
  type CreateCourseValues,
  type UpdateCourseValues,
} from "@/schemas/course";
import { revalidatePath } from "next/cache";

function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
    "-" +
    Date.now().toString(36)
  );
}

export async function createCourse(values: CreateCourseValues) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };
  if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }

  const validated = createCourseSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  const slug = generateSlug(validated.data.title);

  const course = await db.course.create({
    data: {
      title: validated.data.title,
      slug,
      instructorId: session.user.id,
    },
  });

  revalidatePath("/instructor/courses");
  return { success: true, courseId: course.id };
}

export async function updateCourse(courseId: string, values: UpdateCourseValues) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return { error: "Course not found" };
  if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }

  const validated = updateCourseSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  await db.course.update({
    where: { id: courseId },
    data: {
      ...validated.data,
      categoryId: validated.data.categoryId || null,
    },
  });

  revalidatePath(`/instructor/courses/${courseId}`);
  return { success: true };
}

export async function publishCourse(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        include: { lessons: true },
      },
    },
  });

  if (!course) return { error: "Course not found" };
  if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }

  const hasPublishedContent = course.chapters.some(
    (ch) => ch.isPublished && ch.lessons.some((l) => l.isPublished)
  );
  if (!hasPublishedContent) {
    return { error: "Course must have at least one published chapter with a published lesson" };
  }

  if (!course.title || !course.description || !course.imageUrl || !course.categoryId) {
    return { error: "Missing required fields (title, description, image, category)" };
  }

  const totalLessons = course.chapters.reduce(
    (acc, ch) => acc + ch.lessons.filter((l) => l.isPublished).length,
    0
  );
  const totalDuration = course.chapters.reduce(
    (acc, ch) => acc + ch.lessons.reduce((a, l) => a + (l.duration || 0), 0),
    0
  );

  await db.course.update({
    where: { id: courseId },
    data: {
      status: "PUBLISHED",
      totalLessons,
      totalDuration,
      publishedAt: new Date(),
    },
  });

  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath("/browse");
  return { success: true };
}

export async function unpublishCourse(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return { error: "Course not found" };
  if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }

  await db.course.update({
    where: { id: courseId },
    data: { status: "DRAFT" },
  });

  revalidatePath(`/instructor/courses/${courseId}`);
  revalidatePath("/browse");
  return { success: true };
}

export async function deleteCourse(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course) return { error: "Course not found" };
  if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Forbidden" };
  }

  if (course.totalStudents > 0) {
    return { error: "Cannot delete a course with enrolled students" };
  }

  await db.course.delete({ where: { id: courseId } });
  revalidatePath("/instructor/courses");
  return { success: true };
}

export async function getInstructorCourses() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return db.course.findMany({
    where: { instructorId: session.user.id },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });
}
