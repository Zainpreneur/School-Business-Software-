import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

// ---------- School Classes ----------

export const listClasses = asyncHandler(async (_req: Request, res: Response) => {
  const classes = await prisma.schoolClass.findMany({
    orderBy: { name: "asc" },
    include: {
      sections: {
        include: {
          classTeacher: { include: { user: true } },
          _count: { select: { students: true } },
        },
      },
    },
  });
  res.json({ classes });
});

export const createClass = asyncHandler(async (req: Request, res: Response) => {
  const schoolClass = await prisma.schoolClass.create({ data: req.body });
  res.status(201).json({ schoolClass });
});

export const deleteClass = asyncHandler(async (req: Request, res: Response) => {
  await prisma.schoolClass.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

// ---------- Class Sections ----------

export const createSection = asyncHandler(async (req: Request, res: Response) => {
  const section = await prisma.classSection.create({
    data: req.body,
    include: { schoolClass: true, classTeacher: { include: { user: true } } },
  });
  res.status(201).json({ section });
});

export const getSection = asyncHandler(async (req: Request, res: Response) => {
  const section = await prisma.classSection.findUnique({
    where: { id: req.params.id },
    include: {
      schoolClass: true,
      classTeacher: { include: { user: true } },
      students: true,
      subjects: { include: { subject: true } },
    },
  });
  if (!section) throw ApiError.notFound("Section not found");
  res.json({ section });
});

export const updateSection = asyncHandler(async (req: Request, res: Response) => {
  const section = await prisma.classSection.update({
    where: { id: req.params.id },
    data: req.body,
    include: { schoolClass: true, classTeacher: { include: { user: true } } },
  });
  res.json({ section });
});

export const deleteSection = asyncHandler(async (req: Request, res: Response) => {
  await prisma.classSection.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export const assignSectionSubjects = asyncHandler(async (req: Request, res: Response) => {
  const { subjectIds } = req.body;
  const sectionId = req.params.id;

  await prisma.classSubject.deleteMany({ where: { classSectionId: sectionId } });
  await prisma.classSubject.createMany({
    data: subjectIds.map((subjectId: string) => ({ classSectionId: sectionId, subjectId })),
  });

  const section = await prisma.classSection.findUnique({
    where: { id: sectionId },
    include: { subjects: { include: { subject: true } } },
  });
  res.json({ section });
});

// ---------- Subjects ----------

export const listSubjects = asyncHandler(async (_req: Request, res: Response) => {
  const subjects = await prisma.subject.findMany({ orderBy: { name: "asc" } });
  res.json({ subjects });
});

export const createSubject = asyncHandler(async (req: Request, res: Response) => {
  const subject = await prisma.subject.create({ data: req.body });
  res.status(201).json({ subject });
});

export const deleteSubject = asyncHandler(async (req: Request, res: Response) => {
  await prisma.subject.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
