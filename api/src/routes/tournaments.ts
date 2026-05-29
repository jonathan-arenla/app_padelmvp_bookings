import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { parseDateOnly } from "../lib/slots";

export const tournamentsRouter = Router();

tournamentsRouter.get("/", requireAuth, async (req, res) => {
  const tournaments = await prisma.tournament.findMany({
    include: {
      club: { select: { name: true } },
      participants: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
    },
    orderBy: { startDate: "asc" },
  });

  res.json(tournaments);
});

const createBody = z.object({
  clubId: z.string(),
  name: z.string().min(3),
  description: z.string().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  price: z.number().min(0),
  maxPlayers: z.number().min(2),
});

tournamentsRouter.post("/", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user?.isAdmin) {
    return res.status(403).json({ error: "Only admins can create tournaments" });
  }

  const parse = createBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid body", details: parse.error.format() });

  const { clubId, name, description, startDate, endDate, price, maxPlayers } = parse.data;

  const club = await prisma.club.findUnique({ where: { id: clubId } });
  if (!club) return res.status(404).json({ error: "Club not found" });

  const sDate = parseDateOnly(startDate);
  const eDate = parseDateOnly(endDate);

  if (sDate > eDate) {
    return res.status(400).json({ error: "Start date must be before end date" });
  }

  const tournament = await prisma.tournament.create({
    data: {
      clubId,
      name,
      description,
      startDate: sDate,
      endDate: eDate,
      price,
      maxPlayers,
      status: "upcoming",
    },
  });

  res.status(201).json(tournament);
});

tournamentsRouter.post("/:id/join", requireAuth, async (req, res) => {
  const tournament = await prisma.tournament.findUnique({
    where: { id: req.params.id },
    include: { participants: true },
  });

  if (!tournament) return res.status(404).json({ error: "Tournament not found" });

  if (tournament.participants.length >= tournament.maxPlayers) {
    return res.status(400).json({ error: "Tournament is full" });
  }

  const existing = tournament.participants.find((p) => p.userId === req.userId);
  if (existing) {
    return res.status(400).json({ error: "Already joined" });
  }

  const participant = await prisma.tournamentParticipant.create({
    data: {
      tournamentId: tournament.id,
      userId: req.userId!,
    },
  });

  res.status(201).json(participant);
});

tournamentsRouter.get("/:id", requireAuth, async (req, res) => {
  const tournament = await prisma.tournament.findUnique({
    where: { id: req.params.id },
    include: {
      club: { select: { name: true } },
      participants: {
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      },
      pairs: {
        include: {
          player1: { select: { id: true, name: true, avatarUrl: true } },
          player2: { select: { id: true, name: true, avatarUrl: true } },
        },
      },
      matches: {
        include: {
          pair1: true,
          pair2: true,
          winner: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!tournament) return res.status(404).json({ error: "Tournament not found" });
  res.json(tournament);
});

const createPairBody = z.object({
  player1Id: z.string(),
  player2Id: z.string(),
  name: z.string().optional(),
});

tournamentsRouter.post("/:id/pairs", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user?.isAdmin) return res.status(403).json({ error: "Only admins" });

  const parse = createPairBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid body" });

  const { player1Id, player2Id, name } = parse.data;

  try {
    const pair = await prisma.tournamentPair.create({
      data: {
        tournamentId: req.params.id,
        player1Id,
        player2Id,
        name,
      },
      include: {
        player1: { select: { id: true, name: true, avatarUrl: true } },
        player2: { select: { id: true, name: true, avatarUrl: true } },
      },
    });
    res.status(201).json(pair);
  } catch (e: any) {
    res.status(400).json({ error: "Pair creation failed", details: e.message });
  }
});

const createMatchBody = z.object({
  roundName: z.string(),
  pair1Id: z.string().optional(),
  pair2Id: z.string().optional(),
});

tournamentsRouter.post("/:id/matches", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user?.isAdmin) return res.status(403).json({ error: "Only admins" });

  const parse = createMatchBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid body" });

  const { roundName, pair1Id, pair2Id } = parse.data;

  const match = await prisma.tournamentMatch.create({
    data: {
      tournamentId: req.params.id,
      roundName,
      pair1Id,
      pair2Id,
    },
    include: { pair1: true, pair2: true, winner: true },
  });

  res.status(201).json(match);
});

const updateMatchBody = z.object({
  score: z.string().optional(),
  winnerId: z.string().optional(),
  pair1Id: z.string().optional(),
  pair2Id: z.string().optional(),
});

tournamentsRouter.put("/:id/matches/:matchId", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId! } });
  if (!user?.isAdmin) return res.status(403).json({ error: "Only admins" });

  const parse = updateMatchBody.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: "Invalid body" });

  const { score, winnerId, pair1Id, pair2Id } = parse.data;

  try {
    const match = await prisma.tournamentMatch.update({
      where: { id: req.params.matchId },
      data: {
        score,
        winnerId,
        pair1Id,
        pair2Id,
        status: winnerId ? "completed" : "pending",
      },
      include: { pair1: true, pair2: true, winner: true },
    });
    res.json(match);
  } catch (e: any) {
    res.status(400).json({ error: "Match update failed" });
  }
});
