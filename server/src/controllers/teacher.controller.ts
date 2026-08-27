import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { getPagination, buildMeta } from "../utils/pagination";

const teacherInclude = {
  user: true,
  subjects: { include: { subject: true } },
};

export const listTeachers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { search } = req.query;

  const where: any = {};
  if (search) {
    where.user = {
      is: {
        OR: [
          { firstName: { contains: String(search), mode: "insensitive" } },
          { lastName: { contains: String(search), mode: "insensitive" } },
          { email: { contains: String(search), mode: "insensitive" } },
        ],
      },
    };
  }

  const [items, total] = await Promise.all([
    prisma.teacher.findMany({ where, skip, take: limit, orderBy: { createdAt: "desc" }, include: teacherInclude }),
    prisma.teacher.count({ where }),
  ]);

  res.json({ items, meta: buildMeta(total, page, limit) });
});

export const getTeacher = asyncHandler(async (req: Request, res: Response) => {
  const teacher = await prisma.teacher.findUnique({
    where: { id: req.params.id },
    include: { ...teacherInclude, classSections: true, timetableSlots: { include: { subject: true, classSection: true } } },
  });
  if (!teacher) throw ApiError.notFound("Teacher not found");
  res.json({ teacher });
});

export const createTeacher = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone, qualification, salary, address, subjectIds } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict("A user with this email already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const employeeCode = `EMP-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

  const teacher = await prisma.teacher.create({
    data: {
      employeeCode,
      qualification,
      salary,
      address,
      user: { create: { email, passwordHash, firstName, lastName, phone, role: "TEACHER" } },
      subjects: subjectIds ? { create: subjectIds.map((id: string) => ({ subjectId: id })) } : undefined,
    },
    include: teacherInclude,
  });

  res.status(201).json({ teacher });
});

export const updateTeacher = asyncHandler(async (req: Request, res: Response) => {
  const { firstName, lastName, phone, isActive, subjectIds, ...teacherFields } = req.body;

  const teacher = await prisma.teacher.findUnique({ where: { id: req.params.id } });
  if (!teacher) throw ApiError.notFound("Teacher not found");

  if (firstName || lastName || phone !== undefined || isActive !== undefined) {
    await prisma.user.update({
      where: { id: teacher.userId },
      data: { firstName, lastName, phone, isActive },
    });
  }

  if (subjectIds) {
    await prisma.teacherSubject.deleteMany({ where: { teacherId: teacher.id } });
    await prisma.teacherSubject.createMany({
      data: subjectIds.map((subjectId: string) => ({ teacherId: teacher.id, subjectId })),
    });
  }

  const updated = await prisma.teacher.update({
    where: { id: req.params.id },
    data: teacherFields,
    include: teacherInclude,
  });

  res.json({ teacher: updated });
});

export const deleteTeacher = asyncHandler(async (req: Request, res: Response) => {
  const teacher = await prisma.teacher.findUnique({ where: { id: req.params.id } });
  if (!teacher) throw ApiError.notFound("Teacher not found");
  await prisma.user.delete({ where: { id: teacher.userId } }); // cascades to teacher
  res.status(204).send();
});
