export const SLOT_TIMES = [
  "08:00", "09:30", "11:00", "12:30", "14:00", "15:30",
  "17:00", "18:30", "20:00", "21:30",
];

export function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export function parseDateOnly(iso: string): Date {
  return new Date(`${iso}T12:00:00.000Z`);
}

export function toDateOnlyString(d: Date): string {
  return d.toISOString().slice(0, 10);
}
