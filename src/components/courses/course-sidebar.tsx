"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, Circle, Video, FileText, HelpCircle } from "lucide-react";

interface CourseSidebarProps {
  course: {
    slug: string;
    title: string;
    chapters: {
      id: string;
      title: string;
      lessons: {
        id: string;
        title: string;
        type: string;
        progress: { isCompleted: boolean }[];
      }[];
    }[];
  };
}

const typeIcons: Record<string, React.ElementType> = {
  VIDEO: Video,
  TEXT: FileText,
  QUIZ: HelpCircle,
};

export function CourseSidebar({ course }: CourseSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-80 border-r bg-background md:block">
      <div className="border-b p-4">
        <Link href={`/courses/${course.slug}`} className="font-semibold line-clamp-1 hover:underline">
          {course.title}
        </Link>
      </div>
      <ScrollArea className="h-[calc(100%-60px)]">
        <div className="p-4 space-y-4">
          {course.chapters.map((chapter) => (
            <div key={chapter.id}>
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">
                {chapter.title}
              </h3>
              <div className="space-y-1">
                {chapter.lessons.map((lesson) => {
                  const isActive = pathname.includes(lesson.id);
                  const isCompleted = lesson.progress?.[0]?.isCompleted;
                  const TypeIcon = typeIcons[lesson.type] || FileText;

                  return (
                    <Link
                      key={lesson.id}
                      href={`/courses/${course.slug}/learn/${lesson.id}`}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 shrink-0" />
                      )}
                      <TypeIcon className="h-3 w-3 shrink-0" />
                      <span className="line-clamp-1">{lesson.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </aside>
  );
}
