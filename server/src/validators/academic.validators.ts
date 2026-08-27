import { z } from "zod";

export const createClassSchema = z.object({
  body: z.object({ name: z.string().min(1) }),
  query: z.any(),
  params: z.any(),
});

export const createSectionSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    schoolClassId: z.string().uuid(),
    roomNo: z.string().optional(),
    capacity: z.number().int().positive().optional(),
    classTeacherId: z.string().uuid().optional(),
  }),
  query: z.any(),
  params: z.any(),
});

export const updateSectionSchema = z.object({
  body: createSectionSchema.shape.body.partial(),
  query: z.any(),
  params: z.any(),
});

export const createSubjectSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    code: z.string().min(1),
  }),
  query: z.any(),
  params: z.any(),
});

export const assignClassSubjectsSchema = z.object({
  body: z.object({
    subjectIds: z.array(z.string().uuid()),
  }),
  query: z.any(),
  params: z.any(),
});
