import { z } from "zod";

export const createMovieSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).default(""),
  durationMinutes: z.coerce.number().int().positive().max(1000),
  posterUrl: z.string().trim().max(500).default(""),
});
export const updateMovieSchema = createMovieSchema.partial();
