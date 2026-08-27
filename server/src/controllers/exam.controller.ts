import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { computeGrade } from "../utils/grade";

export const createExam = asyncHandler(async (req: Request, res: Response) => {
  const { name, classSectionId, startDate, endDate, subjects } = req.body;

  const exam = await prisma.exam.create({
    data: {
      name,
      classSectionId,
      startDate,
      endDate,
      subjects: {
        create: subjects.map((s: any) => ({
          subjectId: s.subjectId,
          examDate: s.examDate,
          maxMarks: s.maxMarks ?? 100,
          passMarks: s.passMarks ?? 35,
        })),
      },
    },
    include: { subjects: { include: { subject: true } } },
  });

  res.status(201).json({ exam });
});

export const listExams = asyncHandler(async (req: Request, res: Response) => {
  const { classSectionId } = req.query;
  const where: any = {};
  if (classSectionId) where.classSectionId = String(classSectionId);

  const exams = await prisma.exam.findMany({
    where,
    include: { classSection: { include: { schoolClass: true } }, subjects: { include: { subject: true } } },
    orderBy: { startDate: "desc" },
  });
  res.json({ exams });
});

export const getExam = asyncHandler(async (req: Request, res: Response) => {
  const exam = await prisma.exam.findUnique({
    where: { id: req.params.id },
    include: {
      classSection: { include: { schoolClass: true, students: true } },
      subjects: { include: { subject: true, results: { include: { student: true } } } },
    },
  });
  if (!exam) throw ApiError.notFound("Exam not found");
  res.json({ exam });
});

export const deleteExam = asyncHandler(async (req: Request, res: Response) => {
  await prisma.exam.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export const recordResults = asyncHandler(async (req: Request, res: Response) => {
  const examSubject = await prisma.examSubject.findUnique({ where: { id: req.params.examSubjectId } });
  if (!examSubject) throw ApiError.notFound("Exam subject not found");

  const { results } = req.body;

  const saved = await prisma.$transaction(
    results.map((r: any) =>
      prisma.examResult.upsert({
        where: { examSubjectId_studentId: { examSubjectId: examSubject.id, studentId: r.studentId } },
        create: {
          examSubjectId: examSubject.id,
          studentId: r.studentId,
          marksObtained: r.marksObtained,
          grade: computeGrade(r.marksObtained, examSubject.maxMarks),
          remarks: r.remarks,
        },
        update: {
          marksObtained: r.marksObtained,
          grade: computeGrade(r.marksObtained, examSubject.maxMarks),
          remarks: r.remarks,
        },
      })
    )
  );

  res.status(201).json({ results: saved });
});

// Aggregated report card for one student across all subjects of an exam.
export const getReportCard = asyncHandler(async (req: Request, res: Response) => {
  const { examId, studentId } = req.params;

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      subjects: {
        include: {
          subject: true,
          results: { where: { studentId } },
        },
      },
    },
  });
  if (!exam) throw ApiError.notFound("Exam not found");

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) throw ApiError.notFound("Student not found");

  const subjectResults = exam.subjects.map((es) => {
    const result = es.results[0];
    return {
      subject: es.subject.name,
      maxMarks: es.maxMarks,
      passMarks: es.passMarks,
      marksObtained: result?.marksObtained ?? null,
      grade: result?.grade ?? null,
      passed: result ? result.marksObtained >= es.passMarks : null,
    };
  });

  const totalMax = exam.subjects.reduce((sum, es) => sum + es.maxMarks, 0);
  const totalObtained = subjectResults.reduce((sum, r) => sum + (r.marksObtained ?? 0), 0);
  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

  res.json({
    exam: { id: exam.id, name: exam.name },
    student: { id: student.id, name: `${student.firstName} ${student.lastName}`, admissionNo: student.admissionNo },
    subjects: subjectResults,
    totalMax,
    totalObtained,
    percentage: Math.round(percentage * 100) / 100,
    overallGrade: computeGrade(totalObtained, totalMax || 1),
  });
});
