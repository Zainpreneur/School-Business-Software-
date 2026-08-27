import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { getPagination, buildMeta } from "../utils/pagination";

export const listAnnouncements = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const role = req.user!.role;

  const where = {
    OR: [{ audience: { isEmpty: true } }, { audience: { has: role } }],
  };

  const [items, total] = await Promise.all([
    prisma.announcement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { firstName: true, lastName: true, role: true } } },
    }),
    prisma.announcement.count({ where }),
  ]);

  res.json({ items, meta: buildMeta(total, page, limit) });
});

export const createAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const { title, body, audience } = req.body;
  const announcement = await prisma.announcement.create({
    data: { title, body, audience: audience ?? [], authorId: req.user!.id },
  });
  res.status(201).json({ announcement });
});

export const deleteAnnouncement = asyncHandler(async (req: Request, res: Response) => {
  const announcement = await prisma.announcement.findUnique({ where: { id: req.params.id } });
  if (!announcement) throw ApiError.notFound("Announcement not found");
  await prisma.announcement.delete({ where: { id: req.params.id } });
  res.status(204).send();
});
