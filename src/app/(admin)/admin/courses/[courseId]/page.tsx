import { Metadata } from "next";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminCourseActions } from "@/components/admin/admin-course-actions";

export const metadata: Metadata = { title: "Course Review" };

const statusColors: Record<string, string> = {
  DRAFT: "bg-slate-500",
  UNDER_REVIEW: "bg-yellow-500",
  PUBLISHED: "bg-emerald-500",
  ARCHIVED: "bg-red-500",
};

export default async function AdminCourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      instructor: { select: { name: true, email: true } },
      category: { select: { name: true } },
      chapters: {
        orderBy: { position: "asc" },
        include: {
          lessons: { orderBy: { position: "asc" }, select: { id: true, title: true, type: true } },
        },
      },
    },
  });

  if (!course) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">by {course.instructor.name} ({course.instructor.email})</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className={`${statusColors[course.status]} text-white`}>
            {course.status.replace("_", " ")}
          </Badge>
          <AdminCourseActions courseId={course.id} status={course.status} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><span className="font-medium">Category:</span> {course.category?.name || "None"}</div>
            <div><span className="font-medium">Level:</span> {course.level}</div>
            <div><span className="font-medium">Price:</span> {course.price ? `$${course.price.toFixed(2)}` : "Free"}</div>
            <div><span className="font-medium">Students:</span> {course.totalStudents}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {course.description || "No description provided."}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Course Content</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {course.chapters.map((chapter, i) => (
              <div key={chapter.id}>
                <h3 className="font-medium">Chapter {i + 1}: {chapter.title}</h3>
                <div className="ml-4 mt-2 space-y-1">
                  {chapter.lessons.map((lesson, j) => (
                    <p key={lesson.id} className="text-sm text-muted-foreground">
                      {j + 1}. {lesson.title}{" "}
                      <Badge variant="outline" className="ml-2 text-xs">{lesson.type}</Badge>
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {course.chapters.length === 0 && <p className="text-muted-foreground">No chapters yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
