"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGoogleIdToken = verifyGoogleIdToken;
const google_auth_library_1 = require("google-auth-library");
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_ANDROID_CLIENT_ID = process.env.GOOGLE_ANDROID_CLIENT_ID || "";
const googleClient = new google_auth_library_1.OAuth2Client();
async function verifyGoogleIdToken(idToken) {
    const allowMock = process.env.ALLOW_MOCK_GOOGLE === "true";
    if (idToken === "mock_google_token" || (allowMock && !GOOGLE_CLIENT_ID)) {
        return {
            providerId: "mock_google_padelpoint",
            email: "demo@padelpoint.dev",
            name: "Demo PadelPoint",
            avatarUrl: "https://i.pravatar.cc/150?u=padelpoint",
        };
    }
    const audiences = [GOOGLE_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID].filter(Boolean);
    if (audiences.length === 0) {
        throw new Error("GOOGLE_CLIENT_ID no configurado en el servidor");
    }
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: audiences.length === 1 ? audiences[0] : audiences,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload.email) {
        throw new Error("Google ID token inválido");
    }
    return {
        providerId: payload.sub,
        email: payload.email,
        name: payload.name,
        avatarUrl: payload.picture,
    };
}
