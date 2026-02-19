import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Star, BookOpen } from "lucide-react";

export const metadata: Metadata = { title: "Course Analytics" };

export default async function CourseAnalyticsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const course = await db.course.findUnique({
    where: { id: courseId, instructorId: session.user.id },
    include: {
      chapters: {
        include: {
          lessons: { include: { progress: true } },
        },
        orderBy: { position: "asc" },
      },
      _count: { select: { reviews: true, enrollments: true } },
    },
  });

  if (!course) notFound();

  const totalLessons = course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const completionRates = course.chapters.map((chapter) => {
    const lessons = chapter.lessons;
    const totalCompletions = lessons.reduce(
      (acc, l) => acc + l.progress.filter((p) => p.isCompleted).length, 0
    );
    const maxCompletions = lessons.length * course._count.enrollments;
    return {
      title: chapter.title,
      rate: maxCompletions > 0 ? Math.round((totalCompletions / maxCompletions) * 100) : 0,
    };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{course.title} - Analytics</h1>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Students", value: course._count.enrollments, icon: Users },
          { label: "Rating", value: course.averageRating.toFixed(1), icon: Star },
          { label: "Lessons", value: totalLessons, icon: BookOpen },
          { label: "Reviews", value: course._count.reviews, icon: Star },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Chapter Completion Rates</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {completionRates.map((chapter, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{chapter.title}</span>
                <span className="text-muted-foreground">{chapter.rate}%</span>
              </div>
              <Progress value={chapter.rate} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
