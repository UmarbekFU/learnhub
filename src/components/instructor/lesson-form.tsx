"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lesson } from "@prisma/client";
import { updateLessonSchema, type UpdateLessonValues } from "@/schemas/lesson";
import {
  updateLesson,
  publishLesson,
  unpublishLesson,
  deleteLesson,
} from "@/actions/lessons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface LessonEditFormProps {
  lesson: Lesson;
  courseId: string;
  chapterId: string;
}

export function LessonEditForm({ lesson, courseId, chapterId }: LessonEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDelete, setShowDelete] = useState(false);

  const form = useForm<UpdateLessonValues>({
    resolver: zodResolver(updateLessonSchema),
    defaultValues: {
      title: lesson.title,
      description: lesson.description || "",
      content: lesson.content || "",
      type: lesson.type,
      videoUrl: lesson.videoUrl || "",
      isFree: lesson.isFree,
    },
  });

  function onSubmit(values: UpdateLessonValues) {
    startTransition(async () => {
      const result = await updateLesson(lesson.id, values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Lesson updated!");
      router.refresh();
    });
  }

  function handlePublish() {
    startTransition(async () => {
      if (lesson.isPublished) {
        const result = await unpublishLesson(lesson.id);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Lesson unpublished");
      } else {
        const result = await publishLesson(lesson.id);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Lesson published!");
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteLesson(lesson.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Lesson deleted");
      router.push(`/instructor/courses/${courseId}/chapters/${chapterId}`);
    });
  }

  const watchType = form.watch("type");

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Lesson Details</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePublish}
                  disabled={isPending}
                >
                  {lesson.isPublished ? (
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lesson Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="VIDEO">Video</SelectItem>
                          <SelectItem value="TEXT">Text</SelectItem>
                          <SelectItem value="QUIZ">Quiz</SelectItem>
                          <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                        </SelectContent>
                      </Select>
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
                          placeholder="Lesson description..."
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
                          Allow non-enrolled users to access this lesson
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

        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            {watchType === "VIDEO" && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Video URL</label>
                      <Input
                        placeholder="https://..."
                        disabled={isPending}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Paste a video URL or upload via Mux integration
                      </p>
                    </div>
                  )}
                />
                {lesson.muxPlaybackId && (
                  <div className="aspect-video rounded-lg bg-black">
                    <p className="flex h-full items-center justify-center text-white text-sm">
                      Video uploaded (Mux ID: {lesson.muxPlaybackId})
                    </p>
                  </div>
                )}
              </div>
            )}

            {(watchType === "TEXT" || watchType === "ASSIGNMENT") && (
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Content</label>
                    <Textarea
                      rows={12}
                      placeholder="Write your lesson content here... (Markdown supported)"
                      disabled={isPending}
                      {...field}
                    />
                    <p className="text-xs text-muted-foreground">
                      Supports Markdown formatting
                    </p>
                  </div>
                )}
              />
            )}

            {watchType === "QUIZ" && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Quiz editor coming soon.</p>
                <p className="text-sm mt-1">
                  For now, use the text content field with quiz questions.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmModal
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        title="Delete Lesson"
        description="This will permanently delete this lesson."
        confirmLabel="Delete"
        variant="destructive"
        loading={isPending}
      />
    </>
  );
}
