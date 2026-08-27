import { z } from "zod";

export const createFeeStructureSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    classSectionId: z.string().uuid().optional(),
    amount: z.number().positive(),
    frequency: z.enum(["MONTHLY", "QUARTERLY", "ANNUAL", "ONE_TIME"]),
  }),
  query: z.any(),
  params: z.any(),
});

export const createInvoiceSchema = z.object({
  body: z.object({
    studentId: z.string().uuid(),
    feeStructureId: z.string().uuid().optional(),
    amount: z.number().positive(),
    discount: z.number().nonnegative().optional(),
    taxAmount: z.number().nonnegative().optional(),
    dueDate: z.coerce.date(),
  }),
  query: z.any(),
  params: z.any(),
});

export const recordPaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive(),
    method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "ONLINE", "CHEQUE"]),
    transactionId: z.string().optional(),
    notes: z.string().optional(),
  }),
  query: z.any(),
  params: z.any(),
});

export const createExpenseSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    category: z.enum(["SALARY", "UTILITIES", "MAINTENANCE", "SUPPLIES", "TRANSPORT", "MARKETING", "OTHER"]),
    amount: z.number().positive(),
    date: z.coerce.date().optional(),
    notes: z.string().optional(),
  }),
  query: z.any(),
  params: z.any(),
});
