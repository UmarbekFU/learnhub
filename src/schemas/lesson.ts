import { z } from "zod";

export const createLessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const updateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  type: z.enum(["VIDEO", "TEXT", "QUIZ", "ASSIGNMENT"]).optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  isFree: z.boolean().optional(),
});

export type CreateLessonValues = z.infer<typeof createLessonSchema>;
export type UpdateLessonValues = z.infer<typeof updateLessonSchema>;
