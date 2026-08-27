import { z } from "zod";

export const createAnnouncementSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    body: z.string().min(1),
    audience: z.array(z.enum(["SUPER_ADMIN", "ADMIN", "TEACHER", "ACCOUNTANT", "STUDENT", "PARENT"])).optional(),
  }),
  query: z.any(),
  params: z.any(),
});
