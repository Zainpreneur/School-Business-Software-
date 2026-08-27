import { z } from "zod";

export const markStudentAttendanceSchema = z.object({
  body: z.object({
    date: z.coerce.date(),
    records: z
      .array(
        z.object({
          studentId: z.string().uuid(),
          status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED", "HALF_DAY"]),
          remarks: z.string().optional(),
        })
      )
      .min(1),
  }),
  query: z.any(),
  params: z.any(),
});

export const markStaffAttendanceSchema = z.object({
  body: z.object({
    date: z.coerce.date(),
    records: z
      .array(
        z.object({
          teacherId: z.string().uuid(),
          status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED", "HALF_DAY"]),
          remarks: z.string().optional(),
        })
      )
      .min(1),
  }),
  query: z.any(),
  params: z.any(),
});
