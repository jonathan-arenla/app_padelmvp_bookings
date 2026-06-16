--
-- PostgreSQL database dump
--

\restrict DyZJSeLerl7AMACk9uhVSRYumNPXTw11xQOlGsCmIrg2Vef2kef1h7G7hsw2SxF

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: BookingStatus; Type: TYPE; Schema: public; Owner: padel
--

CREATE TYPE public."BookingStatus" AS ENUM (
    'confirmed',
    'cancelled'
);


ALTER TYPE public."BookingStatus" OWNER TO padel;

--
-- Name: CourtSurface; Type: TYPE; Schema: public; Owner: padel
--

CREATE TYPE public."CourtSurface" AS ENUM (
    'cristal',
    'moqueta',
    'hierba'
);


ALTER TYPE public."CourtSurface" OWNER TO padel;

--
-- Name: CourtType; Type: TYPE; Schema: public; Owner: padel
--

CREATE TYPE public."CourtType" AS ENUM (
    'indoor',
    'outdoor'
);


ALTER TYPE public."CourtType" OWNER TO padel;

--
-- Name: MessageSender; Type: TYPE; Schema: public; Owner: padel
--

CREATE TYPE public."MessageSender" AS ENUM (
    'USER',
    'CLUB'
);


ALTER TYPE public."MessageSender" OWNER TO padel;

--
-- Name: TournamentStatus; Type: TYPE; Schema: public; Owner: padel
--

CREATE TYPE public."TournamentStatus" AS ENUM (
    'upcoming',
    'ongoing',
    'completed'
);


ALTER TYPE public."TournamentStatus" OWNER TO padel;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Booking; Type: TABLE; Schema: public; Owner: padel
--

CREATE TABLE public."Booking" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "courtId" text NOT NULL,
    date date NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    price integer NOT NULL,
    status public."BookingStatus" DEFAULT 'confirmed'::public."BookingStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Booking" OWNER TO padel;

--
-- Name: Club; Type: TABLE; Schema: public; Owner: padel
--

CREATE TABLE public."Club" (
    id text NOT NULL,
    slug text NOT NULL,
    name text NOT NULL,
    tagline text,
    address text,
    phone text,
    "openFrom" text DEFAULT '08:00'::text NOT NULL,
    "openTo" text DEFAULT '23:00'::text NOT NULL,
    rating double precision DEFAULT 4.8 NOT NULL,
    "reviewCount" integer DEFAULT 0 NOT NULL,
    "courtsCount" integer DEFAULT 6 NOT NULL
);


ALTER TABLE public."Club" OWNER TO padel;

--
-- Name: ClubMessage; Type: TABLE; Schema: public; Owner: padel
--

CREATE TABLE public."ClubMessage" (
    id text NOT NULL,
    "userId" text NOT NULL,
    sender public."MessageSender" NOT NULL,
    text text NOT NULL,
    "readAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ClubMessage" OWNER TO padel;

--
-- Name: Court; Type: TABLE; Schema: public; Owner: padel
--

CREATE TABLE public."Court" (
    id text NOT NULL,
    "clubId" text NOT NULL,
    name text NOT NULL,
    number integer NOT NULL,
    surface public."CourtSurface" NOT NULL,
    "courtType" public."CourtType" NOT NULL,
    "pricePer90" integer NOT NULL,
    "imageUrl" text,
    features text[]
);


ALTER TABLE public."Court" OWNER TO padel;

--
-- Name: Tournament; Type: TABLE; Schema: public; Owner: padel
--

CREATE TABLE public."Tournament" (
    id text NOT NULL,
    "clubId" text NOT NULL,
    name text NOT NULL,
    description text,
    "startDate" date NOT NULL,
    "endDate" date NOT NULL,
    price integer NOT NULL,
    "maxPlayers" integer NOT NULL,
    status public."TournamentStatus" DEFAULT 'upcoming'::public."TournamentStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Tournament" OWNER TO padel;

--
-- Name: TournamentMatch; Type: TABLE; Schema: public; Owner: padel
--

CREATE TABLE public."TournamentMatch" (
    id text NOT NULL,
    "tournamentId" text NOT NULL,
    "roundName" text NOT NULL,
    "pair1Id" text,
    "pair2Id" text,
    "winnerId" text,
    score text,
    status text DEFAULT 'pending'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TournamentMatch" OWNER TO padel;

--
-- Name: TournamentPair; Type: TABLE; Schema: public; Owner: padel
--

CREATE TABLE public."TournamentPair" (
    id text NOT NULL,
    "tournamentId" text NOT NULL,
    "player1Id" text NOT NULL,
    "player2Id" text NOT NULL,
    name text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TournamentPair" OWNER TO padel;

--
-- Name: TournamentParticipant; Type: TABLE; Schema: public; Owner: padel
--

CREATE TABLE public."TournamentParticipant" (
    id text NOT NULL,
    "tournamentId" text NOT NULL,
    "userId" text NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TournamentParticipant" OWNER TO padel;

--
-- Name: User; Type: TABLE; Schema: public; Owner: padel
--

CREATE TABLE public."User" (
    id text NOT NULL,
    email text NOT NULL,
    name text NOT NULL,
    handle text NOT NULL,
    "avatarUrl" text,
    phone text,
    "googleId" text,
    "isAdmin" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO padel;

--
-- Data for Name: Booking; Type: TABLE DATA; Schema: public; Owner: padel
--

COPY public."Booking" (id, "userId", "courtId", date, "startTime", "endTime", price, status, "createdAt") FROM stdin;
seed-booking-demo	cmq0uwyf8000d12p0n5uze7ad	cmq0uwyf0000412p0nc8o7mfm	2026-06-06	18:30	20:00	32	confirmed	2026-06-05 11:44:36.938
\.


--
-- Data for Name: Club; Type: TABLE DATA; Schema: public; Owner: padel
--

COPY public."Club" (id, slug, name, tagline, address, phone, "openFrom", "openTo", rating, "reviewCount", "courtsCount") FROM stdin;
cmq0uwyeb000012p01x2bj7of	punto-verde	Club Punto Verde	Tu pista, a un toque	Av. del Deporte 12, Madrid	+34 910 000 123	08:00	23:00	4.8	214	6
\.


--
-- Data for Name: ClubMessage; Type: TABLE DATA; Schema: public; Owner: padel
--

COPY public."ClubMessage" (id, "userId", sender, text, "readAt", "createdAt") FROM stdin;
cmq0uwyfk000e12p04wvwf54g	cmq0uwyf8000d12p0n5uze7ad	CLUB	¡Hola! Bienvenido al Club Punto Verde. ¿En qué podemos ayudarte?	2026-06-05 11:44:36.944	2026-06-05 11:44:36.944
cmq0uwyfk000f12p0fp87e1kw	cmq0uwyf8000d12p0n5uze7ad	USER	Hola, ¿tenéis pista libre mañana por la tarde?	\N	2026-06-05 11:44:36.944
cmq0uwyfk000g12p050v9qf14	cmq0uwyf8000d12p0n5uze7ad	CLUB	Sí, tenemos huecos a las 18:00 y 19:30. Reserva desde la app en Pistas.	2026-06-05 11:44:36.944	2026-06-05 11:44:36.944
\.


--
-- Data for Name: Court; Type: TABLE DATA; Schema: public; Owner: padel
--

COPY public."Court" (id, "clubId", name, number, surface, "courtType", "pricePer90", "imageUrl", features) FROM stdin;
cmq0uwyew000212p0adb6n48l	cmq0uwyeb000012p01x2bj7of	Pista Central	1	cristal	indoor	36	https://images.unsplash.com/photo-1622163642999-6c8cd14e5e8e?w=600&q=80	{Cristal,"Iluminación LED","Vídeo replay"}
cmq0uwyf0000412p0nc8o7mfm	cmq0uwyeb000012p01x2bj7of	Pista Norte	2	cristal	indoor	32	https://images.unsplash.com/photo-1554068865-7ceebd4ad1b9?w=600&q=80	{Cristal,Climatizada}
cmq0uwyf1000612p0lwpounq8	cmq0uwyeb000012p01x2bj7of	Pista Sur	3	moqueta	indoor	28	https://images.unsplash.com/photo-1595435934249-5df7f02d0a0e?w=600&q=80	{Moqueta,"Ideal principiantes"}
cmq0uwyf3000812p0o37pgyvk	cmq0uwyeb000012p01x2bj7of	Pista Este	4	cristal	outdoor	30	https://images.unsplash.com/photo-1554068865-7ceebd4ad1b9?w=600&q=80	{Exterior,Cristal}
cmq0uwyf5000a12p0f0ncoecw	cmq0uwyeb000012p01x2bj7of	Pista Oeste	5	moqueta	indoor	28	https://images.unsplash.com/photo-1595435934249-5df7f02d0a0e?w=600&q=80	{Moqueta,"Doble puerta"}
cmq0uwyf6000c12p0fs2t693g	cmq0uwyeb000012p01x2bj7of	Pista VIP	6	cristal	indoor	42	https://images.unsplash.com/photo-1622163642999-6c8cd14e5e8e?w=600&q=80	{Cristal,"Toallas incluidas","Bebida bienvenida"}
\.


--
-- Data for Name: Tournament; Type: TABLE DATA; Schema: public; Owner: padel
--

COPY public."Tournament" (id, "clubId", name, description, "startDate", "endDate", price, "maxPlayers", status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TournamentMatch; Type: TABLE DATA; Schema: public; Owner: padel
--

COPY public."TournamentMatch" (id, "tournamentId", "roundName", "pair1Id", "pair2Id", "winnerId", score, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: TournamentPair; Type: TABLE DATA; Schema: public; Owner: padel
--

COPY public."TournamentPair" (id, "tournamentId", "player1Id", "player2Id", name, "createdAt") FROM stdin;
\.


--
-- Data for Name: TournamentParticipant; Type: TABLE DATA; Schema: public; Owner: padel
--

COPY public."TournamentParticipant" (id, "tournamentId", "userId", "joinedAt") FROM stdin;
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: padel
--

COPY public."User" (id, email, name, handle, "avatarUrl", phone, "googleId", "isAdmin", "createdAt", "updatedAt") FROM stdin;
cmq0uwyf8000d12p0n5uze7ad	demo@padelpoint.dev	Jonathan García	jonathan	\N	+34 600 000 000	mock_google_padelpoint	t	2026-06-05 11:44:36.932	2026-06-05 11:44:36.932
\.


--
-- Name: Booking Booking_pkey; Type: CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_pkey" PRIMARY KEY (id);


--
-- Name: ClubMessage ClubMessage_pkey; Type: CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."ClubMessage"
    ADD CONSTRAINT "ClubMessage_pkey" PRIMARY KEY (id);


--
-- Name: Club Club_pkey; Type: CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."Club"
    ADD CONSTRAINT "Club_pkey" PRIMARY KEY (id);


--
-- Name: Court Court_pkey; Type: CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."Court"
    ADD CONSTRAINT "Court_pkey" PRIMARY KEY (id);


--
-- Name: TournamentMatch TournamentMatch_pkey; Type: CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."TournamentMatch"
    ADD CONSTRAINT "TournamentMatch_pkey" PRIMARY KEY (id);


--
-- Name: TournamentPair TournamentPair_pkey; Type: CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."TournamentPair"
    ADD CONSTRAINT "TournamentPair_pkey" PRIMARY KEY (id);


--
-- Name: TournamentParticipant TournamentParticipant_pkey; Type: CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."TournamentParticipant"
    ADD CONSTRAINT "TournamentParticipant_pkey" PRIMARY KEY (id);


--
-- Name: Tournament Tournament_pkey; Type: CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."Tournament"
    ADD CONSTRAINT "Tournament_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Booking_courtId_date_startTime_idx; Type: INDEX; Schema: public; Owner: padel
--

CREATE INDEX "Booking_courtId_date_startTime_idx" ON public."Booking" USING btree ("courtId", date, "startTime");


--
-- Name: Booking_userId_date_idx; Type: INDEX; Schema: public; Owner: padel
--

CREATE INDEX "Booking_userId_date_idx" ON public."Booking" USING btree ("userId", date);


--
-- Name: ClubMessage_userId_createdAt_idx; Type: INDEX; Schema: public; Owner: padel
--

CREATE INDEX "ClubMessage_userId_createdAt_idx" ON public."ClubMessage" USING btree ("userId", "createdAt");


--
-- Name: Club_slug_key; Type: INDEX; Schema: public; Owner: padel
--

CREATE UNIQUE INDEX "Club_slug_key" ON public."Club" USING btree (slug);


--
-- Name: Court_clubId_number_key; Type: INDEX; Schema: public; Owner: padel
--

CREATE UNIQUE INDEX "Court_clubId_number_key" ON public."Court" USING btree ("clubId", number);


--
-- Name: TournamentMatch_tournamentId_roundName_idx; Type: INDEX; Schema: public; Owner: padel
--

CREATE INDEX "TournamentMatch_tournamentId_roundName_idx" ON public."TournamentMatch" USING btree ("tournamentId", "roundName");


--
-- Name: TournamentPair_tournamentId_player1Id_player2Id_key; Type: INDEX; Schema: public; Owner: padel
--

CREATE UNIQUE INDEX "TournamentPair_tournamentId_player1Id_player2Id_key" ON public."TournamentPair" USING btree ("tournamentId", "player1Id", "player2Id");


--
-- Name: TournamentParticipant_tournamentId_userId_key; Type: INDEX; Schema: public; Owner: padel
--

CREATE UNIQUE INDEX "TournamentParticipant_tournamentId_userId_key" ON public."TournamentParticipant" USING btree ("tournamentId", "userId");


--
-- Name: Tournament_clubId_startDate_idx; Type: INDEX; Schema: public; Owner: padel
--

CREATE INDEX "Tournament_clubId_startDate_idx" ON public."Tournament" USING btree ("clubId", "startDate");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: padel
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_googleId_key; Type: INDEX; Schema: public; Owner: padel
--

CREATE UNIQUE INDEX "User_googleId_key" ON public."User" USING btree ("googleId");


--
-- Name: User_handle_key; Type: INDEX; Schema: public; Owner: padel
--

CREATE UNIQUE INDEX "User_handle_key" ON public."User" USING btree (handle);


--
-- Name: Booking Booking_courtId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES public."Court"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Booking Booking_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."Booking"
    ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ClubMessage ClubMessage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."ClubMessage"
    ADD CONSTRAINT "ClubMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Court Court_clubId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."Court"
    ADD CONSTRAINT "Court_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES public."Club"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TournamentMatch TournamentMatch_pair1Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."TournamentMatch"
    ADD CONSTRAINT "TournamentMatch_pair1Id_fkey" FOREIGN KEY ("pair1Id") REFERENCES public."TournamentPair"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TournamentMatch TournamentMatch_pair2Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."TournamentMatch"
    ADD CONSTRAINT "TournamentMatch_pair2Id_fkey" FOREIGN KEY ("pair2Id") REFERENCES public."TournamentPair"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TournamentMatch TournamentMatch_tournamentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."TournamentMatch"
    ADD CONSTRAINT "TournamentMatch_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES public."Tournament"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TournamentMatch TournamentMatch_winnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."TournamentMatch"
    ADD CONSTRAINT "TournamentMatch_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES public."TournamentPair"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TournamentPair TournamentPair_player1Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."TournamentPair"
    ADD CONSTRAINT "TournamentPair_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TournamentPair TournamentPair_player2Id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."TournamentPair"
    ADD CONSTRAINT "TournamentPair_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TournamentPair TournamentPair_tournamentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."TournamentPair"
    ADD CONSTRAINT "TournamentPair_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES public."Tournament"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TournamentParticipant TournamentParticipant_tournamentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."TournamentParticipant"
    ADD CONSTRAINT "TournamentParticipant_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES public."Tournament"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TournamentParticipant TournamentParticipant_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."TournamentParticipant"
    ADD CONSTRAINT "TournamentParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Tournament Tournament_clubId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: padel
--

ALTER TABLE ONLY public."Tournament"
    ADD CONSTRAINT "Tournament_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES public."Club"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict DyZJSeLerl7AMACk9uhVSRYumNPXTw11xQOlGsCmIrg2Vef2kef1h7G7hsw2SxF

