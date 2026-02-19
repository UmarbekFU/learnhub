"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCourseSchema, type CreateCourseValues } from "@/schemas/course";
import { createCourse } from "@/actions/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewCoursePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateCourseValues>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: { title: "" },
  });

  function onSubmit(values: CreateCourseValues) {
    startTransition(async () => {
      const result = await createCourse(values);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Course created!");
      router.push(`/instructor/courses/${result.courseId}`);
    });
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold">Create a New Course</h1>
      <p className="mt-2 text-muted-foreground">
        Give your course a title. You can change it later.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. 'Advanced Web Development'"
                    disabled={isPending}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  What will you teach in this course?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/instructor/courses">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Course
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
