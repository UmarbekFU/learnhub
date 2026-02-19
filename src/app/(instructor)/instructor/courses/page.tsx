import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Pencil } from "lucide-react";

export const metadata: Metadata = {
  title: "My Courses",
};

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-500",
  UNDER_REVIEW: "bg-yellow-500",
  PUBLISHED: "bg-emerald-500",
  ARCHIVED: "bg-red-500",
};

export default async function InstructorCoursesPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const courses = await db.course.findMany({
    where: { instructorId: session.user.id },
    include: { category: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Course
          </Link>
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16">
          <p className="text-muted-foreground">No courses yet</p>
          <Button className="mt-4" asChild>
            <Link href="/instructor/courses/new">Create your first course</Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="w-[70px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.title}</TableCell>
                  <TableCell>
                    {course.category?.name || "Uncategorized"}
                  </TableCell>
                  <TableCell>
                    {course.price ? `$${course.price.toFixed(2)}` : "Free"}
                  </TableCell>
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
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/instructor/courses/${course.id}`}>
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
