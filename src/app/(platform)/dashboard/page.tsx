import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Award, Clock, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const [enrollments, certificates] = await Promise.all([
    db.enrollment.findMany({
      where: { userId: session.user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            imageUrl: true,
            totalLessons: true,
            instructor: { select: { name: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 6,
    }),
    db.certificate.count({ where: { userId: session.user.id } }),
  ]);

  // Calculate progress for each enrollment
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
      };
    })
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {session.user.name?.split(" ")[0]}!</h1>
        <p className="mt-1 text-muted-foreground">
          Continue where you left off
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrollments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Certificates Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{certificates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {enrollments.filter((e) => e.status === "ACTIVE").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Continue Learning */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Continue Learning</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/my-courses">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {enrollmentsWithProgress.length === 0 ? (
          <Card className="mt-4">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse our catalog and start learning
              </p>
              <Button className="mt-4" asChild>
                <Link href="/browse">Browse Courses</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {enrollmentsWithProgress.map((enrollment) => (
              <Link
                key={enrollment.id}
                href={`/courses/${enrollment.course.slug}/learn`}
              >
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-1">
                          {enrollment.course.title}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {enrollment.course.instructor.name}
                        </p>
                      </div>
                      {enrollment.status === "COMPLETED" && (
                        <Badge variant="secondary" className="ml-2">
                          Completed
                        </Badge>
                      )}
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Progress
                        </span>
                        <span className="font-medium">
                          {enrollment.progress}%
                        </span>
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
    </div>
  );
}
