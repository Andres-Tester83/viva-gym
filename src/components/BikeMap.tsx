"use client";

import { Check } from "lucide-react";
import { shortName } from "@/lib/data";
import type { SeatInfo } from "@/lib/store";

/** Distribución del salón: 25 bicis en 5 filas escalonadas (fila 1 = frente al instructor). */
const ROWS: number[][] = [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
  [11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20],
  [21, 22, 23, 24, 25],
];

interface BikeMapProps {
  seats: Record<number, SeatInfo>;
  selected?: number | null;
  onSelect?: (seat: number) => void;
  readOnly?: boolean;
  disabled?: boolean;
  /** Admin: indica qué socios ya hicieron check-in. */
  checkedIn?: (name: string) => boolean;
  instructor: string;
}

export function BikeMap({ seats, selected, onSelect, readOnly, disabled, checkedIn, instructor }: BikeMapProps) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.07] bg-gradient-to-b from-ink-850 to-ink-950 p-4 sm:p-8">
      {/* Luces del salón */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgb(75_190_205/0.25),transparent_70%)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 left-1/2 h-40 w-3/4 -translate-x-1/2 rounded-full bg-viva-orange/10 blur-3xl" />

      {/* Tarima del instructor */}
      <div className="relative mx-auto mb-8 flex max-w-sm flex-col items-center sm:mb-10">
        <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-transparent via-viva-cyan to-transparent shadow-[0_0_24px_rgb(75_190_205/0.8)]" />
        <div className="mt-3 flex items-center gap-2 rounded-full border border-viva-cyan/30 bg-viva-cyan/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-viva-cyan">
          <span className="size-2 animate-pulse-dot rounded-full bg-viva-cyan" />
          INSTRUCTOR · {instructor.toUpperCase()}
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-3 sm:gap-4" role="group" aria-label="Mapa de bicicletas">
        {ROWS.map((row, r) => (
          <div key={r} className={`flex gap-2 sm:gap-4 ${r % 2 === 1 ? "translate-x-[calc(var(--bike-w)/2)]" : ""}`} style={{ ["--bike-w" as string]: "clamp(52px, 15vw, 84px)" }}>
            {row.map((n) => (
              <Bike
                key={n}
                n={n}
                info={seats[n]}
                selected={selected === n}
                onSelect={onSelect}
                readOnly={readOnly}
                disabled={disabled}
                checkedIn={checkedIn}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-ink-400">
        <Legend className="border-ink-600 bg-ink-800" label="Disponible" />
        <Legend className="border-viva-cyan bg-viva-cyan/20" label="Seleccionada" />
        <Legend className="border-red-500/70 bg-red-950/40" label="Ocupada" />
        <Legend className="border-viva-orange bg-viva-orange/25" label={readOnly ? "Socia demo" : "Tu bici"} />
      </div>
    </div>
  );
}

function Bike({
  n, info, selected, onSelect, readOnly, disabled, checkedIn,
}: {
  n: number;
  info?: SeatInfo;
  selected: boolean;
  onSelect?: (seat: number) => void;
  readOnly?: boolean;
  disabled?: boolean;
  checkedIn?: (name: string) => boolean;
}) {
  const taken = Boolean(info) && !info?.me;
  const mine = Boolean(info?.me);
  const interactive = !readOnly && !disabled && !taken;
  const present = info && checkedIn?.(info.name);

  let tile = "border-ink-600/80 bg-ink-800/70 text-ink-400";
  if (interactive) tile += " hover:-translate-y-1 hover:border-viva-cyan/70 hover:text-viva-cyan hover:shadow-[0_10px_30px_-10px_rgb(75_190_205/0.6)]";
  if (taken) tile = "border-red-500/60 bg-red-950/40 text-red-400 shadow-[inset_0_0_12px_rgb(239_68_68/0.15)]";
  if (mine) tile = "border-viva-orange bg-viva-orange/15 text-viva-orange animate-glow";
  if (selected && !mine) tile = "border-viva-cyan bg-viva-cyan/15 text-viva-cyan ring-4 ring-viva-cyan/20 animate-pop";

  const label = info ? (info.me ? `${info.name.split(" ")[0]} (Tú)` : shortName(info.name)) : selected ? "¡Aquí!" : "";

  return (
    <div className="flex w-[var(--bike-w)] flex-col items-center gap-1">
      {/* Nombre encima de la bici */}
      <span
        className={`h-5 max-w-full truncate rounded-full px-1.5 text-[10px] leading-5 font-semibold sm:px-2 sm:text-[11px] ${
          mine
            ? "bg-viva-orange text-white shadow-lg shadow-viva-orange/30"
            : selected
              ? "bg-viva-cyan text-ink-950"
              : info
                ? "bg-red-500/20 text-red-200 border border-red-500/30"
                : ""
        }`}
        title={info?.name}
      >
        {label}
      </span>
      <button
        id={`bike-${n}`}
        type="button"
        disabled={!interactive && !mine}
        onClick={() => interactive && onSelect?.(n)}
        aria-pressed={selected}
        aria-label={info ? `Bici ${n}, ocupada por ${info.me ? "ti" : info.name}` : `Bici ${n}, disponible`}
        className={`relative grid aspect-square w-full cursor-pointer place-items-center rounded-2xl border-2 transition duration-200 disabled:cursor-default ${tile} ${readOnly || disabled ? "cursor-default" : ""}`}
      >
        <BikeGlyph className="w-[62%]" />
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold tabular-nums opacity-80">{n}</span>
        {present && (
          <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-viva-teal text-ink-950 ring-2 ring-ink-900">
            <Check className="size-3" strokeWidth={3} />
          </span>
        )}
      </button>
    </div>
  );
}

function BikeGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 40" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="35" cy="25" r="8" />
      <circle cx="35" cy="25" r="1.6" fill="currentColor" />
      <path d="M8 37h32" />
      <path d="M13 37 19 14l16 11" />
      <path d="M22 26 15 37" />
      <path d="M13 11h10" strokeWidth={4} />
      <path d="M31 5l4 20" />
      <path d="M28 5h8" />
    </svg>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`size-3.5 rounded-md border-2 ${className}`} />
      {label}
    </span>
  );
}
