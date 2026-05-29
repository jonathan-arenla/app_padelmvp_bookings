import { Router } from "express";
import { z } from "zod";
import { BookingStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { SLOT_TIMES, addMinutes, parseDateOnly } from "../lib/slots";

export const bookingsRouter = Router();

bookingsRouter.get("/", requireAuth, async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { userId: req.userId! },
    include: { court: true },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
  });
  res.json(
    bookings.map((b) => ({
      id: b.id,
      courtId: b.courtId,
      courtName: b.court.name,
      date: b.date.toISOString().slice(0, 10),
      start: b.startTime,
      end: b.endTime,
      price: b.price,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    })),
  );
});

bookingsRouter.get("/slots", requireAuth, async (req, res) => {
  const parse = z
    .object({ courtId: z.string(), date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })
    .safeParse(req.query);
  if (!parse.success) return res.status(400).json({ error: "courtId and date required" });

  const { courtId, date } = parse.data;
  const court = await prisma.court.findUnique({ where: { id: courtId } });
  if (!court) return res.status(404).json({ error: "Court not found" });

  const day = parseDateOnly(date);
  const taken = await prisma.booking.findMany({
    where: { courtId, date: day, status: "confirmed" },
    select: { startTime: true },
  });
  const takenSet = new Set(taken.map((t) => t.startTime));

  const slots = SLOT_TIMES.map((start) => ({
    id: `${date}-${courtId}-${start}`,
    start,
    end: addMinutes(start, 90),
    available: !takenSet.has(start),
  }));

  res.json(slots);
});

const createBody = z.object({
  courtId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start: z.string(),
});

bookingsRouter.post("/", requireAuth, async (req, res) => {
  const parse = createBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid body" });

  const { courtId, date, start } = parse.data;
  if (!SLOT_TIMES.includes(start)) {
    return res.status(400).json({ error: "Horario no válido" });
  }

  const court = await prisma.court.findUnique({ where: { id: courtId } });
  if (!court) return res.status(404).json({ error: "Court not found" });

  const day = parseDateOnly(date);
  const conflict = await prisma.booking.findFirst({
    where: { courtId, date: day, startTime: start, status: "confirmed" },
  });
  if (conflict) return res.status(409).json({ error: "Ese horario ya está ocupado" });

  const booking = await prisma.booking.create({
    data: {
      userId: req.userId!,
      courtId,
      date: day,
      startTime: start,
      endTime: addMinutes(start, 90),
      price: court.pricePer90,
      status: BookingStatus.confirmed,
    },
    include: { court: true },
  });

  await prisma.clubMessage.create({
    data: {
      userId: req.userId!,
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

bookingsRouter.post("/:id/cancel", requireAuth, async (req, res) => {
  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, userId: req.userId! },
    include: { court: true },
  });
  if (!booking) return res.status(404).json({ error: "Booking not found" });
  if (booking.status === "cancelled") return res.json({ ok: true });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "cancelled" },
  });

  res.json({ ok: true });
});
