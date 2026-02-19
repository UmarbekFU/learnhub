import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CourseEnrollmentButton } from "@/components/courses/course-enrollment-button";
import {
  BookOpen,
  Clock,
  Star,
  Users,
  CheckCircle,
  Globe,
  BarChart3,
} from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}): Promise<Metadata> {
  const { courseSlug } = await params;
  const course = await db.course.findUnique({
    where: { slug: courseSlug },
    select: { title: true, shortDescription: true },
  });
  return {
    title: course?.title || "Course",
    description: course?.shortDescription || undefined,
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const session = await auth();

  const course = await db.course.findUnique({
    where: { slug: courseSlug, status: "PUBLISHED" },
    include: {
      instructor: { select: { name: true, image: true, bio: true, headline: true } },
      category: { select: { name: true } },
      chapters: {
        where: { isPublished: true },
        orderBy: { position: "asc" },
        include: {
          lessons: {
            where: { isPublished: true },
            orderBy: { position: "asc" },
            select: { id: true, title: true, type: true, duration: true, isFree: true },
          },
        },
      },
      reviews: {
        where: { isVisible: true },
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!course) notFound();

  const enrollment = session?.user?.id
    ? await db.enrollment.findUnique({
        where: {
          userId_courseId: { userId: session.user.id, courseId: course.id },
        },
      })
    : null;

  const totalDurationMinutes = Math.round(course.totalDuration / 60);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Hero */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              {course.category && (
                <Badge variant="secondary">{course.category.name}</Badge>
              )}
              <Badge variant="outline">{course.level.replace("_", " ")}</Badge>
            </div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="mt-4 text-muted-foreground">{course.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {course.averageRating.toFixed(1)} ({course.totalReviews} reviews)
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {course.totalStudents} students
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                {course.totalLessons} lessons
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {totalDurationMinutes} min total
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {course.language.toUpperCase()}
              </div>
            </div>

            <p className="mt-2 text-sm">
              By{" "}
              <span className="font-medium">{course.instructor.name}</span>
              {course.instructor.headline && (
                <span className="text-muted-foreground">
                  {" "}
                  &bull; {course.instructor.headline}
                </span>
              )}
            </p>
          </div>

          {/* Learning Outcomes */}
          {course.learningOutcomes.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  What you&apos;ll learn
                </h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {course.learningOutcomes.map((outcome, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm">{outcome}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Course Content */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Course Content</h2>
            <div className="space-y-2">
              {course.chapters.map((chapter) => (
                <div key={chapter.id} className="rounded-lg border">
                  <div className="flex items-center justify-between p-4">
                    <h3 className="font-medium">{chapter.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {chapter.lessons.length} lessons
                    </span>
                  </div>
                  <div className="border-t px-4 py-2">
                    {chapter.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between py-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-3 w-3 text-muted-foreground" />
                          <span>{lesson.title}</span>
                          {lesson.isFree && (
                            <Badge variant="outline" className="text-xs">
                              Free
                            </Badge>
                          )}
                        </div>
                        {lesson.duration && (
                          <span className="text-muted-foreground">
                            {Math.round(lesson.duration / 60)} min
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reviews */}
          {course.reviews.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Student Reviews</h2>
              <div className="space-y-4">
                {course.reviews.map((review) => (
                  <div key={review.id} className="rounded-lg border p-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{review.user.name}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:sticky lg:top-20 h-fit">
          <Card>
            <div className="relative aspect-video">
              {course.imageUrl ? (
                <Image
                  src={course.imageUrl}
                  alt={course.title}
                  fill
                  className="rounded-t-lg object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center rounded-t-lg bg-muted">
                  <BookOpen className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="text-3xl font-bold">
                {course.price && course.price > 0
                  ? `$${(course.salePrice || course.price).toFixed(2)}`
                  : "Free"}
                {course.salePrice && course.price && (
                  <span className="ml-2 text-lg text-muted-foreground line-through">
                    ${course.price.toFixed(2)}
                  </span>
                )}
              </div>

              <CourseEnrollmentButton
                courseId={course.id}
                courseSlug={course.slug}
                price={course.salePrice || course.price}
                isEnrolled={!!enrollment}
              />

              <Separator />

              {course.requirements.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Requirements</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {course.requirements.map((req, i) => (
                      <li key={i}>• {req}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
