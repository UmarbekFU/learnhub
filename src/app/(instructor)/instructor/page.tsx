import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, DollarSign, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Instructor Dashboard",
};

export default async function InstructorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const courses = await db.course.findMany({
    where: { instructorId: session.user.id },
    select: { id: true, totalStudents: true, averageRating: true },
  });

  const courseIds = courses.map((c) => c.id);

  const [totalStudents, totalRevenue] = await Promise.all([
    db.enrollment.count({
      where: { courseId: { in: courseIds } },
    }),
    db.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "COMPLETED",
        courseId: { in: courseIds },
      },
    }),
  ]);

  const avgRating =
    courses.length > 0
      ? courses.reduce((sum, c) => sum + c.averageRating, 0) / courses.length
      : 0;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Instructor Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue._sum.amount || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
