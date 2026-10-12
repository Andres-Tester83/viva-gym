const LOCALE = "es";

export const fmtTime = (ms: number) =>
  new Date(ms).toLocaleTimeString(LOCALE, { hour: "2-digit", minute: "2-digit", hour12: false });

export const fmtWeekday = (ms: number) =>
  new Date(ms).toLocaleDateString(LOCALE, { weekday: "short" }).replace(".", "");

export const fmtDayNum = (ms: number) => new Date(ms).getDate();

export const fmtLongDate = (ms: number) =>
  new Date(ms).toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long" });

export function relativeDay(ms: number, baseDay: number): string {
  const diff = Math.round((new Date(ms).setHours(0, 0, 0, 0) - baseDay) / 86_400_000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  return fmtLongDate(ms);
}

export type CountdownStatus = "upcoming" | "live" | "ended";

export function countdown(startsAt: number, durationMin: number, now: number) {
  const end = startsAt + durationMin * 60_000;
  const status: CountdownStatus = now < startsAt ? "upcoming" : now < end ? "live" : "ended";
  const target = status === "upcoming" ? startsAt : end;
  const total = Math.max(0, target - now);
  const s = Math.floor(total / 1000);
  return {
    status,
    days: Math.floor(s / 86_400),
    hours: Math.floor((s % 86_400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    totalMs: total,
  };
}

export function humanCountdown(startsAt: number, durationMin: number, now: number): string {
  const c = countdown(startsAt, durationMin, now);
  if (c.status === "live") return "En curso";
  if (c.status === "ended") return "Finalizada";
  if (c.days > 0) return `en ${c.days} d ${c.hours} h`;
  if (c.hours > 0) return `en ${c.hours} h ${c.minutes} min`;
  return `en ${c.minutes} min`;
}

export function greeting(now: number): string {
  const h = new Date(now).getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}
