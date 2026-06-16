"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.meRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
exports.meRouter = (0, express_1.Router)();
exports.meRouter.get("/", auth_1.requireAuth, async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: req.userId } });
    if (!user)
        return res.status(404).json({ error: "User not found" });
    const bookingsCount = await prisma_1.prisma.booking.count({
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
