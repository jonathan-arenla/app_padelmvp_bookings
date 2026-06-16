"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const slots_1 = require("../src/lib/slots");
const prisma = new client_1.PrismaClient();
const COURTS = [
    { number: 1, name: "Pista Central", surface: client_1.CourtSurface.cristal, courtType: client_1.CourtType.indoor, pricePer90: 36, imageUrl: "https://images.unsplash.com/photo-1622163642999-6c8cd14e5e8e?w=600&q=80", features: ["Cristal", "Iluminación LED", "Vídeo replay"] },
    { number: 2, name: "Pista Norte", surface: client_1.CourtSurface.cristal, courtType: client_1.CourtType.indoor, pricePer90: 32, imageUrl: "https://images.unsplash.com/photo-1554068865-7ceebd4ad1b9?w=600&q=80", features: ["Cristal", "Climatizada"] },
    { number: 3, name: "Pista Sur", surface: client_1.CourtSurface.moqueta, courtType: client_1.CourtType.indoor, pricePer90: 28, imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7f02d0a0e?w=600&q=80", features: ["Moqueta", "Ideal principiantes"] },
    { number: 4, name: "Pista Este", surface: client_1.CourtSurface.cristal, courtType: client_1.CourtType.outdoor, pricePer90: 30, imageUrl: "https://images.unsplash.com/photo-1554068865-7ceebd4ad1b9?w=600&q=80", features: ["Exterior", "Cristal"] },
    { number: 5, name: "Pista Oeste", surface: client_1.CourtSurface.moqueta, courtType: client_1.CourtType.indoor, pricePer90: 28, imageUrl: "https://images.unsplash.com/photo-1595435934249-5df7f02d0a0e?w=600&q=80", features: ["Moqueta", "Doble puerta"] },
    { number: 6, name: "Pista VIP", surface: client_1.CourtSurface.cristal, courtType: client_1.CourtType.indoor, pricePer90: 42, imageUrl: "https://images.unsplash.com/photo-1622163642999-6c8cd14e5e8e?w=600&q=80", features: ["Cristal", "Toallas incluidas", "Bebida bienvenida"] },
];
async function main() {
    const club = await prisma.club.upsert({
        where: { slug: "punto-verde" },
        update: {},
        create: {
            slug: "punto-verde",
            name: "Club Punto Verde",
            tagline: "Tu pista, a un toque",
            address: "Av. del Deporte 12, Madrid",
            phone: "+34 910 000 123",
            openFrom: "08:00",
            openTo: "23:00",
            rating: 4.8,
            reviewCount: 214,
            courtsCount: 6,
        },
    });
    for (const c of COURTS) {
        await prisma.court.upsert({
            where: { clubId_number: { clubId: club.id, number: c.number } },
            update: { ...c },
            create: { clubId: club.id, ...c },
        });
    }
    const demoUser = await prisma.user.upsert({
        where: { email: "demo@padelpoint.dev" },
        update: { isAdmin: true },
        create: {
            email: "demo@padelpoint.dev",
            name: "Jonathan García",
            handle: "jonathan",
            phone: "+34 600 000 000",
            googleId: "mock_google_padelpoint",
            isAdmin: true,
        },
    });
    const courts = await prisma.court.findMany({ where: { clubId: club.id } });
    const north = courts.find((c) => c.number === 2);
    if (north) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const date = (0, slots_1.parseDateOnly)(tomorrow.toISOString().slice(0, 10));
        await prisma.booking.upsert({
            where: { id: "seed-booking-demo" },
            update: {},
            create: {
                id: "seed-booking-demo",
                userId: demoUser.id,
                courtId: north.id,
                date,
                startTime: "18:30",
                endTime: "20:00",
                price: north.pricePer90,
                status: "confirmed",
            },
        });
    }
    const existingMsgs = await prisma.clubMessage.count({ where: { userId: demoUser.id } });
    if (existingMsgs === 0) {
        await prisma.clubMessage.createMany({
            data: [
                { userId: demoUser.id, sender: "CLUB", text: "¡Hola! Bienvenido al Club Punto Verde. ¿En qué podemos ayudarte?", readAt: new Date() },
                { userId: demoUser.id, sender: "USER", text: "Hola, ¿tenéis pista libre mañana por la tarde?" },
                { userId: demoUser.id, sender: "CLUB", text: "Sí, tenemos huecos a las 18:00 y 19:30. Reserva desde la app en Pistas.", readAt: new Date() },
            ],
        });
    }
    console.log("✅ Seed OK — Club Punto Verde, demo@padelpoint.dev");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
