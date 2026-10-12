"use client";

import Image from "next/image";
import Link from "next/link";
import { RotateCcw, ShieldCheck, User } from "lucide-react";
import { DEMO_USER } from "@/lib/data";
import { useStore } from "@/lib/store";

export function AppHeader({ role }: { role: "socio" | "admin" }) {
  const { resetDemo } = useStore();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label="VIVA GYM inicio">
          <Image src="/logo-blanco.svg" alt="VIVA GYM" width={96} height={48} className="h-9 w-auto" unoptimized priority />
        </Link>

        <nav aria-label="Cambiar vista" className="ml-2 flex rounded-2xl border border-white/10 bg-ink-900/80 p-1 text-sm">
          <RoleLink href="/socio" active={role === "socio"} icon={<User className="size-4" />} label="Socio" />
          <RoleLink href="/admin" active={role === "admin"} icon={<ShieldCheck className="size-4" />} label="Admin" />
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button
            id="reset-demo"
            type="button"
            onClick={resetDemo}
            className="hidden cursor-pointer items-center gap-1.5 rounded-xl px-3 py-2 text-xs text-ink-400 transition hover:bg-white/5 hover:text-ink-100 sm:flex"
            title="Borra reservas y cambios de la demo"
          >
            <RotateCcw className="size-3.5" /> Reiniciar demo
          </button>
          {role === "socio" ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-tight">{DEMO_USER.name}</p>
                <p className="text-xs text-ink-400">{DEMO_USER.plan}</p>
              </div>
              <Avatar initials={DEMO_USER.initials} />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold leading-tight">Gerencia VIVA GYM</p>
                <p className="text-xs text-ink-400">Administrador</p>
              </div>
              <Avatar initials="VG" tone="blue" />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function RoleLink({ href, active, icon, label }: { href: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-medium transition ${
        active ? "bg-gradient-to-r from-viva-teal to-viva-cyan text-ink-950 shadow" : "text-ink-300 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

export function Avatar({ initials, tone = "orange", size = "md" }: { initials: string; tone?: "orange" | "blue" | "teal"; size?: "sm" | "md" }) {
  const tones = {
    orange: "from-viva-orange to-viva-orange-soft",
    blue: "from-viva-blue to-viva-cyan",
    teal: "from-viva-teal to-viva-cyan",
  };
  const sizes = { sm: "size-8 text-xs", md: "size-10 text-sm" };
  return (
    <div className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-br ${tones[tone]} ${sizes[size]} font-bold text-white ring-2 ring-white/10`}>
      {initials}
    </div>
  );
}
