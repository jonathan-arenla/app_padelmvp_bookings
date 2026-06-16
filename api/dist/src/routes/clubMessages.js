"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clubMessagesRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
exports.clubMessagesRouter = (0, express_1.Router)();
exports.clubMessagesRouter.get("/", auth_1.requireAuth, async (req, res) => {
    const messages = await prisma_1.prisma.clubMessage.findMany({
        where: { userId: req.userId },
        orderBy: { createdAt: "asc" },
    });
    res.json(messages.map((m) => ({
        id: m.id,
        senderId: m.sender === "USER" ? "user" : "club",
        text: m.text,
        sentAt: m.createdAt.toISOString(),
        read: m.sender === "USER" || m.readAt != null,
    })));
});
exports.clubMessagesRouter.get("/unread", auth_1.requireAuth, async (req, res) => {
    const count = await prisma_1.prisma.clubMessage.count({
        where: { userId: req.userId, sender: "CLUB", readAt: null },
    });
    res.json({ unreadCount: count });
});
exports.clubMessagesRouter.post("/read", auth_1.requireAuth, async (req, res) => {
    await prisma_1.prisma.clubMessage.updateMany({
        where: { userId: req.userId, sender: "CLUB", readAt: null },
        data: { readAt: new Date() },
    });
    res.json({ ok: true });
});
const sendBody = zod_1.z.object({ text: zod_1.z.string().min(1).max(500) });
exports.clubMessagesRouter.post("/", auth_1.requireAuth, async (req, res) => {
    const parse = sendBody.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: "Invalid message" });
    const userMsg = await prisma_1.prisma.clubMessage.create({
        data: { userId: req.userId, sender: "USER", text: parse.data.text.trim() },
    });
    const autoReply = await prisma_1.prisma.clubMessage.create({
        data: {
            userId: req.userId,
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
