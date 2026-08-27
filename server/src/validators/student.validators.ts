import { z } from "zod";

export const createStudentSchema = z.object({
  body: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    dob: z.coerce.date(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    classSectionId: z.string().uuid().optional(),
    parentId: z.string().uuid().optional(),
  }),
  query: z.any(),
  params: z.any(),
});

export const updateStudentSchema = z.object({
  body: createStudentSchema.shape.body.partial().extend({
    isActive: z.boolean().optional(),
  }),
  query: z.any(),
  params: z.any(),
});
