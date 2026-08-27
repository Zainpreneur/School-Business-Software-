import { z } from "zod";

export const createTeacherSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
    qualification: z.string().optional(),
    salary: z.number().optional(),
    address: z.string().optional(),
    subjectIds: z.array(z.string().uuid()).optional(),
  }),
  query: z.any(),
  params: z.any(),
});

export const updateTeacherSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
    qualification: z.string().optional(),
    salary: z.number().optional(),
    address: z.string().optional(),
    isActive: z.boolean().optional(),
    subjectIds: z.array(z.string().uuid()).optional(),
  }),
  query: z.any(),
  params: z.any(),
});
