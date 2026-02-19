import { Metadata } from "next";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCourseActions } from "@/components/admin/admin-course-actions";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Manage Courses",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-500",
  UNDER_REVIEW: "bg-yellow-500",
  PUBLISHED: "bg-emerald-500",
  ARCHIVED: "bg-red-500",
};

export default async function AdminCoursesPage() {
  const courses = await db.course.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      instructor: { select: { name: true, email: true } },
      category: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Course Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>All Courses ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/courses/${course.id}`} className="hover:underline">
                      {course.title}
                    </Link>
                  </TableCell>
                  <TableCell>{course.instructor.name}</TableCell>
                  <TableCell>{course.category?.name || "-"}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`${statusColors[course.status]} text-white`}
                    >
                      {course.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{course.totalStudents}</TableCell>
                  <TableCell>
                    {course.price ? `$${course.price.toFixed(2)}` : "Free"}
                  </TableCell>
                  <TableCell className="text-right">
                    <AdminCourseActions courseId={course.id} status={course.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
