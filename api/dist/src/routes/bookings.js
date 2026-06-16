"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const slots_1 = require("../lib/slots");
exports.bookingsRouter = (0, express_1.Router)();
exports.bookingsRouter.get("/", auth_1.requireAuth, async (req, res) => {
    const bookings = await prisma_1.prisma.booking.findMany({
        where: { userId: req.userId },
        include: { court: true },
        orderBy: [{ date: "desc" }, { startTime: "desc" }],
    });
    res.json(bookings.map((b) => ({
        id: b.id,
        courtId: b.courtId,
        courtName: b.court.name,
        date: b.date.toISOString().slice(0, 10),
        start: b.startTime,
        end: b.endTime,
        price: b.price,
        status: b.status,
        createdAt: b.createdAt.toISOString(),
    })));
});
exports.bookingsRouter.get("/slots", auth_1.requireAuth, async (req, res) => {
    const parse = zod_1.z
        .object({ courtId: zod_1.z.string(), date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })
        .safeParse(req.query);
    if (!parse.success)
        return res.status(400).json({ error: "courtId and date required" });
    const { courtId, date } = parse.data;
    const court = await prisma_1.prisma.court.findUnique({ where: { id: courtId } });
    if (!court)
        return res.status(404).json({ error: "Court not found" });
    const day = (0, slots_1.parseDateOnly)(date);
    const taken = await prisma_1.prisma.booking.findMany({
        where: { courtId, date: day, status: "confirmed" },
        select: { startTime: true },
    });
    const takenSet = new Set(taken.map((t) => t.startTime));
    const slots = slots_1.SLOT_TIMES.map((start) => ({
        id: `${date}-${courtId}-${start}`,
        start,
        end: (0, slots_1.addMinutes)(start, 90),
        available: !takenSet.has(start),
    }));
    res.json(slots);
});
const createBody = zod_1.z.object({
    courtId: zod_1.z.string(),
    date: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    start: zod_1.z.string(),
});
exports.bookingsRouter.post("/", auth_1.requireAuth, async (req, res) => {
    const parse = createBody.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: "Invalid body" });
    const { courtId, date, start } = parse.data;
    if (!slots_1.SLOT_TIMES.includes(start)) {
        return res.status(400).json({ error: "Horario no válido" });
    }
    const court = await prisma_1.prisma.court.findUnique({ where: { id: courtId } });
    if (!court)
        return res.status(404).json({ error: "Court not found" });
    const day = (0, slots_1.parseDateOnly)(date);
    const conflict = await prisma_1.prisma.booking.findFirst({
        where: { courtId, date: day, startTime: start, status: "confirmed" },
    });
    if (conflict)
        return res.status(409).json({ error: "Ese horario ya está ocupado" });
    const booking = await prisma_1.prisma.booking.create({
        data: {
            userId: req.userId,
            courtId,
            date: day,
            startTime: start,
            endTime: (0, slots_1.addMinutes)(start, 90),
            price: court.pricePer90,
            status: client_1.BookingStatus.confirmed,
        },
        include: { court: true },
    });
    await prisma_1.prisma.clubMessage.create({
        data: {
            userId: req.userId,
            sender: "CLUB",
            text: `Reserva confirmada: ${court.name} el ${date} de ${booking.startTime} a ${booking.endTime}. ¡Te esperamos en Club Punto Verde!`,
        },
    });
    res.status(201).json({
        id: booking.id,
        courtId: booking.courtId,
        courtName: booking.court.name,
        date,
        start: booking.startTime,
        end: booking.endTime,
        price: booking.price,
        status: booking.status,
        createdAt: booking.createdAt.toISOString(),
    });
});
exports.bookingsRouter.post("/:id/cancel", auth_1.requireAuth, async (req, res) => {
    const booking = await prisma_1.prisma.booking.findFirst({
        where: { id: req.params.id, userId: req.userId },
        include: { court: true },
    });
    if (!booking)
        return res.status(404).json({ error: "Booking not found" });
    if (booking.status === "cancelled")
        return res.json({ ok: true });
    await prisma_1.prisma.booking.update({
        where: { id: booking.id },
        data: { status: "cancelled" },
    });
    res.json({ ok: true });
});
