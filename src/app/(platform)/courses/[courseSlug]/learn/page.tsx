import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function CourseLearnPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
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
            take: 1,
          },
        },
        take: 1,
      },
    },
  });

  const firstLesson = course?.chapters[0]?.lessons[0];
  if (firstLesson) {
    redirect(`/courses/${courseSlug}/learn/${firstLesson.id}`);
  }
  redirect(`/courses/${courseSlug}`);
}
