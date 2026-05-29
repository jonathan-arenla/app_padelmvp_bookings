# PadelPoint

Sistema de **reservas de pistas de pádel** para el club ficticio **Club Punto Verde**.

Stack alineada con PlayPadel: **Expo 54** + **React Native** + **Express** + **Prisma** + **PostgreSQL**.

## Arranque con Docker (recomendado)

```bash
cd /Users/jonathan/Repositorios/personal/PlayPadel/PadelPoint

# Crear envs (solo la primera vez)
cp api/.env.example api/.env
cp app/.env.example app/.env

# Todo: Postgres + API + Expo Web
docker compose up --build
```

| Servicio | URL |
|----------|-----|
| App web | http://localhost:8082 |
| API | http://localhost:4001/health |
| Postgres | `localhost:5433` (user `padel` / pass `padel` / db `padelpoint`) |

Solo backend:

```bash
docker compose up --build api db
```

Reset de base de datos:

```bash
docker compose down -v
docker compose up --build
```

## Login

1. **Mock Google** (por defecto en Docker): en la pantalla de login → *Mock Google (sin OAuth)*  
   Usuario: `demo@padelpoint.dev`

2. **Dev login**: *Acceso demo (dev-login)* — mismo usuario seed.

3. **Google real**:
   - Crea un cliente OAuth “Aplicación web” en [Google Cloud Console](https://console.cloud.google.com/)
   - Añade redirect URIs: `http://localhost:8081`, `https://auth.expo.io/@tu-usuario/padelpoint`
   - Copia el Client ID en `api/.env` → `GOOGLE_CLIENT_ID`
   - Y en `app/.env` → `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - Pon `ALLOW_MOCK_GOOGLE=false` en `api/.env` si quieres forzar tokens reales

## Desarrollo local (sin Docker web)

```bash
# Terminal 1 — infra
docker compose up --build api db

# Terminal 2 — app
cd app
npm install
echo "EXPO_PUBLIC_API_URL=http://localhost:4001" >> .env
npm start
```

## API

| Método | Ruta | Auth |
|--------|------|------|
| POST | `/auth/google` | — |
| POST | `/auth/dev-login` | — (si `ENABLE_DEV_LOGIN=true`) |
| GET | `/club` | — |
| GET | `/bookings` | Bearer |
| GET | `/bookings/slots?courtId=&date=` | Bearer |
| POST | `/bookings` | Bearer |
| POST | `/bookings/:id/cancel` | Bearer |
| GET | `/club-messages` | Bearer |
| POST | `/club-messages` | Bearer |
| GET | `/me` | Bearer |

## Estructura

```
PadelPoint/
├── docker-compose.yml
├── api/          # Express + Prisma
└── app/          # Expo React Native
```
