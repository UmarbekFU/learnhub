import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export const metadata: Metadata = {
  title: "My Courses",
};

export default async function MyCoursesPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const enrollments = await db.enrollment.findMany({
    where: { userId: session.user.id },
    include: {
      course: {
        include: {
          instructor: { select: { name: true } },
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const enrollmentsWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const totalLessons = await db.lesson.count({
        where: {
          chapter: { courseId: enrollment.courseId, isPublished: true },
          isPublished: true,
        },
      });

      const completedLessons = await db.userProgress.count({
        where: {
          userId: session.user.id,
          isCompleted: true,
          lesson: {
            chapter: { courseId: enrollment.courseId, isPublished: true },
            isPublished: true,
          },
        },
      });

      return {
        ...enrollment,
        progress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        completedLessons,
        totalLessons,
      };
    })
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Courses</h1>

      {enrollmentsWithProgress.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16">
          <BookOpen className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse our catalog and start learning
          </p>
          <Button className="mt-4" asChild>
            <Link href="/browse">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollmentsWithProgress.map((enrollment) => (
            <Link
              key={enrollment.id}
              href={`/courses/${enrollment.course.slug}/learn`}
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="relative aspect-video bg-muted">
                  {enrollment.course.imageUrl ? (
                    <Image
                      src={enrollment.course.imageUrl}
                      alt={enrollment.course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold line-clamp-1">
                    {enrollment.course.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {enrollment.course.instructor.name}
                  </p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {enrollment.completedLessons}/{enrollment.totalLessons} lessons
                      </span>
                      <div className="flex items-center gap-2">
                        {enrollment.status === "COMPLETED" && (
                          <Badge variant="secondary" className="bg-emerald-500 text-white">
                            Completed
                          </Badge>
                        )}
                        <span className="font-medium">{enrollment.progress}%</span>
                      </div>
                    </div>
                    <Progress value={enrollment.progress} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
