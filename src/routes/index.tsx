import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Bell,
  Bot,
  CalendarDays,
  CheckCircle2,
  Circle,
  Flame,
  Play,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { ProgressRing } from "@/components/shared/progress-ring";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

/* ---------------------------------- hooks --------------------------------- */

function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setInView(true);
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, inView };
}

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`${className ?? ""} transition-all duration-700 ease-out ${
        inView ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ----------------------------------- nav ---------------------------------- */

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "glass border-b" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <a href="#top" aria-label="focusflow home">
          <Logo />
        </a>
        <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">
            How It Works
          </a>
          <a href="#analytics" className="transition-colors hover:text-foreground">
            Analytics
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <Link to="/auth">Sign In</Link>
          </Button>
          <Button asChild variant="hero" size="sm">
            <Link to="/auth">Start Your Journey</Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}

/* ------------------------------ hero preview ------------------------------ */

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      {/* ambient light */}
      <div
        aria-hidden
        className="absolute -inset-16 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--glow), transparent 70%)",
        }}
      />

      {/* main today card */}
      <div className="relative z-10 rounded-2xl border border-border bg-card/90 p-6 shadow-[var(--shadow-elevated)] backdrop-blur">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Today's focus
            </p>
            <p className="mt-1 font-display text-lg font-semibold">Deep work block</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-success" />
            In flow
          </span>
        </div>
        <div className="mt-5 flex items-center gap-6">
          <ProgressRing value={68} size={104} strokeWidth={9}>
            <span className="font-display text-2xl font-semibold">68%</span>
            <span className="text-[10px] text-muted-foreground">of plan</span>
          </ProgressRing>
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tasks</span>
                <span className="text-foreground">5 / 7</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-border">
                <div className="h-full w-[71%] rounded-full bg-primary" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Focus minutes</span>
                <span className="text-foreground">142</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-border">
                <div className="h-full w-[59%] rounded-full bg-violet-deep" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Daily goal</span>
                <span className="text-foreground">80%</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-border">
                <div className="h-full w-[80%] rounded-full bg-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* floating task card */}
      <div
        className="animate-float-soft absolute -left-10 top-40 z-20 w-56 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-elevated)]"
        style={{ animationDelay: "0.8s" }}
      >
        <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
          Up next
        </p>
        <div className="mt-2.5 space-y-2.5">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span className="text-muted-foreground line-through">Review notes</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Circle className="h-4 w-4 text-primary" />
            <span>Write chapter 3</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Circle className="h-4 w-4 text-muted-foreground/50" />
            <span className="text-muted-foreground">Inbox to zero</span>
          </div>
        </div>
      </div>

      {/* floating focus timer */}
      <div
        className="animate-float-soft absolute -right-6 top-24 z-20 w-44 rounded-xl border border-border bg-card p-4 text-center shadow-[var(--shadow-elevated)]"
        style={{ animationDelay: "1.6s" }}
      >
        <Timer className="mx-auto h-4 w-4 text-primary" />
        <p className="mt-2 font-display text-3xl font-semibold tabular-nums">24:51</p>
        <p className="text-[11px] text-muted-foreground">Focus session · 2 / 4</p>
        <div className="mt-3 flex justify-center gap-1.5">
          <span className="h-1.5 w-6 rounded-full bg-primary" />
          <span className="h-1.5 w-6 rounded-full bg-primary/40" />
          <span className="h-1.5 w-6 rounded-full bg-primary/40" />
          <span className="h-1.5 w-6 rounded-full bg-primary/20" />
        </div>
      </div>

      {/* weekly mini chart */}
      <div
        className="animate-float-soft absolute -right-12 bottom-6 z-20 w-52 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-elevated)]"
        style={{ animationDelay: "2.4s" }}
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            This week
          </p>
          <TrendingUp className="h-3.5 w-3.5 text-success" />
        </div>
        <div className="mt-3 flex h-16 items-end gap-1.5">
          {[38, 62, 45, 78, 55, 90, 70].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-primary/70" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
          <span>S</span>
        </div>
      </div>

      {/* AI suggestion card */}
      <div
        className="animate-float-soft absolute -left-8 bottom-16 z-30 w-64 rounded-xl border border-primary/30 bg-card p-4 shadow-[var(--shadow-elevated)]"
        style={{ animationDelay: "3.2s" }}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/15">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </span>
          <p className="text-xs font-semibold">FocusFlow Intelligence</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Your focus peaks before noon. Try scheduling writing tasks at 9–11 AM.
        </p>
      </div>
    </div>
  );
}

/* ----------------------------------- hero --------------------------------- */

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 md:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 320px at 78% 18%, var(--glow), transparent 70%), radial-gradient(500px 300px at 12% 8%, oklch(0.713 0.143 292 / 10%), transparent 70%)",
        }}
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-2">
        <div className="animate-rise-in">
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-lavender">
            <Sparkles className="h-3 w-3" />
            Your personal productivity intelligence
          </p>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
            Less chaos.
            <br />
            More{" "}
            <span className="gradient-text">meaningful progress</span>.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Turn ambitious goals into daily action. Build better habits, protect your focus, and
            understand your progress with intelligent productivity analytics.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button asChild variant="hero" size="xl">
              <Link to="/auth">
                Build My Flow <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link to="/auth">Explore Dashboard</Link>
            </Button>
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex gap-0.5">
              {[0, 1, 2].map((i) => (
                <LogoMark key={i} className="h-3.5 w-3.5 opacity-70" />
              ))}
            </span>
            Your goals. Your pace. Your progress.
          </p>
        </div>
        <HeroPreview />
      </div>
    </section>
  );
}

/* ------------------------------ metrics strip ----------------------------- */

function MetricsStrip() {
  const items = [
    { label: "Goals in Motion", value: "1,200+", note: "illustrative example" },
    { label: "Focus Sessions", value: "48K", note: "illustrative example" },
    { label: "Weekly Progress", value: "92%", note: "illustrative example" },
  ];
  return (
    <section className="border-y border-border bg-surface/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 sm:grid-cols-3">
        {items.map((it) => (
          <div key={it.label} className="text-center sm:text-left">
            <p className="font-display text-3xl font-semibold text-foreground">{it.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{it.label}</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground/60">
              {it.note}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- features -------------------------------- */

function MilestonePreview() {
  return (
    <div className="mt-6 space-y-2 rounded-lg border border-border bg-background/50 p-3">
      {[
        { t: "Research & outline", done: true },
        { t: "Draft chapters 1–3", done: true },
        { t: "Edit & polish", done: false },
      ].map((m) => (
        <div key={m.t} className="flex items-center gap-2 text-xs">
          {m.done ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
          ) : (
            <Circle className="h-3.5 w-3.5 text-primary/60" />
          )}
          <span className={m.done ? "text-muted-foreground line-through" : "text-foreground"}>
            {m.t}
          </span>
        </div>
      ))}
      <div className="pt-1 text-[10px] text-muted-foreground">Generated by AI Goal Architect</div>
    </div>
  );
}

function PriorityPreview() {
  return (
    <div className="mt-6 space-y-2">
      {[
        { t: "Thesis draft", p: "High", c: "bg-destructive/80" },
        { t: "Lab report", p: "Medium", c: "bg-primary/80" },
        { t: "Gym session", p: "Low", c: "bg-muted-foreground/40" },
      ].map((r) => (
        <div
          key={r.t}
          className="flex items-center justify-between rounded-lg border border-border bg-background/50 px-3 py-2 text-xs"
        >
          <span className="text-foreground">{r.t}</span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className={`h-1.5 w-1.5 rounded-full ${r.c}`} />
            {r.p}
          </span>
        </div>
      ))}
    </div>
  );
}

function MiniTimer() {
  return (
    <div className="mt-6 flex items-center gap-4">
      <ProgressRing value={58} size={72} strokeWidth={7}>
        <span className="font-display text-sm font-semibold">13:20</span>
      </ProgressRing>
      <div className="space-y-1 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5 text-foreground">
          <Play className="h-3 w-3 text-primary" /> Session 2 of 4
        </p>
        <p>Deep work protected</p>
      </div>
    </div>
  );
}

function HeatmapPreview() {
  const cells = Array.from({ length: 56 }, (_, i) => (i * 7 + 3) % 5);
  return (
    <div className="mt-6 grid grid-cols-14 gap-1.5" style={{ gridTemplateColumns: "repeat(14, minmax(0, 1fr))" }}>
      {cells.map((v, i) => (
        <span
          key={i}
          className="aspect-square rounded-sm"
          style={{
            background:
              v === 0
                ? "oklch(1 0 0 / 6%)"
                : `oklch(0.713 0.143 292 / ${0.25 + v * 0.18})`,
          }}
        />
      ))}
    </div>
  );
}

function SparklinePreview() {
  return (
    <div className="mt-6">
      <svg viewBox="0 0 200 56" className="w-full">
        <defs>
          <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M0 44 L25 40 L50 30 L75 34 L100 22 L125 26 L150 14 L175 18 L200 8 L200 56 L0 56 Z"
          fill="url(#spark)"
        />
        <path
          d="M0 44 L25 40 L50 30 L75 34 L100 22 L125 26 L150 14 L175 18 L200 8"
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <p className="text-[10px] text-muted-foreground">Focus trend, last 9 weeks</p>
    </div>
  );
}

function WeekBarsPreview() {
  return (
    <div className="mt-6 flex items-end justify-between gap-2">
      {[4, 6, 5, 8, 7].map((h, i) => (
        <div key={i} className="flex flex-col items-center gap-1.5">
          <div
            className={`w-6 rounded-sm ${i === 3 ? "bg-primary" : "bg-primary/40"}`}
            style={{ height: h * 6 }}
          />
          <span className="text-[10px] text-muted-foreground">{["M", "T", "W", "T", "F"][i]}</span>
        </div>
      ))}
    </div>
  );
}

const FEATURES = [
  {
    icon: Bot,
    title: "AI Goal Architect",
    copy: "Turn big ambitions into manageable milestones with an adaptive plan.",
    visual: <MilestonePreview />,
    span: "md:col-span-4",
  },
  {
    icon: CalendarDays,
    title: "Daily Flow",
    copy: "Organize tasks by priority, deadline, and category.",
    visual: <PriorityPreview />,
    span: "md:col-span-2",
  },
  {
    icon: Timer,
    title: "Focus Studio",
    copy: "Protect deep-work time with an interactive timer.",
    visual: <MiniTimer />,
    span: "md:col-span-2",
  },
  {
    icon: Flame,
    title: "Habit Garden",
    copy: "Visualize your consistency with a beautiful activity calendar.",
    visual: <HeatmapPreview />,
    span: "md:col-span-4",
  },
  {
    icon: TrendingUp,
    title: "Productivity Intelligence",
    copy: "Transform activity records into useful insights.",
    visual: <SparklinePreview />,
    span: "md:col-span-3",
  },
  {
    icon: Target,
    title: "Weekly Reflection",
    copy: "Understand what worked and plan your next week.",
    visual: <WeekBarsPreview />,
    span: "md:col-span-3",
  },
];

function Features() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-6 py-24">
      <Reveal>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Features</p>
        <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Everything you need to move forward.
        </h2>
      </Reveal>
      <div className="mt-12 grid gap-5 md:grid-cols-6">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i * 70} className={f.span}>
            <div className="card-hover group h-full rounded-2xl border border-border bg-card p-6 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-elevated)]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/12 text-primary transition-colors group-hover:bg-primary/20">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.copy}</p>
              {f.visual}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- pipeline -------------------------------- */

const STAGES = [
  { name: "Activity Data", desc: "Tasks, sessions and habits recorded as you work." },
  { name: "Validation", desc: "Records are checked for completeness and consistency." },
  { name: "Transformation", desc: "Raw events become clean daily metrics." },
  { name: "Aggregation", desc: "Daily metrics roll up into weekly summaries." },
  { name: "Insights", desc: "Patterns surface in analytics and AI suggestions." },
];

function Pipeline() {
  return (
    <section id="how-it-works" className="border-y border-border bg-surface/50 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">How it works</p>
          <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold tracking-tight md:text-5xl">
            From everyday actions to meaningful insights.
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <div className="relative mt-16">
            {/* connector line (desktop) */}
            <svg
              aria-hidden
              className="absolute inset-x-0 top-5 hidden h-1 w-full md:block"
              preserveAspectRatio="none"
              viewBox="0 0 100 4"
            >
              <line x1="2" y1="2" x2="98" y2="2" stroke="var(--color-primary)" strokeOpacity="0.35" strokeWidth="0.5" className="pipe-flow" />
            </svg>
            <div className="grid gap-10 md:grid-cols-5 md:gap-4">
              {STAGES.map((s, i) => (
                <div key={s.name} className="relative">
                  <div className="flex items-center gap-3 md:block">
                    <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-primary/40 bg-background">
                      <span
                        className="pulse-dot h-2.5 w-2.5 rounded-full bg-primary"
                        style={{ animationDelay: `${i * 0.3}s` }}
                      />
                    </span>
                    <p className="font-display text-sm font-semibold md:mt-4">{s.name}</p>
                  </div>
                  <p className="mt-2 max-w-[200px] text-xs leading-relaxed text-muted-foreground md:mt-3">
                    {s.desc}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground/50">
                    Stage {i + 1} · healthy
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-14 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Button asChild variant="hero">
              <Link to="/auth">
                Explore Analytics <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              Analytics are computed from your own records — nothing is faked.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -------------------------------- final CTA + footer ----------------------- */

function FinalCta() {
  return (
    <section id="analytics" className="relative overflow-hidden py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(520px 280px at 50% 30%, var(--glow), transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-2xl px-6 text-center">
        <Reveal>
          <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
            Your next chapter starts with one{" "}
            <span className="gradient-text">focused step</span>.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Set your first goal, protect your first focus block, and watch the pattern emerge.
          </p>
          <div className="mt-8">
            <Button asChild variant="hero" size="xl">
              <Link to="/auth">
                Get Started — It's Your Time <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Your mind, in motion. A premium productivity intelligence platform.
          </p>
        </div>
        <div className="flex gap-16 text-sm">
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Product
            </p>
            <a href="#features" className="block text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="block text-muted-foreground transition-colors hover:text-foreground">
              How It Works
            </a>
            <Link to="/auth" className="block text-muted-foreground transition-colors hover:text-foreground">
              Sign in
            </Link>
          </div>
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Account
            </p>
            <Link to="/auth" className="block text-muted-foreground transition-colors hover:text-foreground">
              Start Your Journey
            </Link>
            <a href="#analytics" className="block text-muted-foreground transition-colors hover:text-foreground">
              Analytics
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} focusflow. Focus sessions, goals and analytics live in your account.
      </div>
    </footer>
  );
}

/* ----------------------------------- page ---------------------------------- */

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main>
        <Hero />
        <MetricsStrip />
        <Features />
        <Pipeline />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
