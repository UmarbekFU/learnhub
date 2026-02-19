import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CourseSidebar } from "@/components/courses/course-sidebar";

export default async function CourseLearnLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const course = await db.course.findUnique({
    where: { slug: courseSlug },
    include: {
      chapters: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
            include: {
              progress: {
                where: { userId: session.user.id },
              },
            },
          },
        },
      },
    },
  });

  if (!course) redirect("/browse");

  const enrollment = await db.enrollment.findUnique({
    where: {
      userId_courseId: { userId: session.user.id, courseId: course.id },
    },
  });

  if (!enrollment) redirect(`/courses/${course.slug}`);

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <CourseSidebar course={course} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
