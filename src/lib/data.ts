/**
 * Datos de ejemplo para el MVP visual. No hay base de datos:
 * todo se genera de forma determinista a partir de la fecha actual.
 */

export type ClassType = "spinning" | "funcional" | "yoga" | "boxeo" | "hiit";

export interface ClassSession {
  id: string;
  type: ClassType;
  name: string;
  instructor: string;
  room: string;
  startsAt: number; // epoch ms
  durationMin: number;
  capacity: number;
  custom?: boolean; // creada por el admin en la demo
}

export const CLASS_META: Record<ClassType, { label: string; color: string; ring: string; bg: string }> = {
  spinning: { label: "Spinning", color: "text-viva-orange", ring: "ring-viva-orange/40", bg: "bg-viva-orange/15" },
  funcional: { label: "Funcional", color: "text-viva-cyan", ring: "ring-viva-cyan/40", bg: "bg-viva-cyan/15" },
  yoga: { label: "Yoga", color: "text-viva-teal", ring: "ring-viva-teal/40", bg: "bg-viva-teal/15" },
  boxeo: { label: "Boxeo", color: "text-[#7ea6ff]", ring: "ring-viva-blue/50", bg: "bg-viva-blue/25" },
  hiit: { label: "HIIT", color: "text-viva-orange-soft", ring: "ring-viva-orange-soft/40", bg: "bg-viva-orange-soft/15" },
};

export const INSTRUCTORS = ["Andrés Rivas", "Luisa Herrera", "Valeria Soto", "Camila Pérez", "Diego Marín"];

export const ROOMS: Record<ClassType, string> = {
  spinning: "Sala Ride",
  funcional: "Box Funcional",
  yoga: "Sala Zen",
  boxeo: "Ring",
  hiit: "Box Funcional",
};

interface TemplateSlot {
  time: string;
  type: ClassType;
  name: string;
  instructor: string;
  durationMin: number;
  capacity: number;
}

const WEEK_TEMPLATE: TemplateSlot[] = [
  { time: "06:00", type: "spinning", name: "Spinning Sunrise", instructor: "Andrés Rivas", durationMin: 45, capacity: 25 },
  { time: "07:30", type: "funcional", name: "Funcional Total", instructor: "Valeria Soto", durationMin: 50, capacity: 20 },
  { time: "09:00", type: "yoga", name: "Yoga Flow", instructor: "Camila Pérez", durationMin: 60, capacity: 18 },
  { time: "10:30", type: "spinning", name: "Spinning Ride", instructor: "Andrés Rivas", durationMin: 45, capacity: 25 },
  { time: "12:30", type: "hiit", name: "HIIT Express", instructor: "Diego Marín", durationMin: 30, capacity: 20 },
  { time: "16:00", type: "spinning", name: "Spinning Climb", instructor: "Luisa Herrera", durationMin: 45, capacity: 25 },
  { time: "18:00", type: "boxeo", name: "Boxeo Fit", instructor: "Diego Marín", durationMin: 50, capacity: 16 },
  { time: "19:00", type: "spinning", name: "Spinning Power", instructor: "Luisa Herrera", durationMin: 50, capacity: 25 },
  { time: "20:30", type: "spinning", name: "Spinning Night Beats", instructor: "Andrés Rivas", durationMin: 45, capacity: 25 },
];

export const DEMO_USER = {
  id: "u-maria",
  name: "María González",
  firstName: "María",
  initials: "MG",
  plan: "Plan Anual · Full Access",
  heightCm: 167,
  birthDate: "1994-03-18",
  goal: "Bajar a 62 kg y mejorar resistencia",
};

export const MEMBER_NAMES = [
  "Carlos Mendoza", "Ana Rodríguez", "Luis Fernández", "Sofía Ramírez", "Jorge Castillo",
  "Gabriela Torres", "Miguel Herrera", "Daniela Vargas", "Ricardo Morales", "Paola Jiménez",
  "Fernando Rojas", "Isabel Navarro", "Alejandro Silva", "Lucía Ortega", "Andrés Paredes",
  "Mariana Salazar", "Javier Guzmán", "Natalia Cruz", "Sebastián Molina", "Valentina Ríos",
  "Diego Aguilar", "Camila Fuentes", "Pablo Méndez", "Elena Campos", "Tomás Herrera",
  "Renata Vega", "Héctor Lozano", "Adriana Peña", "Mateo Cabrera", "Carolina León",
  "Emilio Sandoval", "Florencia Ibarra", "Raúl Contreras", "Verónica Soto", "Iván Cordero",
];

export function shortName(full: string): string {
  const [first, last] = full.split(" ");
  return last ? `${first} ${last[0]}.` : first;
}

/* ── Utilidades deterministas ──────────────────────────────────────── */

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededRandom(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: readonly T[], rnd: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

export function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

/** Genera 7 días de clases a partir del día indicado. */
export function generateWeek(baseDay: number): ClassSession[] {
  const sessions: ClassSession[] = [];
  for (let offset = 0; offset < 7; offset++) {
    const day = new Date(baseDay);
    day.setDate(day.getDate() + offset);
    for (const slot of WEEK_TEMPLATE) {
      const [h, m] = slot.time.split(":").map(Number);
      const start = new Date(day);
      start.setHours(h ?? 0, m ?? 0, 0, 0);
      sessions.push({
        id: `${dayKey(start.getTime())}-${slot.time.replace(":", "")}`,
        type: slot.type,
        name: slot.name,
        instructor: slot.instructor,
        room: ROOMS[slot.type],
        startsAt: start.getTime(),
        durationMin: slot.durationMin,
        capacity: slot.capacity,
      });
    }
  }
  return sessions;
}

/** Ocupación simulada (puesto → nombre del socio) para una sesión. */
export function seededSeats(session: ClassSession): Record<number, string> {
  if (session.custom) return {};
  const rnd = seededRandom(hash(session.id));
  const ratio = 0.35 + rnd() * 0.5;
  const count = Math.round(session.capacity * ratio);
  const seats = shuffle(
    Array.from({ length: session.capacity }, (_, i) => i + 1),
    rnd,
  ).slice(0, count);
  const names = shuffle(MEMBER_NAMES, rnd);
  const result: Record<number, string> = {};
  seats.forEach((seat, i) => {
    result[seat] = names[i % names.length] as string;
  });
  return result;
}

/** Asistencia simulada por defecto para clases ya finalizadas. */
export function defaultAttendance(sessionId: string, name: string, ended: boolean): boolean {
  if (!ended) return false;
  return hash(`${sessionId}:${name}`) % 100 < 86;
}

/* ── Progreso del socio ─────────────────────────────────────────── */

export const WEIGHT_HISTORY: { label: string; kg: number }[] = [
  { label: "S1", kg: 67.4 }, { label: "S2", kg: 67.1 }, { label: "S3", kg: 66.9 },
  { label: "S4", kg: 66.8 }, { label: "S5", kg: 66.2 }, { label: "S6", kg: 66.0 },
  { label: "S7", kg: 65.7 }, { label: "S8", kg: 65.5 }, { label: "S9", kg: 65.1 },
  { label: "S10", kg: 64.9 }, { label: "S11", kg: 64.5 }, { label: "S12", kg: 64.2 },
];

export const RECENT_WORKOUTS = [
  { title: "Pierna y glúteo", daysAgo: 1, durationMin: 55, exercises: 6, volumeKg: 4820 },
  { title: "Spinning Power", daysAgo: 2, durationMin: 50, exercises: 1, volumeKg: 0, kcal: 520 },
  { title: "Tren superior", daysAgo: 4, durationMin: 48, exercises: 5, volumeKg: 3150 },
];

/** Últimos 35 días: true = asistió. Termina con una racha de 12 días. */
export const ATTENDANCE_HEATMAP: boolean[] = Array.from({ length: 35 }, (_, i) => {
  if (i >= 23) return true;
  return hash(`att-${i}`) % 100 < 58;
});

/* ── Socios (panel admin) ───────────────────────────────────────── */

export type MemberStatus = "Activo" | "Por vencer" | "Vencido";

export const MEMBERS: {
  name: string; plan: string; status: MemberStatus; lastVisit: string; streak: number; visits: number;
}[] = [
  { name: "María González", plan: "Anual", status: "Activo", lastVisit: "Hoy", streak: 12, visits: 14 },
  { name: "Carlos Mendoza", plan: "Mensual", status: "Activo", lastVisit: "Hoy", streak: 5, visits: 11 },
  { name: "Ana Rodríguez", plan: "Trimestral", status: "Por vencer", lastVisit: "Ayer", streak: 3, visits: 9 },
  { name: "Luis Fernández", plan: "Mensual", status: "Activo", lastVisit: "Hoy", streak: 8, visits: 16 },
  { name: "Sofía Ramírez", plan: "Anual", status: "Activo", lastVisit: "Hace 2 días", streak: 0, visits: 7 },
  { name: "Jorge Castillo", plan: "Mensual", status: "Vencido", lastVisit: "Hace 12 días", streak: 0, visits: 2 },
  { name: "Gabriela Torres", plan: "Trimestral", status: "Activo", lastVisit: "Hoy", streak: 21, visits: 19 },
  { name: "Miguel Herrera", plan: "Mensual", status: "Por vencer", lastVisit: "Hace 3 días", streak: 0, visits: 6 },
];
