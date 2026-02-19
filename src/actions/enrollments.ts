"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { MAX_FREE_ENROLLMENTS } from "@/lib/constants";

export async function enrollInCourse(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course || course.status !== "PUBLISHED") {
    return { error: "Course not found" };
  }

  const existing = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing) return { error: "Already enrolled" };

  if (course.price && course.price > 0) {
    return { error: "This course requires payment" };
  }

  // Enforce free tier enrollment limit
  const subscription = await db.subscription.findUnique({
    where: { userId: session.user.id },
  });
  const plan = subscription?.plan || "FREE";

  if (plan === "FREE") {
    const enrollmentCount = await db.enrollment.count({
      where: { userId: session.user.id },
    });
    if (enrollmentCount >= MAX_FREE_ENROLLMENTS) {
      return {
        error: `Free plan allows up to ${MAX_FREE_ENROLLMENTS} enrollments. Upgrade to Pro for unlimited access.`,
      };
    }
  }

  await db.$transaction([
    db.enrollment.create({
      data: { userId: session.user.id, courseId, status: "ACTIVE" },
    }),
    db.course.update({
      where: { id: courseId },
      data: { totalStudents: { increment: 1 } },
    }),
  ]);

  revalidatePath(`/courses/${course.slug}`);
  revalidatePath("/my-courses");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getEnrollment(courseId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return db.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
}
