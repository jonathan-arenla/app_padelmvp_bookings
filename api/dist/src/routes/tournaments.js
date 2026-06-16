"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tournamentsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
const slots_1 = require("../lib/slots");
exports.tournamentsRouter = (0, express_1.Router)();
exports.tournamentsRouter.get("/", auth_1.requireAuth, async (req, res) => {
    const tournaments = await prisma_1.prisma.tournament.findMany({
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
const createBody = zod_1.z.object({
    clubId: zod_1.z.string(),
    name: zod_1.z.string().min(3),
    description: zod_1.z.string().optional(),
    startDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    price: zod_1.z.number().min(0),
    maxPlayers: zod_1.z.number().min(2),
});
exports.tournamentsRouter.post("/", auth_1.requireAuth, async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: req.userId } });
    if (!user?.isAdmin) {
        return res.status(403).json({ error: "Only admins can create tournaments" });
    }
    const parse = createBody.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: "Invalid body", details: parse.error.format() });
    const { clubId, name, description, startDate, endDate, price, maxPlayers } = parse.data;
    const club = await prisma_1.prisma.club.findUnique({ where: { id: clubId } });
    if (!club)
        return res.status(404).json({ error: "Club not found" });
    const sDate = (0, slots_1.parseDateOnly)(startDate);
    const eDate = (0, slots_1.parseDateOnly)(endDate);
    if (sDate > eDate) {
        return res.status(400).json({ error: "Start date must be before end date" });
    }
    const tournament = await prisma_1.prisma.tournament.create({
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
exports.tournamentsRouter.post("/:id/join", auth_1.requireAuth, async (req, res) => {
    const tournament = await prisma_1.prisma.tournament.findUnique({
        where: { id: req.params.id },
        include: { participants: true },
    });
    if (!tournament)
        return res.status(404).json({ error: "Tournament not found" });
    if (tournament.participants.length >= tournament.maxPlayers) {
        return res.status(400).json({ error: "Tournament is full" });
    }
    const existing = tournament.participants.find((p) => p.userId === req.userId);
    if (existing) {
        return res.status(400).json({ error: "Already joined" });
    }
    const participant = await prisma_1.prisma.tournamentParticipant.create({
        data: {
            tournamentId: tournament.id,
            userId: req.userId,
        },
    });
    res.status(201).json(participant);
});
exports.tournamentsRouter.get("/:id", auth_1.requireAuth, async (req, res) => {
    const tournament = await prisma_1.prisma.tournament.findUnique({
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
    if (!tournament)
        return res.status(404).json({ error: "Tournament not found" });
    res.json(tournament);
});
const createPairBody = zod_1.z.object({
    player1Id: zod_1.z.string(),
    player2Id: zod_1.z.string(),
    name: zod_1.z.string().optional(),
});
exports.tournamentsRouter.post("/:id/pairs", auth_1.requireAuth, async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: req.userId } });
    if (!user?.isAdmin)
        return res.status(403).json({ error: "Only admins" });
    const parse = createPairBody.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: "Invalid body" });
    const { player1Id, player2Id, name } = parse.data;
    try {
        const pair = await prisma_1.prisma.tournamentPair.create({
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
    }
    catch (e) {
        res.status(400).json({ error: "Pair creation failed", details: e.message });
    }
});
const createMatchBody = zod_1.z.object({
    roundName: zod_1.z.string(),
    pair1Id: zod_1.z.string().optional(),
    pair2Id: zod_1.z.string().optional(),
});
exports.tournamentsRouter.post("/:id/matches", auth_1.requireAuth, async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: req.userId } });
    if (!user?.isAdmin)
        return res.status(403).json({ error: "Only admins" });
    const parse = createMatchBody.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: "Invalid body" });
    const { roundName, pair1Id, pair2Id } = parse.data;
    const match = await prisma_1.prisma.tournamentMatch.create({
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
const updateMatchBody = zod_1.z.object({
    score: zod_1.z.string().optional(),
    winnerId: zod_1.z.string().optional(),
    pair1Id: zod_1.z.string().optional(),
    pair2Id: zod_1.z.string().optional(),
});
exports.tournamentsRouter.put("/:id/matches/:matchId", auth_1.requireAuth, async (req, res) => {
    const user = await prisma_1.prisma.user.findUnique({ where: { id: req.userId } });
    if (!user?.isAdmin)
        return res.status(403).json({ error: "Only admins" });
    const parse = updateMatchBody.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: "Invalid body" });
    const { score, winnerId, pair1Id, pair2Id } = parse.data;
    try {
        const match = await prisma_1.prisma.tournamentMatch.update({
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
    }
    catch (e) {
        res.status(400).json({ error: "Match update failed" });
    }
});
