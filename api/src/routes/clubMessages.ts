import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const clubMessagesRouter = Router();

clubMessagesRouter.get("/", requireAuth, async (req, res) => {
  const messages = await prisma.clubMessage.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: "asc" },
  });
  res.json(
    messages.map((m) => ({
      id: m.id,
      senderId: m.sender === "USER" ? "user" : "club",
      text: m.text,
      sentAt: m.createdAt.toISOString(),
      read: m.sender === "USER" || m.readAt != null,
    })),
  );
});

clubMessagesRouter.get("/unread", requireAuth, async (req, res) => {
  const count = await prisma.clubMessage.count({
    where: { userId: req.userId!, sender: "CLUB", readAt: null },
  });
  res.json({ unreadCount: count });
});

clubMessagesRouter.post("/read", requireAuth, async (req, res) => {
  await prisma.clubMessage.updateMany({
    where: { userId: req.userId!, sender: "CLUB", readAt: null },
    data: { readAt: new Date() },
  });
  res.json({ ok: true });
});

const sendBody = z.object({ text: z.string().min(1).max(500) });

clubMessagesRouter.post("/", requireAuth, async (req, res) => {
  const parse = sendBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid message" });

  const userMsg = await prisma.clubMessage.create({
    data: { userId: req.userId!, sender: "USER", text: parse.data.text.trim() },
  });

  const autoReply = await prisma.clubMessage.create({
    data: {
      userId: req.userId!,
      sender: "CLUB",
      text: "Gracias por escribir a recepción. Te respondemos en breve. También puedes reservar pista desde la pestaña Pistas.",
    },
  });

  res.status(201).json({
    userMessage: {
      id: userMsg.id,
      senderId: "user",
      text: userMsg.text,
      sentAt: userMsg.createdAt.toISOString(),
      read: true,
    },
    clubReply: {
      id: autoReply.id,
      senderId: "club",
      text: autoReply.text,
      sentAt: autoReply.createdAt.toISOString(),
      read: false,
    },
  });
});
