import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Bike, CalendarCheck, ShieldCheck, User } from "lucide-react";

export default function Home() {
  return (
    <main className="relative mx-auto flex min-h-dvh max-w-6xl flex-col px-5 py-10 sm:px-8">
      <Image src="/logo-blanco.svg" alt="VIVA GYM" width={140} height={70} className="h-12 w-auto self-start" unoptimized priority />

      <section className="mt-16 grid flex-1 items-center gap-12 lg:mt-0 lg:grid-cols-[1.1fr_1fr]">
        <div className="animate-fade-up">
          <p className="eyebrow">Demo · Plataforma de socios</p>
          <h1 className="mt-4 font-display text-5xl leading-[1.02] font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Tu clase. <br />
            Tu bici. <br />
            <span className="text-gradient">Tu progreso.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-ink-300">
            Los socios eligen su bici en el salón de spinning, siguen sus asistencias y entrenamientos y ven cómo evoluciona su peso. La gerencia ve la ocupación en tiempo real.
          </p>
          <ul className="mt-8 flex flex-wrap gap-3 text-sm text-ink-300">
            {[
              { icon: Bike, t: "25 bicis por clase" },
              { icon: CalendarCheck, t: "Reservas con cuenta regresiva" },
              { icon: BarChart3, t: "Métricas y progreso" },
            ].map(({ icon: Icon, t }) => (
              <li key={t} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5">
                <Icon className="size-4 text-viva-cyan" /> {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-5">
          <EntryCard
            href="/socio"
            id="enter-member"
            icon={<User className="size-6" />}
            title="Vista de socio"
            text="Inicio con tu racha y tu peso, el horario de la semana y el salón de spinning para elegir tu bici."
            tone="orange"
            delay={120}
          />
          <EntryCard
            href="/admin"
            id="enter-admin"
            icon={<ShieldCheck className="size-6" />}
            title="Vista de administrador"
            text="Ocupación de las clases, quién está en cada bici, check-in de asistencia, alta de clases y lista de socios."
            tone="cyan"
            delay={220}
          />
          <p className="text-center text-xs text-ink-500">
            Consejo: abre las dos vistas en pestañas distintas; las reservas se reflejan al instante en el panel admin.
          </p>
        </div>
      </section>
    </main>
  );
}

function EntryCard({
  href, id, icon, title, text, tone, delay,
}: {
  href: string;
  id: string;
  icon: React.ReactNode;
  title: string;
  text: string;
  tone: "orange" | "cyan";
  delay: number;
}) {
  const t =
    tone === "orange"
      ? { ring: "hover:border-viva-orange/50", icon: "from-viva-orange to-viva-orange-soft", glow: "bg-viva-orange/20" }
      : { ring: "hover:border-viva-cyan/50", icon: "from-viva-teal to-viva-cyan", glow: "bg-viva-cyan/20" };
  return (
    <Link
      href={href}
      id={id}
      className={`card group relative animate-fade-up overflow-hidden p-7 transition duration-300 hover:-translate-y-1 ${t.ring}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div aria-hidden className={`absolute -top-16 -right-16 size-48 rounded-full ${t.glow} opacity-0 blur-3xl transition duration-500 group-hover:opacity-100`} />
      <div className="relative flex items-start gap-5">
        <span className={`grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${t.icon} text-white shadow-lg`}>{icon}</span>
        <div className="flex-1">
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-400">{text}</p>
        </div>
        <ArrowRight className="mt-1 size-5 text-ink-500 transition group-hover:translate-x-1 group-hover:text-white" />
      </div>
    </Link>
  );
}
