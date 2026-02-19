"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function createReview(
  courseId: string,
  values: { rating: number; comment?: string }
) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const validated = reviewSchema.safeParse(values);
  if (!validated.success) return { error: "Invalid fields" };

  // Check enrollment
  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (!enrollment) return { error: "You must be enrolled to leave a review" };

  // Check existing review
  const existing = await db.review.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });
  if (existing) return { error: "You already reviewed this course" };

  await db.review.create({
    data: {
      userId: session.user.id,
      courseId,
      rating: validated.data.rating,
      comment: validated.data.comment,
    },
  });

  // Update course average rating
  const reviews = await db.review.aggregate({
    where: { courseId, isVisible: true },
    _avg: { rating: true },
    _count: true,
  });

  await db.course.update({
    where: { id: courseId },
    data: {
      averageRating: reviews._avg.rating || 0,
      totalReviews: reviews._count,
    },
  });

  revalidatePath(`/courses`);
  return { success: true };
}
