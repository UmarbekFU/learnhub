import { Metadata } from "next";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { CourseCard } from "@/components/courses/course-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = await db.category.findUnique({ where: { slug: categorySlug } });
  return { title: category?.name || "Category" };
}

export default async function CategoryBrowsePage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const category = await db.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) redirect("/browse");

  const courses = await db.course.findMany({
    where: { categoryId: category.id, status: "PUBLISHED" },
    include: {
      instructor: { select: { name: true, image: true } },
      category: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{category.name}</h1>
        <p className="text-muted-foreground mt-1">
          {courses.length} course{courses.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16">
          <h3 className="text-lg font-semibold">No courses yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Check back later for courses in this category.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
