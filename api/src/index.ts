import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { authRouter } from "./routes/auth";
import { meRouter } from "./routes/me";
import { clubRouter } from "./routes/club";
import { bookingsRouter } from "./routes/bookings";
import { clubMessagesRouter } from "./routes/clubMessages";
import { tournamentsRouter } from "./routes/tournaments";
import { statsRouter } from "./routes/stats";

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true, service: "padelpoint-api", ts: Date.now() }));
app.get("/debug-db", (_req, res) => {
  const url = process.env.DATABASE_URL;
  if (!url) return res.json({ status: "undefined" });
  const maskedUrl = url.replace(/:([^:@\s]+)@/, ':***@');
  res.json({ database_url: maskedUrl });
});
app.get("/debug-query", async (_req, res) => {
  try {
    const result = await Promise.race([
      prisma.$queryRaw`SELECT 1 as val`,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Query timeout of 5 seconds")), 5000))
    ]);
    res.json({ ok: true, result });
  } catch (err: any) {
    res.status(500).json({ error: err.message || err.toString() });
  }
});

app.use("/auth", authRouter);
app.use("/me", meRouter);
app.use("/club", clubRouter);
app.use("/bookings", bookingsRouter);
app.use("/club-messages", clubMessagesRouter);
app.use("/tournaments", tournamentsRouter);
app.use("/me/stats", statsRouter);

app.use((req, res) => res.status(404).json({ error: "Not found", path: req.path }));
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Internal error" });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, "0.0.0.0", () => {
  console.log(`PadelPoint API listening on :${port}`);
});
