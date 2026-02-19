import { Metadata } from "next";
import { db } from "@/lib/db";
import { CourseCard } from "@/components/courses/course-card";
import { SearchInput } from "@/components/courses/search-input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Browse Courses",
};

interface BrowsePageProps {
  searchParams: Promise<{ q?: string; category?: string; level?: string }>;
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const { q, category, level } = await searchParams;

  const courses = await db.course.findMany({
    where: {
      status: "PUBLISHED",
      ...(q && {
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { tags: { hasSome: [q.toLowerCase()] } },
        ],
      }),
      ...(category && { category: { slug: category } }),
      ...(level && { level: level as any }),
    },
    include: {
      instructor: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: [{ isFeatured: "desc" }, { totalStudents: "desc" }],
  });

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Browse Courses</h1>
        <p className="mt-1 text-muted-foreground">
          Discover courses to advance your skills
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="w-full md:w-96">
          <SearchInput />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={!category ? "default" : "outline"}
            size="sm"
            asChild
          >
            <Link href="/browse">All</Link>
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={category === cat.slug ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={`/browse?category=${cat.slug}`}>{cat.name}</Link>
            </Button>
          ))}
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-card py-16">
          <p className="text-lg font-semibold">No courses found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
