"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../lib/prisma");
const jwt_1 = require("../lib/jwt");
const oauth_1 = require("../lib/oauth");
exports.authRouter = (0, express_1.Router)();
const oauthBody = zod_1.z.object({ idToken: zod_1.z.string().min(10) });
exports.authRouter.post("/google", async (req, res) => {
    const parse = oauthBody.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: "Missing idToken" });
    try {
        const profile = await (0, oauth_1.verifyGoogleIdToken)(parse.data.idToken);
        const user = await upsertByGoogle(profile);
        return res.json({ token: (0, jwt_1.signToken)({ sub: user.id }), user: publicUser(user) });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Google auth failed";
        return res.status(401).json({ error: message });
    }
});
exports.authRouter.post("/dev-login", async (_req, res) => {
    if (process.env.ENABLE_DEV_LOGIN !== "true") {
        return res.status(404).json({ error: "Not found" });
    }
    const user = await prisma_1.prisma.user.findUnique({ where: { email: "demo@padelpoint.dev" } });
    if (!user)
        return res.status(500).json({ error: "Demo user no existe — corre el seed" });
    return res.json({ token: (0, jwt_1.signToken)({ sub: user.id }), user: publicUser(user) });
});
async function upsertByGoogle(profile) {
    const byProvider = await prisma_1.prisma.user.findFirst({ where: { googleId: profile.providerId } });
    if (byProvider)
        return byProvider;
    const byEmail = await prisma_1.prisma.user.findUnique({ where: { email: profile.email } });
    if (byEmail) {
        return prisma_1.prisma.user.update({
            where: { id: byEmail.id },
            data: { googleId: profile.providerId, avatarUrl: byEmail.avatarUrl ?? profile.avatarUrl },
        });
    }
    const baseHandle = profile.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 18) || "player";
    const handle = await uniqueHandle(baseHandle);
    return prisma_1.prisma.user.create({
        data: {
            email: profile.email,
            name: profile.name || baseHandle,
            handle,
            avatarUrl: profile.avatarUrl,
            googleId: profile.providerId,
        },
    });
}
async function uniqueHandle(base) {
    let candidate = base;
    for (let i = 0; i < 20; i++) {
        const exists = await prisma_1.prisma.user.findUnique({ where: { handle: candidate } });
        if (!exists)
            return candidate;
        candidate = `${base}_${Math.floor(Math.random() * 1000)}`;
    }
    return `${base}_${Date.now()}`;
}
function publicUser(u) {
    return {
        id: u.id,
        email: u.email,
        name: u.name,
        handle: u.handle,
        avatarUrl: u.avatarUrl,
        phone: u.phone,
        isAdmin: u.isAdmin,
    };
}
