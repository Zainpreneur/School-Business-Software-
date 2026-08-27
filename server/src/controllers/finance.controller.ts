import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { getPagination, buildMeta } from "../utils/pagination";
import { Prisma } from "@prisma/client";

// ---------- Fee Structures ----------

export const listFeeStructures = asyncHandler(async (_req: Request, res: Response) => {
  const feeStructures = await prisma.feeStructure.findMany({
    include: { classSection: { include: { schoolClass: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json({ feeStructures });
});

export const createFeeStructure = asyncHandler(async (req: Request, res: Response) => {
  const feeStructure = await prisma.feeStructure.create({ data: req.body });
  res.status(201).json({ feeStructure });
});

export const deleteFeeStructure = asyncHandler(async (req: Request, res: Response) => {
  await prisma.feeStructure.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// ---------- Invoices ----------

async function generateInvoiceNo() {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count();
  return `INV-${year}-${String(count + 1).padStart(5, "0")}`;
}

export const listInvoices = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { studentId, status } = req.query;

  const where: any = {};
  if (studentId) where.studentId = String(studentId);
  if (status) where.status = String(status);

  const [items, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      skip,
      take: limit,
      orderBy: { issuedDate: "desc" },
      include: { student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } }, payments: true },
    }),
    prisma.invoice.count({ where }),
  ]);

  res.json({ items, meta: buildMeta(total, page, limit) });
});

export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await prisma.invoice.findUnique({
    where: { id: req.params.id },
    include: { student: true, payments: { orderBy: { paidAt: "desc" } }, feeStructure: true },
  });
  if (!invoice) throw ApiError.notFound("Invoice not found");
  res.json({ invoice });
});

export const createInvoice = asyncHandler(async (req: Request, res: Response) => {
  const { studentId, feeStructureId, amount, discount = 0, taxAmount = 0, dueDate } = req.body;
  const totalAmount = amount - discount + taxAmount;
  const invoiceNo = await generateInvoiceNo();

  const invoice = await prisma.invoice.create({
    data: {
      invoiceNo,
      studentId,
      feeStructureId,
      amount,
      discount,
      taxAmount,
      totalAmount,
      dueDate,
      status: "ISSUED",
    },
  });

  res.status(201).json({ invoice });
});

export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
  const invoiceId = req.params.id;
  const { amount, method, transactionId, notes } = req.body;

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) throw ApiError.notFound("Invoice not found");
  if (invoice.status === "PAID") throw ApiError.badRequest("Invoice is already fully paid");

  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount,
      method,
      transactionId,
      notes,
      receivedBy: req.user?.id,
    },
  });

  const newAmountPaid = new Prisma.Decimal(invoice.amountPaid).plus(amount);
  const total = new Prisma.Decimal(invoice.totalAmount);
  const status = newAmountPaid.gte(total) ? "PAID" : newAmountPaid.gt(0) ? "PARTIALLY_PAID" : invoice.status;

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { amountPaid: newAmountPaid, status },
  });

  res.status(201).json({ payment, invoice: updatedInvoice });
});

export const cancelInvoice = asyncHandler(async (req: Request, res: Response) => {
  const invoice = await prisma.invoice.update({
    where: { id: req.params.id },
    data: { status: "CANCELLED" },
  });
  res.json({ invoice });
});

// ---------- Expenses ----------

export const listExpenses = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { category, from, to } = req.query;

  const where: any = {};
  if (category) where.category = String(category);
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(String(from));
    if (to) where.date.lte = new Date(String(to));
  }

  const [items, total] = await Promise.all([
    prisma.expense.findMany({ where, skip, take: limit, orderBy: { date: "desc" } }),
    prisma.expense.count({ where }),
  ]);

  res.json({ items, meta: buildMeta(total, page, limit) });
});

export const createExpense = asyncHandler(async (req: Request, res: Response) => {
  const expense = await prisma.expense.create({ data: req.body });
  res.status(201).json({ expense });
});

export const deleteExpense = asyncHandler(async (req: Request, res: Response) => {
  await prisma.expense.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
