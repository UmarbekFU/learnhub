"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Lesson } from "@prisma/client";
import { createLesson } from "@/actions/lessons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  PlusCircle,
  GripVertical,
  Loader2,
  ChevronRight,
  Video,
  FileText,
  HelpCircle,
  ClipboardList,
} from "lucide-react";
import Link from "next/link";

const typeIcons: Record<string, React.ElementType> = {
  VIDEO: Video,
  TEXT: FileText,
  QUIZ: HelpCircle,
  ASSIGNMENT: ClipboardList,
};

interface LessonsListProps {
  chapterId: string;
  courseId: string;
  lessons: Lesson[];
}

export function LessonsList({ chapterId, courseId, lessons }: LessonsListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");

  function handleCreate() {
    if (!title.trim()) return;
    startTransition(async () => {
      const result = await createLesson(chapterId, { title });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Lesson created!");
      setTitle("");
      setIsCreating(false);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lessons</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(!isCreating)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Lesson
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isCreating && (
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Lesson title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              disabled={isPending}
            />
            <Button onClick={handleCreate} disabled={isPending || !title.trim()}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Add"
              )}
            </Button>
          </div>
        )}

        {lessons.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            No lessons yet. Add your first lesson.
          </p>
        ) : (
          <div className="space-y-2">
            {lessons.map((lesson) => {
              const TypeIcon = typeIcons[lesson.type] || FileText;
              return (
                <Link
                  key={lesson.id}
                  href={`/instructor/courses/${courseId}/chapters/${chapterId}/lessons/${lesson.id}`}
                  className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <TypeIcon className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{lesson.title}</span>
                      {lesson.isPublished ? (
                        <Badge variant="secondary" className="bg-emerald-500 text-white">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="outline">Draft</Badge>
                      )}
                      {lesson.isFree && (
                        <Badge variant="outline">Free</Badge>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
