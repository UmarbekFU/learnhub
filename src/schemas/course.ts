import { z } from "zod";

export const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
});

export const updateCourseSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(10).optional(),
  shortDescription: z.string().max(160).optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  price: z.number().min(0).optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED", "ALL_LEVELS"]).optional(),
  requirements: z.array(z.string()).optional(),
  learningOutcomes: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateCourseValues = z.infer<typeof createCourseSchema>;
export type UpdateCourseValues = z.infer<typeof updateCourseSchema>;
