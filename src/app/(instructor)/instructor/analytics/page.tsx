import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, BookOpen, Star } from "lucide-react";

export const metadata: Metadata = { title: "Instructor Analytics" };

export default async function InstructorAnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const courses = await db.course.findMany({
    where: { instructorId: session.user.id },
    select: { id: true, title: true, totalStudents: true, averageRating: true, totalReviews: true },
  });

  const courseIds = courses.map((c) => c.id);

  const [totalEnrollments, totalRevenue] = await Promise.all([
    db.enrollment.count({ where: { courseId: { in: courseIds } } }),
    db.payment.aggregate({
      _sum: { amount: true },
      where: { courseId: { in: courseIds }, status: "COMPLETED" },
    }),
  ]);

  const ratedCourses = courses.filter((c) => c.averageRating > 0);
  const avgRating = ratedCourses.length > 0
    ? ratedCourses.reduce((acc, c) => acc + c.averageRating, 0) / ratedCourses.length
    : 0;

  const stats = [
    { label: "Total Students", value: totalEnrollments, icon: Users },
    { label: "Total Revenue", value: `$${(totalRevenue._sum.amount || 0).toFixed(2)}`, icon: DollarSign },
    { label: "Total Courses", value: courses.length, icon: BookOpen },
    { label: "Average Rating", value: avgRating.toFixed(1), icon: Star },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Course Performance</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                <div>
                  <p className="font-medium">{course.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {course.totalStudents} students | {course.totalReviews} reviews
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{course.averageRating.toFixed(1)}</span>
                </div>
              </div>
            ))}
            {courses.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No courses yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
