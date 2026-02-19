"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getAdminDashboardData() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Forbidden");

  const [totalUsers, totalCourses, totalEnrollments, totalRevenue, recentUsers, pendingCourses] =
    await Promise.all([
      db.user.count(),
      db.course.count({ where: { status: "PUBLISHED" } }),
      db.enrollment.count(),
      db.payment.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      }),
      db.user.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          image: true,
        },
      }),
      db.course.findMany({
        where: { status: "UNDER_REVIEW" },
        include: { instructor: { select: { name: true, email: true } } },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

  return {
    stats: {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalRevenue: totalRevenue._sum.amount || 0,
    },
    recentUsers,
    pendingCourses,
  };
}

export async function approveCourse(courseId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Forbidden" };

  await db.course.update({
    where: { id: courseId },
    data: { status: "PUBLISHED" },
  });

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true, title: true },
  });

  if (course) {
    await db.notification.create({
      data: {
        userId: course.instructorId,
        type: "COURSE_UPDATE",
        title: "Course Approved!",
        message: `Your course "${course.title}" has been approved and is now live.`,
        link: `/instructor/courses/${courseId}`,
      },
    });
  }

  revalidatePath("/admin/courses");
  return { success: true };
}

export async function rejectCourse(courseId: string, reason: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Forbidden" };

  await db.course.update({
    where: { id: courseId },
    data: { status: "DRAFT" },
  });

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true, title: true },
  });

  if (course) {
    await db.notification.create({
      data: {
        userId: course.instructorId,
        type: "COURSE_UPDATE",
        title: "Course Needs Changes",
        message: `Your course "${course.title}" needs revisions: ${reason}`,
        link: `/instructor/courses/${courseId}`,
      },
    });
  }

  revalidatePath("/admin/courses");
  return { success: true };
}

export async function updateUserRole(userId: string, role: "STUDENT" | "INSTRUCTOR" | "ADMIN") {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "Forbidden" };

  await db.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/admin/users");
  return { success: true };
}
