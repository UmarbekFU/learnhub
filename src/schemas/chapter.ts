import { z } from "zod";

export const createChapterSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const updateChapterSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  isFree: z.boolean().optional(),
});

export type CreateChapterValues = z.infer<typeof createChapterSchema>;
export type UpdateChapterValues = z.infer<typeof updateChapterSchema>;
