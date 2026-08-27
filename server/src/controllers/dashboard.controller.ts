import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export const getOverview = asyncHandler(async (_req: Request, res: Response) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [
    totalStudents,
    activeStudents,
    totalTeachers,
    totalClasses,
    todayAttendance,
    revenueAgg,
    expenseAgg,
    outstandingAgg,
    recentAnnouncements,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.student.count({ where: { isActive: true } }),
    prisma.teacher.count(),
    prisma.schoolClass.count(),
    prisma.studentAttendance.groupBy({
      by: ["status"],
      where: { date: { gte: today, lt: tomorrow } },
      _count: { status: true },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { paidAt: { gte: startOfMonth } },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: { date: { gte: startOfMonth } },
    }),
    prisma.invoice.aggregate({
      _sum: { totalAmount: true, amountPaid: true },
      where: { status: { in: ["ISSUED", "PARTIALLY_PAID", "OVERDUE"] } },
    }),
    prisma.announcement.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
  ]);

  const totalOutstanding = new Prisma.Decimal(outstandingAgg._sum.totalAmount ?? 0).minus(
    new Prisma.Decimal(outstandingAgg._sum.amountPaid ?? 0)
  );

  res.json({
    students: { total: totalStudents, active: activeStudents },
    teachers: { total: totalTeachers },
    classes: { total: totalClasses },
    attendanceToday: todayAttendance.map((a) => ({ status: a.status, count: a._count.status })),
    finance: {
      monthlyRevenue: revenueAgg._sum.amount ?? 0,
      monthlyExpenses: expenseAgg._sum.amount ?? 0,
      outstandingDues: totalOutstanding,
    },
    recentAnnouncements,
  });
});

export const getFinanceTrends = asyncHandler(async (_req: Request, res: Response) => {
  const months: { label: string; start: Date; end: Date }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    months.push({ label: start.toLocaleString("en-US", { month: "short", year: "2-digit" }), start, end });
  }

  const trends = await Promise.all(
    months.map(async ({ label, start, end }) => {
      const [revenue, expenses] = await Promise.all([
        prisma.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: start, lt: end } } }),
        prisma.expense.aggregate({ _sum: { amount: true }, where: { date: { gte: start, lt: end } } }),
      ]);
      return {
        month: label,
        revenue: revenue._sum.amount ?? 0,
        expenses: expenses._sum.amount ?? 0,
      };
    })
  );

  res.json({ trends });
});
