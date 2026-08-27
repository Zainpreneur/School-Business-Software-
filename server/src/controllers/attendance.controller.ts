import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../config/prisma";

// ---------- Student attendance ----------

export const markStudentAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { date, records } = req.body;

  const results = await prisma.$transaction(
    records.map((r: any) =>
      prisma.studentAttendance.upsert({
        where: { studentId_date: { studentId: r.studentId, date } },
        create: { studentId: r.studentId, date, status: r.status, remarks: r.remarks },
        update: { status: r.status, remarks: r.remarks },
      })
    )
  );

  res.status(201).json({ records: results });
});

export const getStudentAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { studentId, classSectionId, from, to } = req.query;

  const where: any = {};
  if (studentId) where.studentId = String(studentId);
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(String(from));
    if (to) where.date.lte = new Date(String(to));
  }
  if (classSectionId) {
    where.student = { is: { classSectionId: String(classSectionId) } };
  }

  const attendance = await prisma.studentAttendance.findMany({
    where,
    include: { student: { select: { id: true, firstName: true, lastName: true, admissionNo: true } } },
    orderBy: { date: "desc" },
  });

  res.json({ attendance });
});

export const getStudentAttendanceSummary = asyncHandler(async (req: Request, res: Response) => {
  const { studentId } = req.params;
  const grouped = await prisma.studentAttendance.groupBy({
    by: ["status"],
    where: { studentId },
    _count: { status: true },
  });
  res.json({ summary: grouped.map((g) => ({ status: g.status, count: g._count.status })) });
});

// ---------- Staff attendance ----------

export const markStaffAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { date, records } = req.body;

  const results = await prisma.$transaction(
    records.map((r: any) =>
      prisma.staffAttendance.upsert({
        where: { teacherId_date: { teacherId: r.teacherId, date } },
        create: { teacherId: r.teacherId, date, status: r.status, remarks: r.remarks },
        update: { status: r.status, remarks: r.remarks },
      })
    )
  );

  res.status(201).json({ records: results });
});

export const getStaffAttendance = asyncHandler(async (req: Request, res: Response) => {
  const { teacherId, from, to } = req.query;

  const where: any = {};
  if (teacherId) where.teacherId = String(teacherId);
  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(String(from));
    if (to) where.date.lte = new Date(String(to));
  }

  const attendance = await prisma.staffAttendance.findMany({
    where,
    include: { teacher: { include: { user: { select: { firstName: true, lastName: true } } } } },
    orderBy: { date: "desc" },
  });

  res.json({ attendance });
});
