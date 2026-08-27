import { z } from "zod";

export const createExamSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    classSectionId: z.string().uuid(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    subjects: z
      .array(
        z.object({
          subjectId: z.string().uuid(),
          examDate: z.coerce.date().optional(),
          maxMarks: z.number().positive().optional(),
          passMarks: z.number().nonnegative().optional(),
        })
      )
      .min(1),
  }),
  query: z.any(),
  params: z.any(),
});

export const recordResultsSchema = z.object({
  body: z.object({
    results: z
      .array(
        z.object({
          studentId: z.string().uuid(),
          marksObtained: z.number().nonnegative(),
          remarks: z.string().optional(),
        })
      )
      .min(1),
  }),
  query: z.any(),
  params: z.any(),
});
