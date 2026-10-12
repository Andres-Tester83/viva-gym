"use client";

import { Bike, Dumbbell, Flame, Flower2, Swords } from "lucide-react";
import { CLASS_META, type ClassType } from "@/lib/data";
import { countdown } from "@/lib/format";

const ICONS: Record<ClassType, typeof Bike> = {
  spinning: Bike,
  funcional: Dumbbell,
  yoga: Flower2,
  boxeo: Swords,
  hiit: Flame,
};

export function ClassIcon({ type, className = "size-5" }: { type: ClassType; className?: string }) {
  const Icon = ICONS[type];
  const meta = CLASS_META[type];
  return (
    <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${meta.bg} ${meta.color} ring-1 ${meta.ring}`}>
      <Icon className={className} />
    </span>
  );
}

export function StatCard({
  label, value, unit, hint, icon, accent = "cyan", delay = 0, conicBorder = false,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: React.ReactNode;
  icon: React.ReactNode;
  accent?: "cyan" | "orange" | "teal" | "blue";
  delay?: number;
  conicBorder?: boolean;
}) {
  const accents = {
    cyan: "text-viva-cyan bg-viva-cyan/10",
    orange: "text-viva-orange bg-viva-orange/10",
    teal: "text-viva-teal bg-viva-teal/10",
    blue: "text-[#7ea6ff] bg-viva-blue/20",
  };

  const cardContent = (
    <div className="p-5 flex flex-col justify-between h-full">
      <div className="flex items-start justify-between">
        <p className="text-sm text-ink-400">{label}</p>
        <span className={`grid size-9 place-items-center rounded-xl ${accents[accent]}`}>{icon}</span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight tabular-nums">
        {value}
        {unit && <span className="ml-1 text-base font-medium text-ink-400">{unit}</span>}
      </p>
      {hint && <div className="mt-1 text-xs text-ink-400">{hint}</div>}
    </div>
  );

  if (conicBorder) {
    return (
      <div
        className="card-conic card-hover animate-fade-up shadow-xl shadow-viva-cyan/10"
        style={{ animationDelay: `${delay}ms` }}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <div className="card card-hover animate-fade-up p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start justify-between">
        <p className="text-sm text-ink-400">{label}</p>
        <span className={`grid size-9 place-items-center rounded-xl ${accents[accent]}`}>{icon}</span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight tabular-nums">
        {value}
        {unit && <span className="ml-1 text-base font-medium text-ink-400">{unit}</span>}
      </p>
      {hint && <div className="mt-1 text-xs text-ink-400">{hint}</div>}
    </div>
  );
}

/** Cuenta regresiva grande en segmentos. */
export function CountdownDisplay({
  startsAt, durationMin, now, size = "lg",
}: {
  startsAt: number;
  durationMin: number;
  now: number;
  size?: "lg" | "md";
}) {
  const c = countdown(startsAt, durationMin, now);

  if (c.status === "ended") {
    return <p className="font-display text-2xl font-bold text-ink-400">Clase finalizada</p>;
  }

  const parts =
    c.days > 0
      ? [{ v: c.days, l: "días" }, { v: c.hours, l: "horas" }, { v: c.minutes, l: "min" }, { v: c.seconds, l: "seg" }]
      : [{ v: c.hours, l: "horas" }, { v: c.minutes, l: "min" }, { v: c.seconds, l: "seg" }];

  const box = size === "lg" ? "min-w-[4.25rem] px-3 py-3 text-4xl sm:min-w-20 sm:text-5xl" : "min-w-14 px-2 py-2 text-2xl";

  return (
    <div>
      {c.status === "live" && (
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-viva-orange">
          <span className="size-2 animate-ping rounded-full bg-viva-orange" /> En curso · termina en
        </p>
      )}
      <div className="flex items-start gap-2" role="timer" aria-live="off">
        {parts.map((p, i) => (
          <div key={p.l} className="flex items-start gap-2">
            <div className="flex flex-col items-center">
              <span className={`rounded-2xl border border-white/10 bg-ink-950/60 text-center font-display font-bold tabular-nums ${box}`}>
                {String(p.v).padStart(2, "0")}
              </span>
              <span className="mt-1.5 text-[11px] tracking-wider text-ink-400 uppercase">{p.l}</span>
            </div>
            {i < parts.length - 1 && <span className={`font-display font-bold text-ink-600 ${size === "lg" ? "pt-3 text-4xl" : "pt-2 text-2xl"}`}>:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Gráfica de línea SVG sin dependencias. */
export function LineChart({ data, height = 180 }: { data: { label: string; value: number }[]; height?: number }) {
  const w = 600;
  const h = height;
  const pad = { t: 16, r: 12, b: 26, l: 12 };
  const values = data.map((d) => d.value);
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const x = (i: number) => pad.l + (i * (w - pad.l - pad.r)) / (data.length - 1);
  const y = (v: number) => pad.t + ((max - v) * (h - pad.t - pad.b)) / (max - min);
  const line = data.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(data.length - 1)},${h - pad.b} L${x(0)},${h - pad.b} Z`;
  const last = data[data.length - 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Evolución del peso">
      <defs>
        <linearGradient id="lc-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#4bbecd" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4bbecd" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lc-line" x1="0" x2="1">
          <stop offset="0%" stopColor="#0ca2b1" />
          <stop offset="100%" stopColor="#4bbecd" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={pad.l} x2={w - pad.r} y1={pad.t + f * (h - pad.t - pad.b)} y2={pad.t + f * (h - pad.t - pad.b)} stroke="white" strokeOpacity="0.05" />
      ))}
      <path d={area} fill="url(#lc-area)" />
      <path d={line} fill="none" stroke="url(#lc-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => (
        <text key={d.label} x={x(i)} y={h - 6} textAnchor="middle" className="fill-ink-500 text-[11px]">
          {d.label}
        </text>
      ))}
      {last && (
        <g>
          <circle cx={x(data.length - 1)} cy={y(last.value)} r="9" fill="#fe6e10" fillOpacity="0.25" />
          <circle cx={x(data.length - 1)} cy={y(last.value)} r="5" fill="#fe6e10" stroke="#081227" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}

export function ProgressBar({ value, tone = "cyan" }: { value: number; tone?: "cyan" | "orange" }) {
  const pct = Math.min(100, Math.max(0, value * 100));
  const fill = tone === "orange" ? "from-viva-orange to-viva-orange-soft" : pct >= 90 ? "from-viva-orange to-viva-orange-soft" : "from-viva-teal to-viva-cyan";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
      <div className={`h-full rounded-full bg-gradient-to-r ${fill} transition-[width] duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
}
