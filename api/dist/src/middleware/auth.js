"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jwt_1 = require("../lib/jwt");
function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing Bearer token" });
    }
    try {
        const payload = (0, jwt_1.verifyToken)(header.slice(7));
        req.userId = payload.sub;
        next();
    }
    catch {
        return res.status(401).json({ error: "Invalid token" });
    }
}
