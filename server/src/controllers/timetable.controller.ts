import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";

export const createSlot = asyncHandler(async (req: Request, res: Response) => {
  const { classSectionId, teacherId, dayOfWeek, startTime, endTime } = req.body;

  // Prevent double-booking the teacher at the same day/time.
  const clash = await prisma.timetableSlot.findFirst({
    where: { teacherId, dayOfWeek, startTime },
  });
  if (clash) throw ApiError.conflict("Teacher already has a class scheduled at this time");

  const slot = await prisma.timetableSlot.create({
    data: req.body,
    include: { subject: true, teacher: { include: { user: true } }, classSection: { include: { schoolClass: true } } },
  });
  res.status(201).json({ slot });
});

export const listSlotsForSection = asyncHandler(async (req: Request, res: Response) => {
  const slots = await prisma.timetableSlot.findMany({
    where: { classSectionId: req.params.classSectionId },
    include: { subject: true, teacher: { include: { user: true } } },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  res.json({ slots });
});

export const listSlotsForTeacher = asyncHandler(async (req: Request, res: Response) => {
  const slots = await prisma.timetableSlot.findMany({
    where: { teacherId: req.params.teacherId },
    include: { subject: true, classSection: { include: { schoolClass: true } } },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  res.json({ slots });
});

export const deleteSlot = asyncHandler(async (req: Request, res: Response) => {
  await prisma.timetableSlot.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
