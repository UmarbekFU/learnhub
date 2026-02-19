"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Chapter, Lesson } from "@prisma/client";
import { createChapter } from "@/actions/chapters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  PlusCircle,
  GripVertical,
  Pencil,
  Loader2,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface ChaptersListProps {
  courseId: string;
  chapters: (Chapter & { lessons: Lesson[] })[];
}

export function ChaptersList({ courseId, chapters }: ChaptersListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");

  function handleCreate() {
    if (!title.trim()) return;
    startTransition(async () => {
      const result = await createChapter(courseId, { title });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Chapter created!");
      setTitle("");
      setIsCreating(false);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Chapters</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(!isCreating)}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Chapter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isCreating && (
          <div className="mb-4 flex gap-2">
            <Input
              placeholder="Chapter title..."
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

        {chapters.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">
            No chapters yet. Add your first chapter.
          </p>
        ) : (
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                href={`/instructor/courses/${courseId}/chapters/${chapter.id}`}
                className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{chapter.title}</span>
                    {chapter.isPublished ? (
                      <Badge variant="secondary" className="bg-emerald-500 text-white">
                        Published
                      </Badge>
                    ) : (
                      <Badge variant="outline">Draft</Badge>
                    )}
                    {chapter.isFree && (
                      <Badge variant="outline">Free</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {chapter.lessons.length} lesson{chapter.lessons.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
