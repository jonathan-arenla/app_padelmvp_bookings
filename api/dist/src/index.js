"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const auth_1 = require("./routes/auth");
const me_1 = require("./routes/me");
const club_1 = require("./routes/club");
const bookings_1 = require("./routes/bookings");
const clubMessages_1 = require("./routes/clubMessages");
const tournaments_1 = require("./routes/tournaments");
const stats_1 = require("./routes/stats");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "1mb" }));
app.use((0, morgan_1.default)("dev"));
app.get("/health", (_req, res) => res.json({ ok: true, service: "padelpoint-api", ts: Date.now() }));
app.use("/auth", auth_1.authRouter);
app.use("/me", me_1.meRouter);
app.use("/club", club_1.clubRouter);
app.use("/bookings", bookings_1.bookingsRouter);
app.use("/club-messages", clubMessages_1.clubMessagesRouter);
app.use("/tournaments", tournaments_1.tournamentsRouter);
app.use("/me/stats", stats_1.statsRouter);
app.use((req, res) => res.status(404).json({ error: "Not found", path: req.path }));
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: err.message || "Internal error" });
});
const port = Number(process.env.PORT || 4000);
app.listen(port, "0.0.0.0", () => {
    console.log(`PadelPoint API listening on :${port}`);
});
