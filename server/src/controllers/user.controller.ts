import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { ApiError } from "../utils/ApiError";
import { getPagination, buildMeta } from "../utils/pagination";

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { role, search } = req.query;

  const where: any = {};
  if (role) where.role = String(role);
  if (search) {
    where.OR = [
      { firstName: { contains: String(search), mode: "insensitive" } },
      { lastName: { contains: String(search), mode: "insensitive" } },
      { email: { contains: String(search), mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ items, meta: buildMeta(total, page, limit) });
});

export const updateUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { isActive } = req.body;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { isActive },
    select: { id: true, email: true, isActive: true },
  });
  res.json({ user });
});

export const createParent = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, phone, address } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict("A user with this email already exists");

  const passwordHash = await bcrypt.hash(password, 10);

  const parent = await prisma.parent.create({
    data: {
      address,
      user: { create: { email, passwordHash, firstName, lastName, phone, role: "PARENT" } },
    },
    include: { user: true },
  });

  res.status(201).json({ parent });
});

export const listParents = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const [items, total] = await Promise.all([
    prisma.parent.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: true, students: { select: { id: true, firstName: true, lastName: true } } },
    }),
    prisma.parent.count(),
  ]);
  res.json({ items, meta: buildMeta(total, page, limit) });
});
