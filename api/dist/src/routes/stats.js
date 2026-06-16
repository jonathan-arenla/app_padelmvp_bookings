"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.statsRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const auth_1 = require("../middleware/auth");
exports.statsRouter = (0, express_1.Router)();
exports.statsRouter.get("/", auth_1.requireAuth, async (req, res) => {
    const userId = req.userId;
    try {
        // 1. Find all pairs the user belongs to
        const userPairs = await prisma_1.prisma.tournamentPair.findMany({
            where: {
                OR: [{ player1Id: userId }, { player2Id: userId }],
            },
            include: {
                player1: { select: { id: true, name: true, avatarUrl: true } },
                player2: { select: { id: true, name: true, avatarUrl: true } },
            },
        });
        const userPairIds = userPairs.map((p) => p.id);
        // 2. Find all matches where the user's pair participated and is completed
        const matches = await prisma_1.prisma.tournamentMatch.findMany({
            where: {
                status: "completed",
                OR: [
                    { pair1Id: { in: userPairIds } },
                    { pair2Id: { in: userPairIds } },
                ],
            },
            include: {
                pair1: {
                    include: {
                        player1: { select: { id: true, name: true, avatarUrl: true } },
                        player2: { select: { id: true, name: true, avatarUrl: true } },
                    },
                },
                pair2: {
                    include: {
                        player1: { select: { id: true, name: true, avatarUrl: true } },
                        player2: { select: { id: true, name: true, avatarUrl: true } },
                    },
                },
                winner: true,
                tournament: { select: { name: true } },
            },
            orderBy: { updatedAt: "desc" },
        });
        const matchesPlayed = matches.length;
        let matchesWon = 0;
        const partnerCounts = {};
        const opponentCounts = {};
        const history = matches.map((m) => {
            const isPair1 = m.pair1Id && userPairIds.includes(m.pair1Id);
            const myPair = isPair1 ? m.pair1 : m.pair2;
            const opponentPair = isPair1 ? m.pair2 : m.pair1;
            const won = m.winnerId === myPair?.id;
            if (won)
                matchesWon++;
            // Track partner
            if (myPair) {
                const partner = myPair.player1Id === userId ? myPair.player2 : myPair.player1;
                if (partner) {
                    if (!partnerCounts[partner.id])
                        partnerCounts[partner.id] = { count: 0, name: partner.name, avatarUrl: partner.avatarUrl };
                    partnerCounts[partner.id].count++;
                }
            }
            // Track opponents if we lost
            if (!won && opponentPair) {
                [opponentPair.player1, opponentPair.player2].forEach(opp => {
                    if (opp) {
                        if (!opponentCounts[opp.id])
                            opponentCounts[opp.id] = { count: 0, name: opp.name, avatarUrl: opp.avatarUrl };
                        opponentCounts[opp.id].count++;
                    }
                });
            }
            return {
                id: m.id,
                tournamentName: m.tournament.name,
                roundName: m.roundName,
                date: m.updatedAt,
                score: m.score,
                won,
                myPairName: myPair ? (myPair.name || `${myPair.player1.name}/${myPair.player2.name}`) : "Yo",
                opponentName: opponentPair ? (opponentPair.name || `${opponentPair.player1.name}/${opponentPair.player2.name}`) : "Desconocido",
            };
        });
        const matchesLost = matchesPlayed - matchesWon;
        const winRate = matchesPlayed > 0 ? Math.round((matchesWon / matchesPlayed) * 100) : 0;
        let frequentPartner = null;
        let maxPartnerCount = 0;
        for (const [id, data] of Object.entries(partnerCounts)) {
            if (data.count > maxPartnerCount) {
                maxPartnerCount = data.count;
                frequentPartner = { id, name: data.name, avatarUrl: data.avatarUrl };
            }
        }
        let nemesis = null;
        let maxNemesisCount = 0;
        for (const [id, data] of Object.entries(opponentCounts)) {
            if (data.count > maxNemesisCount) {
                maxNemesisCount = data.count;
                nemesis = { id, name: data.name, avatarUrl: data.avatarUrl };
            }
        }
        res.json({
            matchesPlayed,
            matchesWon,
            matchesLost,
            winRate,
            frequentPartner,
            nemesis,
            history,
        });
    }
    catch (error) {
        console.error("Error fetching stats", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
