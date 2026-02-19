"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Course, Category } from "@prisma/client";
import { updateCourseSchema, type UpdateCourseValues } from "@/schemas/course";
import { updateCourse, publishCourse, unpublishCourse, deleteCourse } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmModal } from "@/components/shared/confirm-modal";
import { toast } from "sonner";
import { Loader2, Trash2, Globe, GlobeLock } from "lucide-react";

interface CourseEditFormProps {
  course: Course & { category: Category | null };
  categories: Category[];
}

export function CourseEditForm({ course, categories }: CourseEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showDelete, setShowDelete] = useState(false);

  const form = useForm<UpdateCourseValues>({
    resolver: zodResolver(updateCourseSchema),
    defaultValues: {
      title: course.title,
      description: course.description || "",
      shortDescription: course.shortDescription || "",
      imageUrl: course.imageUrl || "",
      categoryId: course.categoryId || "",
      price: course.price || 0,
      level: course.level,
    },
  });

  function onSubmit(values: UpdateCourseValues) {
    startTransition(async () => {
      const result = await updateCourse(course.id, values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Course updated!");
      router.refresh();
    });
  }

  function handlePublish() {
    startTransition(async () => {
      if (course.status === "PUBLISHED") {
        const result = await unpublishCourse(course.id);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Course unpublished");
      } else {
        const result = await publishCourse(course.id);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Course published!");
      }
      router.refresh();
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCourse(course.id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Course deleted");
      router.push("/instructor/courses");
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Course Details</CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePublish}
                disabled={isPending}
              >
                {course.status === "PUBLISHED" ? (
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
                        rows={4}
                        placeholder="Describe your course..."
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
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="A brief summary (max 160 chars)"
                        maxLength={160}
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
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thumbnail URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://..."
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
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
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
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
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
                          <SelectItem value="BEGINNER">Beginner</SelectItem>
                          <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                          <SelectItem value="ADVANCED">Advanced</SelectItem>
                          <SelectItem value="ALL_LEVELS">All Levels</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
        title="Delete Course"
        description="This will permanently delete this course and all its content. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        loading={isPending}
      />
    </>
  );
}
