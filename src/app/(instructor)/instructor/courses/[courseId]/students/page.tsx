import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";

export const metadata: Metadata = { title: "Course Students" };

export default async function CourseStudentsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const course = await db.course.findUnique({
    where: { id: courseId, instructorId: session.user.id },
    select: { title: true, totalLessons: true },
  });
  if (!course) notFound();

  const enrollments = await db.enrollment.findMany({
    where: { courseId },
    include: { user: { select: { id: true, name: true, email: true, image: true } } },
    orderBy: { createdAt: "desc" },
  });

  const studentsWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const completedLessons = await db.userProgress.count({
        where: { userId: enrollment.userId, isCompleted: true, lesson: { chapter: { courseId } } },
      });
      return {
        ...enrollment,
        completedLessons,
        progress: course.totalLessons > 0 ? Math.round((completedLessons / course.totalLessons) * 100) : 0,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Students - {course.title}</h1>
        <Badge variant="secondary" className="text-sm">
          <Users className="mr-1 h-4 w-4" /> {enrollments.length} students
        </Badge>
      </div>
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {studentsWithProgress.map((student) => (
              <div key={student.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                <Avatar>
                  <AvatarImage src={student.user.image || ""} />
                  <AvatarFallback>{student.user.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{student.user.name || student.user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Enrolled {new Date(student.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-32 space-y-1">
                  <Progress value={student.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">{student.progress}%</p>
                </div>
                <Badge variant={student.status === "COMPLETED" ? "default" : "outline"}>
                  {student.status}
                </Badge>
              </div>
            ))}
            {studentsWithProgress.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No students enrolled yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
