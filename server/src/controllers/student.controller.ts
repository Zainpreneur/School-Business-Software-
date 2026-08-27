import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { getPagination, buildMeta } from "../utils/pagination";

async function generateAdmissionNo() {
  const year = new Date().getFullYear();
  const count = await prisma.student.count();
  return `STU-${year}-${String(count + 1).padStart(4, "0")}`;
}

export const listStudents = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { search, classSectionId, isActive } = req.query;

  const where: any = {};
  if (search) {
    where.OR = [
      { firstName: { contains: String(search), mode: "insensitive" } },
      { lastName: { contains: String(search), mode: "insensitive" } },
      { admissionNo: { contains: String(search), mode: "insensitive" } },
    ];
  }
  if (classSectionId) where.classSectionId = String(classSectionId);
  if (isActive !== undefined) where.isActive = isActive === "true";

  const [items, total] = await Promise.all([
    prisma.student.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        classSection: { include: { schoolClass: true } },
        parent: { include: { user: true } },
      },
    }),
    prisma.student.count({ where }),
  ]);

  res.json({ items, meta: buildMeta(total, page, limit) });
});

export const getStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await prisma.student.findUnique({
    where: { id: req.params.id },
    include: {
      classSection: { include: { schoolClass: true } },
      parent: { include: { user: true } },
      documents: true,
      examResults: { include: { examSubject: { include: { subject: true, exam: true } } } },
      invoices: { include: { payments: true } },
    },
  });
  if (!student) throw ApiError.notFound("Student not found");
  res.json({ student });
});

export const createStudent = asyncHandler(async (req: Request, res: Response) => {
  const admissionNo = await generateAdmissionNo();
  const student = await prisma.student.create({
    data: { ...req.body, admissionNo },
  });
  res.status(201).json({ student });
});

export const updateStudent = asyncHandler(async (req: Request, res: Response) => {
  const student = await prisma.student.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json({ student });
});

export const deleteStudent = asyncHandler(async (req: Request, res: Response) => {
  await prisma.student.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
