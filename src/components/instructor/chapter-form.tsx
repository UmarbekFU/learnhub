"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Chapter } from "@prisma/client";
import { updateChapterSchema, type UpdateChapterValues } from "@/schemas/chapter";
import {
  updateChapter,
  publishChapter,
  unpublishChapter,
  deleteChapter,
} from "@/actions/chapters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { toast } from "sonner";
import { Loader2, Trash2, Globe, GlobeLock } from "lucide-react";

interface ChapterEditFormProps {
  chapter: Chapter;
  courseId: string;
}

export function ChapterEditForm({ chapter, courseId }: ChapterEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDelete, setShowDelete] = useState(false);

  const form = useForm<UpdateChapterValues>({
    resolver: zodResolver(updateChapterSchema),
    defaultValues: {
      title: chapter.title,
      description: chapter.description || "",
      isFree: chapter.isFree,
    },
  });

  function onSubmit(values: UpdateChapterValues) {
    startTransition(async () => {
      const result = await updateChapter(chapter.id, values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Chapter updated!");
      router.refresh();
    });
  }

  function handlePublish() {
    startTransition(async () => {
      if (chapter.isPublished) {
        const result = await unpublishChapter(chapter.id);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Chapter unpublished");
      } else {
        const result = await publishChapter(chapter.id);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Chapter published!");
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteChapter(chapter.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Chapter deleted");
      router.push(`/instructor/courses/${courseId}`);
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Chapter Details</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePublish}
                disabled={isPending}
              >
                {chapter.isPublished ? (
                  <>
                    <GlobeLock className="mr-2 h-4 w-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Publish
                  </>
                )}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDelete(true)}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input disabled={isPending} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Chapter description..."
                        disabled={isPending}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFree"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isPending}
                      />
                    </FormControl>
                    <div>
                      <FormLabel>Free Preview</FormLabel>
                      <FormDescription>
                        Allow non-enrolled users to preview this chapter
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <ConfirmModal
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        title="Delete Chapter"
        description="This will permanently delete this chapter and all its lessons."
        confirmLabel="Delete"
        variant="destructive"
        loading={isPending}
      />
    </>
  );
}
