import { Router } from "express";
import { prisma } from "../lib/prisma";

export const clubRouter = Router();

clubRouter.get("/", async (_req, res) => {
  const club = await prisma.club.findUnique({
    where: { slug: "punto-verde" },
    include: { courts: { orderBy: { number: "asc" } } },
  });
  if (!club) return res.status(404).json({ error: "Club not found" });
  res.json({
    id: club.id,
    name: club.name,
    tagline: club.tagline,
    address: club.address,
    phone: club.phone,
    openFrom: club.openFrom,
    openTo: club.openTo,
    rating: club.rating,
    reviews: club.reviewCount,
    courtsCount: club.courtsCount,
    courts: club.courts.map((c) => ({
      id: c.id,
      name: c.name,
      number: c.number,
      surface: c.surface,
      type: c.courtType,
      pricePer90: c.pricePer90,
      imageUrl: c.imageUrl,
      features: c.features,
    })),
  });
});
