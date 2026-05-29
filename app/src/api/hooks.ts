import { useCallback, useEffect, useState } from 'react';
import { api, getAuthToken } from '@/api/client';
import { config } from '@/config';
import type { Booking, ChatMessage, Court } from '@/data/mock';
import { COURTS as MOCK_COURTS, INITIAL_MESSAGES, generateSlotsForDate } from '@/data/mock';

export interface ClubInfo {
  id: string;
  name: string;
  tagline?: string;
  address?: string;
  phone?: string;
  openFrom: string;
  openTo: string;
  rating: number;
  reviews: number;
  courtsCount: number;
  courts: Court[];
}

export interface ProfileData {
  id: string;
  email: string;
  name: string;
  handle: string;
  avatarUrl?: string | null;
  phone?: string | null;
  memberSince: string;
  bookingsCount: number;
}

export function useClub() {
  const [data, setData] = useState<ClubInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!config.useApi) {
      setData({
        id: 'local',
        name: 'Club Punto Verde',
        tagline: 'Tu pista, a un toque',
        address: 'Av. del Deporte 12, Madrid',
        phone: '+34 910 000 123',
        openFrom: '08:00',
        openTo: '23:00',
        rating: 4.8,
        reviews: 214,
        courtsCount: 6,
        courts: MOCK_COURTS,
      });
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const club = await api<ClubInfo>('/club');
      setData(club);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh, courts: data?.courts ?? MOCK_COURTS };
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!config.useApi || !getAuthToken()) {
      setLoading(false);
      return;
    }
    try {
      const list = await api<Booking[]>('/bookings');
      setBookings(list);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { bookings, loading, refresh, setBookings };
}

export function useSlots(courtId: string | null, date: string) {
  const [slots, setSlots] = useState(() =>
    courtId ? generateSlotsForDate(date, courtId) : [],
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!courtId) return;
    if (!config.useApi || !getAuthToken()) {
      setSlots(generateSlotsForDate(date, courtId));
      return;
    }
    let cancelled = false;
    setLoading(true);
    api<{ id: string; start: string; end: string; available: boolean }[]>(
      `/bookings/slots?courtId=${encodeURIComponent(courtId)}&date=${encodeURIComponent(date)}`,
    )
      .then((s) => {
        if (!cancelled) setSlots(s);
      })
      .catch(() => {
        if (!cancelled) setSlots(generateSlotsForDate(date, courtId));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [courtId, date]);

  return { slots, loading };
}

export function useClubMessages() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!config.useApi || !getAuthToken()) {
      setUnreadCount(messages.filter((m) => m.senderId === 'club' && !m.read).length);
      setLoading(false);
      return;
    }
    try {
      const [msgs, unread] = await Promise.all([
        api<ChatMessage[]>('/club-messages'),
        api<{ unreadCount: number }>('/club-messages/unread'),
      ]);
      setMessages(msgs);
      setUnreadCount(unread.unreadCount);
    } catch {
      /* keep local */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [refresh]);

  const markRead = useCallback(async () => {
    if (config.useApi && getAuthToken()) {
      await api('/club-messages/read', { method: 'POST' }).catch(() => {});
    }
    setMessages((prev) => prev.map((m) => (m.senderId === 'club' ? { ...m, read: true } : m)));
    setUnreadCount(0);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!config.useApi || !getAuthToken()) {
      setMessages((prev) => [
        ...prev,
        { id: `local-${Date.now()}`, senderId: 'user', text: trimmed, sentAt: new Date().toISOString(), read: true },
      ]);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `local-club-${Date.now()}`,
            senderId: 'club',
            text: 'Gracias por tu mensaje. Recepción te responderá en breve.',
            sentAt: new Date().toISOString(),
            read: false,
          },
        ]);
        setUnreadCount((n) => n + 1);
      }, 1200);
      return;
    }

    const res = await api<{
      userMessage: ChatMessage;
      clubReply: ChatMessage;
    }>('/club-messages', { method: 'POST', body: JSON.stringify({ text: trimmed }) });
    setMessages((prev) => [...prev, res.userMessage, res.clubReply]);
    setUnreadCount((n) => n + 1);
  }, []);

  return { messages, unreadCount, loading, refresh, markRead, sendMessage, setMessages };
}

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!config.useApi || !getAuthToken()) {
      setLoading(false);
      return;
    }
    try {
      const res = await api<{ user: ProfileData }>('/me');
      setProfile(res.user);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { profile, loading, refresh };
}

export async function createBooking(payload: {
  courtId: string;
  date: string;
  start: string;
}): Promise<Booking> {
  return api<Booking>('/bookings', { method: 'POST', body: JSON.stringify(payload) });
}

export async function cancelBookingApi(id: string): Promise<void> {
  await api(`/bookings/${id}/cancel`, { method: 'POST' });
}

export function useTournaments() {
  const [tournaments, setTournaments] = useState<import('@/api/client').Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!config.useApi || !getAuthToken()) {
      setLoading(false);
      return;
    }
    try {
      const list = await import('@/api/client').then(m => m.getTournaments());
      setTournaments(list);
    } catch {
      setTournaments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tournaments, loading, refresh };
}

export function useTournament(id: string) {
  const [tournament, setTournament] = useState<import('@/api/client').Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!config.useApi || !getAuthToken()) {
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await import('@/api/client').then(m => m.getTournament(id));
      setTournament(data);
    } catch (e: any) {
      setError(e.message || 'Error loading tournament');
      setTournament(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { tournament, loading, error, refresh };
}

export function usePlayerStats() {
  const [stats, setStats] = useState<import('@/api/client').PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!config.useApi || !getAuthToken()) {
      setLoading(false);
      return;
    }
    try {
      const data = await import('@/api/client').then(m => m.getPlayerStats());
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, loading, refresh };
}
