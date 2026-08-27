import { z } from "zod";

export const updateUserStatusSchema = z.object({
  body: z.object({ isActive: z.boolean() }),
  query: z.any(),
  params: z.any(),
});

export const createParentSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  query: z.any(),
  params: z.any(),
});
