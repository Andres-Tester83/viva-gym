"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Dumbbell,
  Flame,
  MapPin,
  TrendingDown,
  Trophy,
  Users,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { BikeMap } from "@/components/BikeMap";
import { ClassIcon, CountdownDisplay, LineChart, ProgressBar, StatCard } from "@/components/ui";
import {
  ATTENDANCE_HEATMAP,
  CLASS_META,
  DEMO_USER,
  RECENT_WORKOUTS,
  WEIGHT_HISTORY,
  type ClassSession,
  type ClassType,
} from "@/lib/data";
import { fmtDayNum, fmtLongDate, fmtTime, fmtWeekday, humanCountdown, relativeDay } from "@/lib/format";
import { useNow, useStore } from "@/lib/store";

export default function MemberView() {
  const { sessions, myBookings, baseDay, getSeats, book, cancel } = useStore();
  const now = useNow(1000);

  // Tab seleccionada en la vista de cliente
  const [activeTab, setActiveTab] = useState<"reservas" | "progreso" | "entrenamientos">("reservas");

  // Filtro de día (0 = hoy, 1 = mañana, etc.) y tipo de clase
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [selectedType, setSelectedType] = useState<ClassType | "todas">("todas");

  // Sesión abierta en el modal/detalle del salón
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);

  // Proxima reserva activa del usuario
  const myUpcomingBookings = useMemo(() => {
    return Object.entries(myBookings)
      .map(([sessionId, seat]) => {
        const session = sessions.find((s) => s.id === sessionId);
        return session ? { session, seat } : null;
      })
      .filter((b): b is { session: ClassSession; seat: number } => b !== null && b.session.startsAt + b.session.durationMin * 60_000 > now)
      .sort((a, b) => a.session.startsAt - b.session.startsAt);
  }, [myBookings, sessions, now]);

  const nextBooking = myUpcomingBookings[0];

  // Días de la semana para los selectores
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const ms = baseDay + i * 86_400_000;
      return {
        offset: i,
        ms,
        label: i === 0 ? "Hoy" : i === 1 ? "Mañana" : fmtWeekday(ms),
        num: fmtDayNum(ms),
      };
    });
  }, [baseDay]);

  // Filtrado de sesiones para el día seleccionado
  const targetDayStart = baseDay + selectedDayOffset * 86_400_000;
  const targetDayEnd = targetDayStart + 86_400_000;

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesDay = s.startsAt >= targetDayStart && s.startsAt < targetDayEnd;
      const matchesType = selectedType === "todas" || s.type === selectedType;
      return matchesDay && matchesType;
    });
  }, [sessions, targetDayStart, targetDayEnd, selectedType]);

  // Identificar la clase que está por comenzar (la próxima más cercana en el futuro que no haya terminado)
  const nextSessionToStart = useMemo(() => {
    return sessions
      .filter((s) => s.startsAt + s.durationMin * 60_000 > now)
      .sort((a, b) => a.startsAt - b.startsAt)[0];
  }, [sessions, now]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const activeSessionSeats = activeSession ? getSeats(activeSession) : {};
  const myCurrentSeatInActive = activeSession ? myBookings[activeSession.id] : undefined;

  const handleOpenSalon = (session: ClassSession) => {
    setActiveSessionId(session.id);
    setSelectedSeat(myBookings[session.id] ?? null);
  };

  const handleConfirmBooking = () => {
    if (!activeSession || !selectedSeat) return;
    book(activeSession.id, selectedSeat);
  };

  const handleCancelBooking = (sessionId: string) => {
    cancel(sessionId);
    if (activeSessionId === sessionId) {
      setSelectedSeat(null);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <AppHeader role="socio" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Banner de Bienvenida y Próxima Reserva */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-ink-900/90 via-ink-850 to-ink-900 p-6 sm:p-8">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-viva-cyan/10 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="eyebrow">Portal de Socios</span>
              <h1 className="mt-1 font-display text-3xl sm:text-4xl font-bold tracking-tight">
                ¡Hola de nuevo, <span className="text-gradient">{DEMO_USER.firstName}</span>!
              </h1>
              <p className="mt-1 text-sm text-ink-300">
                Tu objetivo: <span className="text-ink-100 font-medium">{DEMO_USER.goal}</span>
              </p>
            </div>

            {nextBooking ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-ink-950/70 border border-viva-orange/30 rounded-2xl p-4 shadow-xl shadow-viva-orange/5">
                <div className="grid place-items-center size-12 rounded-xl bg-viva-orange/15 text-viva-orange border border-viva-orange/30">
                  <Flame className="size-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-viva-orange">
                      Próxima Clase · Bici #{nextBooking.seat}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-viva-orange/20 text-viva-orange">
                      Confirmada
                    </span>
                  </div>
                  <p className="font-display font-bold text-lg text-white">
                    {nextBooking.session.name}
                  </p>
                  <p className="text-xs text-ink-400">
                    {relativeDay(nextBooking.session.startsAt, baseDay)} a las {fmtTime(nextBooking.session.startsAt)} hs · {nextBooking.session.instructor}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenSalon(nextBooking.session)}
                  className="btn btn-primary sm:ml-2 text-xs py-2 px-3"
                >
                  Ver Salón
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-ink-950/60 border border-white/5 rounded-2xl p-4">
                <Calendar className="size-5 text-viva-cyan" />
                <div className="text-xs">
                  <p className="font-semibold text-ink-200">Sin reservas activas hoy</p>
                  <p className="text-ink-400">Elige una clase abajo para asegurar tu lugar.</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Quick Stats Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Racha Actual"
            value="12"
            unit="días"
            icon={<Trophy className="size-4" />}
            accent="orange"
            hint="¡Estás en tu mejor récord del mes!"
          />
          <StatCard
            label="Peso Actual"
            value="64.2"
            unit="kg"
            icon={<TrendingDown className="size-4" />}
            accent="cyan"
            hint="-3.2 kg desde el inicio"
          />
          <StatCard
            label="IMC Estimado"
            value="23.0"
            unit="Normal"
            icon={<TrendingDown className="size-4" />}
            accent="teal"
            hint="Estatura: 167 cm"
          />
          <StatCard
            label="Asistencias (Mes)"
            value="14"
            unit="visitas"
            icon={<Users className="size-4" />}
            accent="blue"
            hint="86% de asistencia a reservas"
          />
        </section>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("reservas")}
            className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "reservas"
                ? "bg-viva-cyan/15 text-viva-cyan border border-viva-cyan/30"
                : "text-ink-400 hover:text-white"
            }`}
          >
            Reservar Clases
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("progreso")}
            className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "progreso"
                ? "bg-viva-cyan/15 text-viva-cyan border border-viva-cyan/30"
                : "text-ink-400 hover:text-white"
            }`}
          >
            Mi Progreso y Métricas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("entrenamientos")}
            className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "entrenamientos"
                ? "bg-viva-cyan/15 text-viva-cyan border border-viva-cyan/30"
                : "text-ink-400 hover:text-white"
            }`}
          >
            Historial de Entrenamientos
          </button>
        </div>

        {/* TAB 1: RESERVAS Y SALÓN */}
        {activeTab === "reservas" && (
          <div className="space-y-6">
            {/* Filtros de Día */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {weekDays.map((d) => (
                <button
                  key={d.offset}
                  type="button"
                  onClick={() => setSelectedDayOffset(d.offset)}
                  className={`flex flex-col items-center justify-center min-w-18 py-3 px-4 rounded-2xl border cursor-pointer transition ${
                    selectedDayOffset === d.offset
                      ? "bg-gradient-to-b from-viva-cyan/20 to-viva-teal/10 border-viva-cyan text-white shadow-lg shadow-viva-cyan/10"
                      : "bg-ink-900/60 border-white/5 text-ink-400 hover:border-white/20 hover:text-ink-200"
                  }`}
                >
                  <span className="text-xs uppercase font-medium">{d.label}</span>
                  <span className="text-xl font-display font-bold mt-0.5 text-white">{d.num}</span>
                </button>
              ))}
            </div>

            {/* Filtros por Categoría */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {(["todas", "spinning", "funcional", "yoga", "boxeo", "hiit"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSelectedType(t)}
                  className={`cursor-pointer px-3.5 py-1.5 rounded-full capitalize font-medium transition ${
                    selectedType === t
                      ? "bg-white text-ink-950 font-semibold"
                      : "bg-ink-850/80 text-ink-300 hover:bg-ink-800"
                  }`}
                >
                  {t === "todas" ? "Todas las clases" : CLASS_META[t].label}
                </button>
              ))}
            </div>

            {/* Listado de Clases */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSessions.map((session) => {
                const seats = getSeats(session);
                const bookedCount = Object.keys(seats).length;
                const availableCount = session.capacity - bookedCount;
                const mySeat = myBookings[session.id];
                const isSpinning = session.type === "spinning";
                const isNextToStart = session.id === nextSessionToStart?.id;

                return (
                  <div
                    key={session.id}
                    className={`card p-5 flex flex-col justify-between transition border relative overflow-hidden ${
                      isNextToStart
                        ? "animate-pulse-card bg-ink-900/95"
                        : mySeat
                        ? "border-viva-orange/40 bg-ink-900/90 shadow-lg shadow-viva-orange/5"
                        : "border-white/5 hover:border-white/15"
                    }`}
                  >
                    {isNextToStart && (
                      <div className="absolute top-0 right-0">
                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-bl-xl bg-viva-cyan text-ink-950 font-extrabold text-[10px] tracking-wider uppercase shadow-md">
                          <span className="size-1.5 rounded-full bg-ink-950 animate-ping" />
                          Próxima a iniciar
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <ClassIcon type={session.type} />
                          <div>
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-viva-cyan">
                              {session.room}
                            </span>
                            <h2 className="font-display font-bold text-lg text-white">
                              {session.name}
                            </h2>
                          </div>
                        </div>

                        {mySeat && !isNextToStart && (
                          <span className="px-2.5 py-1 rounded-full bg-viva-orange/20 border border-viva-orange/40 text-viva-orange text-xs font-bold shrink-0">
                            Bici #{mySeat}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-ink-300">
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3.5 text-ink-400" />
                          <span>{fmtTime(session.startsAt)} ({session.durationMin} min)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="size-3.5 text-ink-400" />
                          <span>{session.instructor}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-ink-400">Cupo: {bookedCount}/{session.capacity}</span>
                          <span className={availableCount <= 5 ? "text-viva-orange font-semibold" : "text-viva-cyan"}>
                            {availableCount > 0 ? `${availableCount} lugares disponibles` : "Completo"}
                          </span>
                        </div>
                        <ProgressBar value={bookedCount / session.capacity} tone={availableCount <= 5 ? "orange" : "cyan"} />
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                      <span className="text-xs text-ink-400">
                        {humanCountdown(session.startsAt, session.durationMin, now)}
                      </span>

                      {mySeat ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(session.id)}
                            className="text-xs text-red-400 hover:text-red-300 cursor-pointer px-2 py-1"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenSalon(session)}
                            className="btn btn-primary text-xs py-2 px-3"
                          >
                            Cambiar Bici
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenSalon(session)}
                          disabled={availableCount === 0}
                          className="btn btn-accent text-xs py-2 px-4"
                        >
                          {isSpinning ? "Elegir mi Bici" : "Reservar Lugar"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PROGRESO Y MÉTRICAS */}
        {activeTab === "progreso" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gráfico de Evolución de Peso */}
              <div className="card p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="eyebrow">Evolución Corporal</span>
                    <h2 className="text-xl font-display font-bold text-white mt-1">Historial de Peso (Últimas 12 Semanas)</h2>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-display text-viva-cyan">64.2 kg</span>
                    <p className="text-xs text-ink-400">-3.2 kg objetivo cumplido</p>
                  </div>
                </div>
                <div className="mt-6">
                  <LineChart
                    data={WEIGHT_HISTORY.map((w) => ({ label: w.label, value: w.kg }))}
                    height={220}
                  />
                </div>
              </div>

              {/* Métricas y Objetivos */}
              <div className="card p-6 flex flex-col justify-between">
                <div>
                  <span className="eyebrow">Ficha del Socio</span>
                  <h2 className="text-xl font-display font-bold text-white mt-1">Objetivos & IMC</h2>

                  <div className="mt-5 space-y-4">
                    <div className="p-3.5 rounded-xl bg-ink-850/80 border border-white/5">
                      <div className="flex justify-between text-xs text-ink-400 mb-1">
                        <span>Meta de Peso</span>
                        <span className="font-semibold text-white">62.0 kg</span>
                      </div>
                      <ProgressBar value={(67.4 - 64.2) / (67.4 - 62.0)} tone="cyan" />
                      <p className="text-[11px] text-ink-400 mt-1.5 text-right">Progreso al 59%</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-xl bg-ink-850/60 border border-white/5">
                        <span className="text-xs text-ink-400">Estatura</span>
                        <p className="text-lg font-bold text-white">{DEMO_USER.heightCm} cm</p>
                      </div>
                      <div className="p-3 rounded-xl bg-ink-850/60 border border-white/5">
                        <span className="text-xs text-ink-400">Edad</span>
                        <p className="text-lg font-bold text-white">32 años</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-viva-blue/15 border border-viva-blue/30 text-xs text-ink-200">
                  <p className="font-semibold text-white mb-1">Nota del Instructor</p>
                  <p>Excelente constancia en clases matutinas de Spinning. Mantener cadencia de 85-90 RPM en los tramos planos.</p>
                </div>
              </div>
            </div>

            {/* Asistencias / Heatmap */}
            <div className="card p-6">
              <span className="eyebrow">Constancia</span>
              <h2 className="text-xl font-display font-bold text-white mt-1">Asistencia en los últimos 35 días</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {ATTENDANCE_HEATMAP.map((attended, i) => (
                  <div
                    key={i}
                    title={attended ? `Día ${i + 1}: Asistió` : `Día ${i + 1}: Sin registro`}
                    className={`size-6 rounded-lg border transition ${
                      attended
                        ? "bg-viva-teal border-viva-cyan/60 shadow-[0_0_10px_rgb(12_162_177/0.3)]"
                        : "bg-ink-850 border-white/5"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-ink-400 mt-3 flex items-center gap-2">
                <span className="size-3 rounded bg-viva-teal inline-block" /> Asistió al gimnasio o clase
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: ENTRENAMIENTOS */}
        {activeTab === "entrenamientos" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="eyebrow">Registro Personal</span>
                <h2 className="text-xl font-display font-bold text-white mt-1">Sesiones de Entrenamiento</h2>
              </div>
              <button type="button" className="btn btn-primary text-xs py-2 px-4">
                + Registrar Sesión
              </button>
            </div>

            <div className="grid gap-3">
              {RECENT_WORKOUTS.map((w, idx) => (
                <div key={idx} className="card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="size-11 rounded-2xl bg-viva-orange/15 text-viva-orange grid place-items-center border border-viva-orange/20">
                      <Dumbbell className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base text-white">{w.title}</h3>
                      <p className="text-xs text-ink-400">
                        Hace {w.daysAgo} {w.daysAgo === 1 ? "día" : "días"} · {w.durationMin} minutos de sesión
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-ink-300">
                    <div>
                      <span className="text-ink-400 block text-[11px]">Ejercicios</span>
                      <span className="font-bold text-white text-sm">{w.exercises}</span>
                    </div>
                    {w.volumeKg > 0 && (
                      <div>
                        <span className="text-ink-400 block text-[11px]">Volumen</span>
                        <span className="font-bold text-viva-cyan text-sm">{w.volumeKg} kg</span>
                      </div>
                    )}
                    {w.kcal && (
                      <div>
                        <span className="text-ink-400 block text-[11px]">Calorías</span>
                        <span className="font-bold text-viva-orange text-sm">{w.kcal} kcal</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL / SALÓN DE SPINNING (25 BICIS) */}
        {activeSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink-950/80 backdrop-blur-md overflow-y-auto">
            <div className="card relative w-full max-w-4xl border border-white/15 bg-ink-900/95 shadow-2xl p-6 sm:p-8 animate-fade-up max-h-[90vh] overflow-y-auto">
              {/* Encabezado del Salón */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="eyebrow">{activeSession.room}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-viva-orange/15 text-viva-orange border border-viva-orange/30 font-semibold">
                      25 Bicicletas
                    </span>
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white mt-1">
                    {activeSession.name}
                  </h2>
                  <p className="text-xs text-ink-400 mt-1">
                    Instructor: <span className="text-ink-200">{activeSession.instructor}</span> · {fmtLongDate(activeSession.startsAt)} a las {fmtTime(activeSession.startsAt)}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end">
                  <span className="text-xs text-ink-400 mb-1">Tiempo restante para iniciar:</span>
                  <CountdownDisplay
                    startsAt={activeSession.startsAt}
                    durationMin={activeSession.durationMin}
                    now={now}
                    size="md"
                  />
                </div>
              </div>

              {/* El Plano del Salón con 25 Bicis */}
              <div className="py-6">
                <p className="text-center text-xs text-ink-400 mb-4">
                  Haz clic en cualquier bicicleta disponible para seleccionarla. Tu nombre aparecerá en ella al confirmar.
                </p>

                <BikeMap
                  seats={activeSessionSeats}
                  selected={selectedSeat}
                  onSelect={(seat) => setSelectedSeat(seat)}
                  instructor={activeSession.instructor}
                />
              </div>

              {/* Barra de Confirmación Inferior */}
              <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-ink-300">
                  {selectedSeat ? (
                    <p>
                      Has seleccionado la <strong className="text-viva-cyan font-bold">Bicicleta #{selectedSeat}</strong>. Aparecerá a nombre de <strong>{DEMO_USER.name}</strong>.
                    </p>
                  ) : (
                    <p className="text-ink-400">Por favor, selecciona una bicicleta en el plano superior.</p>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setActiveSessionId(null)}
                    className="btn btn-ghost text-xs py-2 px-4 w-full sm:w-auto"
                  >
                    Cerrar
                  </button>

                  {myCurrentSeatInActive ? (
                    <button
                      type="button"
                      onClick={() => handleCancelBooking(activeSession.id)}
                      className="btn text-xs py-2 px-4 bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                    >
                      Liberar mi Bici
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleConfirmBooking}
                    disabled={!selectedSeat || selectedSeat === myCurrentSeatInActive}
                    className="btn btn-primary text-xs py-2.5 px-6 w-full sm:w-auto"
                  >
                    Confirmar mi Bici #{selectedSeat ?? ""}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
