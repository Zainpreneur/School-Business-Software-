import { z } from "zod";

export const createTimetableSlotSchema = z.object({
  body: z.object({
    classSectionId: z.string().uuid(),
    subjectId: z.string().uuid(),
    teacherId: z.string().uuid(),
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    endTime: z.string().regex(/^\d{2}:\d{2}$/),
  }),
  query: z.any(),
  params: z.any(),
});
