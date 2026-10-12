"use client";

/**
 * Estado de la demo en el navegador (localStorage), sin backend.
 * Se sincroniza entre pestañas: si abres la vista admin en otra pestaña,
 * verás las reservas del socio en tiempo real.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  DEMO_USER,
  defaultAttendance,
  generateWeek,
  seededSeats,
  startOfDay,
  type ClassSession,
} from "./data";

interface Persisted {
  myBookings: Record<string, number>; // sessionId → nº de puesto/bici
  extraSessions: ClassSession[];
  attendance: Record<string, Record<string, boolean>>; // sessionId → nombre → asistió
}

const KEY = "viva-gym-demo-v1";
const EMPTY: Persisted = { myBookings: {}, extraSessions: [], attendance: {} };

let cache: Persisted | null = null;
const listeners = new Set<() => void>();

function read(): Persisted {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Persisted>) } : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: Persisted) {
  cache = next;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export interface SeatInfo {
  name: string;
  me: boolean;
}

export interface NewSessionInput {
  type: ClassSession["type"];
  name: string;
  instructor: string;
  room: string;
  startsAt: number;
  durationMin: number;
  capacity: number;
}

interface StoreValue {
  baseDay: number;
  sessions: ClassSession[];
  myBookings: Record<string, number>;
  getSession: (id: string) => ClassSession | undefined;
  getSeats: (session: ClassSession) => Record<number, SeatInfo>;
  book: (sessionId: string, seat: number) => void;
  cancel: (sessionId: string) => void;
  addSession: (input: NewSessionInput) => string;
  attended: (session: ClassSession, name: string, now: number) => boolean;
  toggleAttendance: (session: ClassSession, name: string, now: number) => void;
  resetDemo: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const state = useSyncExternalStore(subscribe, read, () => EMPTY);
  return <StoreInner state={state}>{children}</StoreInner>;
}

// Fecha base estática para SSR/prerender inicial (ej. hoy medianoche en tiempo estándar)
const STATIC_BASE_DAY = 1791859200000; // Epoch estable para prerender

function StoreInner({ state, children }: { state: Persisted; children: React.ReactNode }) {
  const [baseDay, setBaseDay] = useState(STATIC_BASE_DAY);

  useEffect(() => {
    setBaseDay(startOfDay(Date.now()));
  }, []);

  const sessions = useMemo(
    () => [...generateWeek(baseDay), ...state.extraSessions].sort((a, b) => a.startsAt - b.startsAt),
    [baseDay, state.extraSessions],
  );

  const getSession = useCallback((id: string) => sessions.find((s) => s.id === id), [sessions]);

  const getSeats = useCallback(
    (session: ClassSession) => {
      const seats: Record<number, SeatInfo> = {};
      for (const [seat, name] of Object.entries(seededSeats(session))) {
        seats[Number(seat)] = { name, me: false };
      }
      const mine = state.myBookings[session.id];
      if (mine) seats[mine] = { name: DEMO_USER.name, me: true };
      return seats;
    },
    [state.myBookings],
  );

  const value = useMemo<StoreValue>(
    () => ({
      baseDay,
      sessions,
      myBookings: state.myBookings,
      getSession,
      getSeats,
      book: (sessionId, seat) =>
        write({ ...read(), myBookings: { ...read().myBookings, [sessionId]: seat } }),
      cancel: (sessionId) => {
        const next = { ...read().myBookings };
        delete next[sessionId];
        write({ ...read(), myBookings: next });
      },
      addSession: (input) => {
        const id = `custom-${Date.now()}`;
        write({ ...read(), extraSessions: [...read().extraSessions, { ...input, id, custom: true }] });
        return id;
      },
      attended: (session, name, now) => {
        const override = state.attendance[session.id]?.[name];
        if (override !== undefined) return override;
        return defaultAttendance(session.id, name, now > session.startsAt + session.durationMin * 60_000);
      },
      toggleAttendance: (session, name, now) => {
        const current = read();
        const ended = now > session.startsAt + session.durationMin * 60_000;
        const prev = current.attendance[session.id]?.[name] ?? defaultAttendance(session.id, name, ended);
        write({
          ...current,
          attendance: {
            ...current.attendance,
            [session.id]: { ...current.attendance[session.id], [name]: !prev },
          },
        });
      },
      resetDemo: () => write(EMPTY),
    }),
    [baseDay, sessions, state.myBookings, state.attendance, getSession, getSeats],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore debe usarse dentro de <StoreProvider>");
  return ctx;
}

/** Reloj que se actualiza cada `intervalMs`. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(STATIC_BASE_DAY + 36_000_000); // 10:00 AM seguro para SSR
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function SplashLoader() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <div className="flex flex-col items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-blanco.svg" alt="VIVA GYM" className="h-14 w-auto animate-pulse" />
        <div className="h-1 w-32 overflow-hidden rounded-full bg-ink-800">
          <div className="h-full w-1/2 animate-[fade-up_1s_ease-in-out_infinite_alternate] rounded-full bg-gradient-to-r from-viva-teal to-viva-orange" />
        </div>
      </div>
    </div>
  );
}
