import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star, Users } from "lucide-react";

interface CourseCardProps {
  course: {
    slug: string;
    title: string;
    shortDescription?: string | null;
    imageUrl?: string | null;
    price?: number | null;
    salePrice?: number | null;
    level: string;
    totalLessons: number;
    totalStudents: number;
    averageRating: number;
    instructor: { name: string | null };
    category?: { name: string } | null;
  };
}

export function CourseCard({ course }: CourseCardProps) {
  const price = course.salePrice || course.price;

  return (
    <Link href={`/courses/${course.slug}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-video bg-muted">
          {course.imageUrl ? (
            <Image
              src={course.imageUrl}
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          {course.category && (
            <Badge className="absolute left-2 top-2" variant="secondary">
              {course.category.name}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-1">{course.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {course.instructor.name}
          </p>

          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {course.averageRating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {course.totalStudents}
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {course.totalLessons} lessons
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {course.level.replace("_", " ")}
            </Badge>
            <span className="font-bold">
              {price && price > 0 ? `$${price.toFixed(2)}` : "Free"}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
