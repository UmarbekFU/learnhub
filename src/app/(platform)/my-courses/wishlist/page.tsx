import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CourseCard } from "@/components/courses/course-card";
import { Heart } from "lucide-react";

export const metadata: Metadata = { title: "My Wishlist" };

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const wishlists = await db.wishlist.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const courseIds = wishlists.map((w) => w.courseId);

  const courses = courseIds.length > 0
    ? await db.course.findMany({
        where: { id: { in: courseIds }, status: "PUBLISHED" },
        include: {
          instructor: { select: { name: true, image: true } },
          category: { select: { name: true } },
        },
      })
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Wishlist</h1>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16">
          <Heart className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Your wishlist is empty</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse courses and save the ones you&apos;re interested in.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
