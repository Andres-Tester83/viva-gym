"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
  Eye,
  Filter,
} from "lucide-react";
import { AppHeader } from "@/components/AppHeader";
import { BikeMap } from "@/components/BikeMap";
import { ClassIcon, CountdownDisplay, ProgressBar, StatCard } from "@/components/ui";
import {
  CLASS_META,
  INSTRUCTORS,
  MEMBERS,
  ROOMS,
  type ClassSession,
  type ClassType,
} from "@/lib/data";
import { fmtDayNum, fmtLongDate, fmtTime, fmtWeekday, relativeDay } from "@/lib/format";
import { useNow, useStore } from "@/lib/store";

export default function AdminView() {
  const { sessions, getSeats, attended, toggleAttendance, addSession, baseDay } = useStore();
  const now = useNow(1000);

  // Tab del administrador
  const [activeTab, setActiveTab] = useState<"clases" | "socios">("clases");

  // Filtro de día (0 = hoy, etc.)
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);

  // Sesión seleccionada para auditoría de salón o check-in
  const [inspectedSessionId, setInspectedSessionId] = useState<string | null>(null);

  // Modal para agregar una nueva clase
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClassType, setNewClassType] = useState<ClassType>("spinning");
  const [newClassName, setNewClassName] = useState("");
  const [newClassInstructor, setNewClassInstructor] = useState(INSTRUCTORS[0] ?? "");
  const [newClassTime, setNewClassTime] = useState("17:00");
  const [newClassDuration, setNewClassDuration] = useState(45);

  // Generador de días para selector
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

  const targetDayStart = baseDay + selectedDayOffset * 86_400_000;
  const targetDayEnd = targetDayStart + 86_400_000;

  const currentDaySessions = useMemo(() => {
    return sessions.filter((s) => s.startsAt >= targetDayStart && s.startsAt < targetDayEnd);
  }, [sessions, targetDayStart, targetDayEnd]);

  const inspectedSession = sessions.find((s) => s.id === inspectedSessionId);
  const inspectedSeats = inspectedSession ? getSeats(inspectedSession) : {};

  // Lista de inscriptos en la clase auditada
  const enrolledMembers = useMemo(() => {
    if (!inspectedSession) return [];
    return Object.entries(inspectedSeats).map(([seatNum, seatInfo]) => ({
      seatNumber: Number(seatNum),
      name: seatInfo.name,
      isMe: seatInfo.me,
      hasAttended: attended(inspectedSession, seatInfo.name, now),
    })).sort((a, b) => a.seatNumber - b.seatNumber);
  }, [inspectedSession, inspectedSeats, attended, now]);

  // Identificar la clase que está por comenzar más cercana en el futuro que no haya finalizado
  const nextSessionToStart = useMemo(() => {
    return sessions
      .filter((s) => s.startsAt + s.durationMin * 60_000 > now)
      .sort((a, b) => a.startsAt - b.startsAt)[0];
  }, [sessions, now]);

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    const [h, m] = newClassTime.split(":").map(Number);
    const targetDate = new Date(baseDay + selectedDayOffset * 86_400_000);
    targetDate.setHours(h ?? 17, m ?? 0, 0, 0);

    const name = newClassName.trim() || `${CLASS_META[newClassType].label} Especial`;
    const capacity = newClassType === "spinning" ? 25 : 20;

    addSession({
      type: newClassType,
      name,
      instructor: newClassInstructor,
      room: ROOMS[newClassType],
      startsAt: targetDate.getTime(),
      durationMin: newClassDuration,
      capacity,
    });

    setIsCreateModalOpen(false);
    setNewClassName("");
  };

  return (
    <div className="min-h-dvh flex flex-col">
      <AppHeader role="admin" />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Banner Admin */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-ink-900 via-ink-850 to-ink-900 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="eyebrow">Panel de Control General</span>
              <h1 className="mt-1 font-display text-3xl sm:text-4xl font-bold tracking-tight">
                Gestión y <span className="text-gradient">Ocupación del Salón</span>
              </h1>
              <p className="mt-1 text-sm text-ink-300">
                Monitoreo en tiempo real de reservas, disponibilidad de bicicletas e ingresos.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-primary text-xs py-2.5 px-4"
              >
                <Plus className="size-4" /> Nueva Clase en Horario
              </button>
            </div>
          </div>
        </section>

        {/* Métricas Globales */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Ocupación Spinning Hoy"
            value="84"
            unit="%"
            icon={<TrendingUp className="size-4" />}
            accent="orange"
            hint="21 de 25 bicis ocupadas en promedio"
          />
          <StatCard
            label="Socios Activos"
            value="142"
            unit="totales"
            icon={<Users className="size-4" />}
            accent="cyan"
            hint="8 nuevos ingresos esta semana"
          />
          <StatCard
            label="Check-ins Realizados"
            value="56"
            unit="hoy"
            icon={<UserCheck className="size-4" />}
            accent="teal"
            hint="Asistencia fluida"
          />
          <StatCard
            label="Clases Programadas"
            value={String(currentDaySessions.length)}
            unit="sesiones"
            icon={<Calendar className="size-4" />}
            accent="blue"
            hint="En todas las salas"
          />
        </section>

        {/* Tabs de Selección */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab("clases")}
            className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "clases"
                ? "bg-viva-cyan/15 text-viva-cyan border border-viva-cyan/30"
                : "text-ink-400 hover:text-white"
            }`}
          >
            Clases & Ocupación en Vivo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("socios")}
            className={`cursor-pointer px-4 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === "socios"
                ? "bg-viva-cyan/15 text-viva-cyan border border-viva-cyan/30"
                : "text-ink-400 hover:text-white"
            }`}
          >
            Directorio de Socios
          </button>
        </div>

        {/* TAB 1: CLASES Y OCUPACIÓN EN VIVO */}
        {activeTab === "clases" && (
          <div className="space-y-6">
            {/* Selector de Fecha */}
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

            {/* Lista de Clases del Día */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentDaySessions.map((session) => {
                const seats = getSeats(session);
                const bookedCount = Object.keys(seats).length;
                const availableCount = session.capacity - bookedCount;
                const isSpinning = session.type === "spinning";
                const isNextToStart = session.id === nextSessionToStart?.id;

                return (
                  <div
                    key={session.id}
                    className={`card p-5 flex flex-col justify-between border relative overflow-hidden transition ${
                      isNextToStart
                        ? "animate-pulse-card bg-ink-900/95"
                        : "border-white/5 hover:border-white/20"
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

                        {!isNextToStart && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-ink-800 text-ink-300 font-medium">
                            {fmtTime(session.startsAt)}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-ink-300">
                        <div>
                          <span className="text-ink-400 block text-[11px]">Instructor</span>
                          <span className="font-semibold text-white">{session.instructor}</span>
                        </div>
                        <div>
                          <span className="text-ink-400 block text-[11px]">Duración</span>
                          <span className="font-semibold text-white">{session.durationMin} min</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-ink-300 font-medium">
                            {bookedCount} / {session.capacity} {isSpinning ? "bicis ocupadas" : "plazas"}
                          </span>
                          <span className={availableCount <= 3 ? "text-viva-orange font-bold" : "text-viva-cyan font-semibold"}>
                            {availableCount === 0 ? "Sala Llena" : `${availableCount} libres`}
                          </span>
                        </div>
                        <ProgressBar value={bookedCount / session.capacity} tone={availableCount <= 3 ? "orange" : "cyan"} />
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                      <span className="text-xs text-ink-400">
                        {fmtLongDate(session.startsAt)}
                      </span>

                      <button
                        type="button"
                        onClick={() => setInspectedSessionId(session.id)}
                        className="btn btn-accent text-xs py-2 px-3.5"
                      >
                        <Eye className="size-3.5" /> Administrar Salón
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: DIRECTORIO DE SOCIOS */}
        {activeTab === "socios" && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="eyebrow">Socios Registrados</span>
                <h2 className="text-xl font-display font-bold text-white mt-1">Directorio y Estado de Membresías</h2>
              </div>
              <span className="text-xs text-ink-400">{MEMBERS.length} socios mostrados</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-ink-400 uppercase">
                    <th className="py-3 px-4">Socio</th>
                    <th className="py-3 px-4">Plan Actual</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4">Última Visita</th>
                    <th className="py-3 px-4">Racha Activa</th>
                    <th className="py-3 px-4 text-right">Asistencias</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {MEMBERS.map((m, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition">
                      <td className="py-3 px-4 font-semibold text-white">{m.name}</td>
                      <td className="py-3 px-4 text-ink-300">{m.plan}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            m.status === "Activo"
                              ? "bg-viva-teal/20 text-viva-teal border border-viva-teal/30"
                              : m.status === "Por vencer"
                              ? "bg-viva-orange/20 text-viva-orange border border-viva-orange/30"
                              : "bg-red-500/20 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-ink-300">{m.lastVisit}</td>
                      <td className="py-3 px-4">
                        <span className="text-viva-orange font-bold">{m.streak > 0 ? `${m.streak} días 🔥` : "—"}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-display font-bold text-viva-cyan">{m.visits}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL DE INSPECCIÓN Y CHECK-IN DEL SALÓN */}
        {inspectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-ink-950/85 backdrop-blur-md overflow-y-auto">
            <div className="card relative w-full max-w-5xl border border-white/15 bg-ink-900/95 shadow-2xl p-6 sm:p-8 animate-fade-up max-h-[92vh] overflow-y-auto">
              {/* Encabezado */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="eyebrow">Auditoría de Salón</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-viva-cyan/15 text-viva-cyan font-bold border border-viva-cyan/30">
                      Modo Admin / Recepción
                    </span>
                  </div>
                  <h2 className="text-2xl font-display font-bold text-white mt-1">
                    {inspectedSession.name}
                  </h2>
                  <p className="text-xs text-ink-400 mt-1">
                    Instructor: <strong>{inspectedSession.instructor}</strong> · {fmtLongDate(inspectedSession.startsAt)} a las {fmtTime(inspectedSession.startsAt)} hs
                  </p>
                </div>

                <div className="flex flex-col sm:items-end">
                  <span className="text-xs text-ink-400 mb-1">Cuenta regresiva de la clase:</span>
                  <CountdownDisplay
                    startsAt={inspectedSession.startsAt}
                    durationMin={inspectedSession.durationMin}
                    now={now}
                    size="md"
                  />
                </div>
              </div>

              {/* Contenido dividido: Mapa de 25 Bicis + Lista de Check-In */}
              <div className="py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between text-xs text-ink-400">
                    <p>Posición física de los socios en el salón:</p>
                    <span className="font-semibold text-viva-cyan">
                      {enrolledMembers.length} de {inspectedSession.capacity} bicis reservadas
                    </span>
                  </div>

                  <BikeMap
                    seats={inspectedSeats}
                    readOnly={true}
                    instructor={inspectedSession.instructor}
                    checkedIn={(name) => attended(inspectedSession, name, now)}
                  />
                </div>

                {/* Panel de Check-In Manual */}
                <div className="card p-5 flex flex-col justify-between border border-white/10 bg-ink-850/60">
                  <div>
                    <h3 className="font-display font-bold text-base text-white">Lista de Inscriptos</h3>
                    <p className="text-xs text-ink-400 mb-4">Haz clic para registrar el ingreso físico.</p>

                    <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                      {enrolledMembers.length === 0 ? (
                        <p className="text-xs text-ink-500 py-6 text-center">No hay reservas para esta clase aún.</p>
                      ) : (
                        enrolledMembers.map((m) => (
                          <div
                            key={m.seatNumber}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-ink-900 border border-white/5 hover:border-white/15 transition text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="size-6 rounded-lg bg-ink-800 text-viva-cyan font-bold grid place-items-center text-[11px] shrink-0">
                                #{m.seatNumber}
                              </span>
                              <div>
                                <p className="font-semibold text-white">
                                  {m.name} {m.isMe && <span className="text-viva-orange text-[10px]">(Socio Demo)</span>}
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => toggleAttendance(inspectedSession, m.name, now)}
                              className={`cursor-pointer px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition ${
                                m.hasAttended
                                  ? "bg-viva-teal/20 text-viva-teal border border-viva-teal/40"
                                  : "bg-ink-800 text-ink-400 hover:text-white"
                              }`}
                            >
                              <CheckCircle2 className="size-3.5" />
                              {m.hasAttended ? "Presente" : "Marcar"}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 text-xs text-ink-400">
                    <p className="flex justify-between">
                      <span>Total Presentes:</span>
                      <strong className="text-white">
                        {enrolledMembers.filter((m) => m.hasAttended).length} / {enrolledMembers.length}
                      </strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Botón Cerrar */}
              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="button"
                  onClick={() => setInspectedSessionId(null)}
                  className="btn btn-ghost text-xs py-2 px-6"
                >
                  Cerrar Inspección
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL PARA CREAR NUEVA CLASE */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/85 backdrop-blur-md">
            <div className="card w-full max-w-md border border-white/15 bg-ink-900 p-6 animate-fade-up">
              <h3 className="text-xl font-display font-bold text-white mb-1">Agregar Clase al Cronograma</h3>
              <p className="text-xs text-ink-400 mb-5">Se publicará de inmediato en el portal de clientes.</p>

              <form onSubmit={handleCreateSession} className="space-y-4 text-xs">
                <div>
                  <label className="block text-ink-300 font-semibold mb-1">Tipo de Disciplina</label>
                  <select
                    value={newClassType}
                    onChange={(e) => setNewClassType(e.target.value as ClassType)}
                    className="input"
                  >
                    <option value="spinning">Spinning (25 Bicicletas)</option>
                    <option value="funcional">Funcional Total (20 Plazas)</option>
                    <option value="yoga">Yoga Flow (18 Plazas)</option>
                    <option value="boxeo">Boxeo Fit (16 Plazas)</option>
                    <option value="hiit">HIIT Express (20 Plazas)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-ink-300 font-semibold mb-1">Título de la Sesión</label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Ej. Spinning Night Beats"
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-ink-300 font-semibold mb-1">Instructor a Cargo</label>
                  <select
                    value={newClassInstructor}
                    onChange={(e) => setNewClassInstructor(e.target.value)}
                    className="input"
                  >
                    {INSTRUCTORS.map((ins) => (
                      <option key={ins} value={ins}>{ins}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-ink-300 font-semibold mb-1">Horario</label>
                    <input
                      type="time"
                      value={newClassTime}
                      onChange={(e) => setNewClassTime(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-ink-300 font-semibold mb-1">Duración (min)</label>
                    <input
                      type="number"
                      value={newClassDuration}
                      onChange={(e) => setNewClassDuration(Number(e.target.value))}
                      className="input"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="btn btn-ghost text-xs py-2 px-4"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary text-xs py-2 px-5">
                    Publicar Clase
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
