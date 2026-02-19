import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CourseEditForm } from "@/components/instructor/course-form";
import { ChaptersList } from "@/components/instructor/chapter-list";
import { Banner } from "@/components/shared/banner";

export const metadata: Metadata = {
  title: "Edit Course",
};

export default async function CourseEditorPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      chapters: {
        orderBy: { position: "asc" },
        include: {
          lessons: {
            orderBy: { position: "asc" },
          },
        },
      },
      category: true,
    },
  });

  if (!course) redirect("/instructor/courses");
  if (course.instructorId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/instructor/courses");
  }

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.categoryId,
    course.chapters.some((ch) => ch.isPublished),
  ];
  const completedFields = requiredFields.filter(Boolean).length;
  const isComplete = completedFields === requiredFields.length;

  return (
    <div className="space-y-6">
      {course.status === "DRAFT" && (
        <Banner
          label={`Complete all fields (${completedFields}/${requiredFields.length}) to publish this course.`}
          variant="warning"
        />
      )}
      {course.status === "PUBLISHED" && (
        <Banner label="This course is live and visible to students." variant="success" />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Course Setup</h1>
          <p className="text-sm text-muted-foreground">
            Complete all fields ({completedFields}/{requiredFields.length})
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <CourseEditForm course={course} categories={categories} />
        </div>
        <div className="space-y-6">
          <ChaptersList courseId={course.id} chapters={course.chapters} />
        </div>
      </div>
    </div>
  );
}
