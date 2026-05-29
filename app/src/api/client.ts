import { config } from '@/config';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  handle: string;
  avatarUrl?: string | null;
  phone?: string | null;
  isAdmin: boolean;
}

type SessionMode = 'oauth' | null;

let token: string | null = null;
let currentUser: AuthUser | null = null;
let sessionMode: SessionMode = null;

const TOKEN_KEY = 'padelpoint.auth.token';
const USER_KEY = 'padelpoint.auth.user';

const safeStorage = {
  get(key: string): string | null {
    try {
      if (typeof globalThis !== 'undefined' && (globalThis as { localStorage?: Storage }).localStorage) {
        return globalThis.localStorage.getItem(key);
      }
    } catch {}
    return null;
  },
  set(key: string, value: string | null) {
    try {
      if (typeof globalThis !== 'undefined' && (globalThis as { localStorage?: Storage }).localStorage) {
        if (value == null) globalThis.localStorage.removeItem(key);
        else globalThis.localStorage.setItem(key, value);
      }
    } catch {}
  },
};

(function hydrate() {
  const t = safeStorage.get(TOKEN_KEY);
  const u = safeStorage.get(USER_KEY);
  if (t) token = t;
  if (u) {
    try {
      currentUser = JSON.parse(u);
    } catch {}
  }
  if (t) sessionMode = 'oauth';
})();

export function setAuthToken(t: string | null) {
  token = t;
  safeStorage.set(TOKEN_KEY, t);
}

export function getAuthToken() {
  return token;
}

export function setCurrentUser(u: AuthUser | null) {
  currentUser = u;
  safeStorage.set(USER_KEY, u ? JSON.stringify(u) : null);
}

export function getCurrentUser() {
  return currentUser;
}

export function setSessionMode(mode: SessionMode) {
  sessionMode = mode;
}

export function getSessionMode() {
  return sessionMode;
}

export function clearSession() {
  setAuthToken(null);
  setCurrentUser(null);
  setSessionMode(null);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public payload?: unknown,
  ) {
    super(message);
  }
}

export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  if (!config.apiUrl) throw new ApiError(0, 'EXPO_PUBLIC_API_URL no configurado');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    headers,
    cache: init.cache ?? 'no-store',
  });
  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const errMsg =
      data && typeof data === 'object' && data !== null && 'error' in data
        ? String((data as { error: unknown }).error)
        : res.statusText;
    throw new ApiError(res.status, errMsg, data);
  }
  return data as T;
}

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  userId: string;
  joinedAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
}

export interface TournamentPair {
  id: string;
  tournamentId: string;
  player1Id: string;
  player2Id: string;
  name: string | null;
  player1: { id: string; name: string; avatarUrl: string | null };
  player2: { id: string; name: string; avatarUrl: string | null };
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  roundName: string;
  pair1Id: string | null;
  pair2Id: string | null;
  winnerId: string | null;
  score: string | null;
  status: 'pending' | 'completed';
  pair1: TournamentPair | null;
  pair2: TournamentPair | null;
  winner: TournamentPair | null;
}

export interface Tournament {
  id: string;
  clubId: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  price: number;
  maxPlayers: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  createdAt: string;
  club: { name: string };
  participants: TournamentParticipant[];
  pairs?: TournamentPair[];
  matches?: TournamentMatch[];
}

export interface PlayerStats {
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  winRate: number;
  frequentPartner: { id: string; name: string; avatarUrl: string | null } | null;
  nemesis: { id: string; name: string; avatarUrl: string | null } | null;
  history: {
    id: string;
    tournamentName: string;
    roundName: string;
    date: string;
    score: string | null;
    won: boolean;
    myPairName: string;
    opponentName: string;
  }[];
}

export function getTournaments() {
  return api<Tournament[]>('/tournaments');
}

export function getTournament(id: string) {
  return api<Tournament>(`/tournaments/${id}`);
}

export function createTournament(data: { name: string; description?: string; startDate: string; endDate: string; price: number; maxPlayers: number; clubId: string }) {
  return api<Tournament>('/tournaments', { method: 'POST', body: JSON.stringify(data) });
}

export function joinTournament(id: string) {
  return api<TournamentParticipant>(`/tournaments/${id}/join`, { method: 'POST' });
}

export function createTournamentPair(id: string, data: { player1Id: string; player2Id: string; name?: string }) {
  return api<TournamentPair>(`/tournaments/${id}/pairs`, { method: 'POST', body: JSON.stringify(data) });
}

export function createTournamentMatch(id: string, data: { roundName: string; pair1Id?: string; pair2Id?: string }) {
  return api<TournamentMatch>(`/tournaments/${id}/matches`, { method: 'POST', body: JSON.stringify(data) });
}

export function updateTournamentMatch(id: string, matchId: string, data: { score?: string; winnerId?: string; pair1Id?: string; pair2Id?: string }) {
  return api<TournamentMatch>(`/tournaments/${id}/matches/${matchId}`, { method: 'PUT', body: JSON.stringify(data) });
}

export function getPlayerStats() {
  return api<PlayerStats>('/me/stats');
}
