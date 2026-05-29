export type CourtSurface = 'cristal' | 'moqueta' | 'hierba';
export type CourtType = 'indoor' | 'outdoor';

export interface Court {
  id: string;
  name: string;
  number: number;
  surface: CourtSurface;
  type: CourtType;
  pricePer90: number;
  imageUrl: string;
  features: string[];
}

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  available: boolean;
}

export interface Booking {
  id: string;
  courtId: string;
  courtName: string;
  date: string;
  start: string;
  end: string;
  price: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: 'user' | 'club';
  text: string;
  sentAt: string;
  read: boolean;
}

export const CLUB_INFO = {
  id: 'club-punto-verde',
  name: 'Club Punto Verde',
  courtsCount: 6,
  openFrom: '08:00',
  openTo: '23:00',
  rating: 4.8,
  reviews: 214,
};

export const COURTS: Court[] = [
  {
    id: 'c1',
    name: 'Pista Central',
    number: 1,
    surface: 'cristal',
    type: 'indoor',
    pricePer90: 36,
    imageUrl: 'https://images.unsplash.com/photo-1622163642999-6c8cd14e5e8e?w=600&q=80',
    features: ['Cristal', 'Iluminación LED', 'Vídeo replay'],
  },
  {
    id: 'c2',
    name: 'Pista Norte',
    number: 2,
    surface: 'cristal',
    type: 'indoor',
    pricePer90: 32,
    imageUrl: 'https://images.unsplash.com/photo-1554068865-7ceebd4ad1b9?w=600&q=80',
    features: ['Cristal', 'Climatizada'],
  },
  {
    id: 'c3',
    name: 'Pista Sur',
    number: 3,
    surface: 'moqueta',
    type: 'indoor',
    pricePer90: 28,
    imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7f02d0a0e?w=600&q=80',
    features: ['Moqueta', 'Ideal principiantes'],
  },
  {
    id: 'c4',
    name: 'Pista Este',
    number: 4,
    surface: 'cristal',
    type: 'outdoor',
    pricePer90: 30,
    imageUrl: 'https://images.unsplash.com/photo-1554068865-7ceebd4ad1b9?w=600&q=80',
    features: ['Exterior', 'Cristal'],
  },
  {
    id: 'c5',
    name: 'Pista Oeste',
    number: 5,
    surface: 'moqueta',
    type: 'indoor',
    pricePer90: 28,
    imageUrl: 'https://images.unsplash.com/photo-1595435934249-5df7f02d0a0e?w=600&q=80',
    features: ['Moqueta', 'Doble puerta'],
  },
  {
    id: 'c6',
    name: 'Pista VIP',
    number: 6,
    surface: 'cristal',
    type: 'indoor',
    pricePer90: 42,
    imageUrl: 'https://images.unsplash.com/photo-1622163642999-6c8cd14e5e8e?w=600&q=80',
    features: ['Cristal', 'Toallas incluidas', 'Bebida bienvenida'],
  },
];

export const DEMO_USER = {
  id: 'user-1',
  name: 'Jonathan García',
  email: 'jonathan@demo.com',
  phone: '+34 600 000 000',
  memberSince: '2024-03',
  bookingsCount: 12,
};

export const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    senderId: 'club',
    text: '¡Hola! Bienvenido al Club Punto Verde. ¿En qué podemos ayudarte?',
    sentAt: new Date(Date.now() - 3600000).toISOString(),
    read: true,
  },
  {
    id: 'm2',
    senderId: 'user',
    text: 'Hola, ¿tenéis pista libre mañana por la tarde?',
    sentAt: new Date(Date.now() - 3500000).toISOString(),
    read: true,
  },
  {
    id: 'm3',
    senderId: 'club',
    text: 'Sí, tenemos huecos a las 18:00 y 19:30 en Pista Norte y Sur. Puedes reservar directamente desde la app en la pestaña Pistas.',
    sentAt: new Date(Date.now() - 3400000).toISOString(),
    read: true,
  },
];

const SLOT_TIMES = [
  '08:00', '09:30', '11:00', '12:30', '14:00', '15:30',
  '17:00', '18:30', '20:00', '21:30',
];

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

export function generateSlotsForDate(date: string, courtId: string): TimeSlot[] {
  const seed = date.split('-').join('') + courtId;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) % 9973;

  return SLOT_TIMES.map((start, i) => {
    hash = (hash * 17 + i) % 9973;
    const available = hash % 5 !== 0 && hash % 7 !== 0;
    return {
      id: `${date}-${courtId}-${start}`,
      start,
      end: addMinutes(start, 90),
      available,
    };
  });
}

export function formatDateLabel(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const target = new Date(d);
  target.setHours(12, 0, 0, 0);
  if (target.getTime() === today.getTime()) return 'Hoy';
  if (target.getTime() === tomorrow.getTime()) return 'Mañana';
  return d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}

export function getUpcomingDates(count = 14): string[] {
  const dates: string[] = [];
  const d = new Date();
  for (let i = 0; i < count; i++) {
    const copy = new Date(d);
    copy.setDate(copy.getDate() + i);
    dates.push(copy.toISOString().slice(0, 10));
  }
  return dates;
}
