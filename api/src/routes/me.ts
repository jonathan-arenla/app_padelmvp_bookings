import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const meRouter = Router();

meRouter.get("/", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user) return res.status(404).json({ error: "User not found" });

  const bookingsCount = await prisma.booking.count({
    where: { userId: user.id, status: "confirmed" },
  });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      handle: user.handle,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      memberSince: user.createdAt.toISOString().slice(0, 7),
      bookingsCount,
    },
  });
});
