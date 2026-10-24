import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Circle,
  Flame,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ProgressRing } from "@/components/shared/progress-ring";
import { Card, EmptyState, StatCard } from "@/components/app/bits";
import { TaskDialog } from "@/components/app/task-dialog";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import {
  dailyMetricsQuery,
  focusSessionsQuery,
  goalsQuery,
  profileQuery,
  tasksQuery,
  type Task,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  ssr: false,
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(tasksQuery());
    void context.queryClient.ensureQueryData(goalsQuery());
    void context.queryClient.ensureQueryData(dailyMetricsQuery());
    void context.queryClient.ensureQueryData(focusSessionsQuery());
    void context.queryClient.ensureQueryData(profileQuery());
  },
  component: DashboardPage,
});

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Still up";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function DashboardPage() {
  const { data: tasks } = useSuspenseQuery(tasksQuery());
  const { data: goals } = useSuspenseQuery(goalsQuery());
  const { data: metrics } = useSuspenseQuery(dailyMetricsQuery());
  const { data: sessions } = useSuspenseQuery(focusSessionsQuery());
  const { data: profile } = useSuspenseQuery(profileQuery());

  const name = profile?.display_name || "there";
  const today = todayISO();

  const todayTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (t.due_at && t.due_at.startsWith(today)) || (t.completed_at && t.completed_at.startsWith(today)),
      ),
    [tasks, today],
  );
  const doneToday = todayTasks.filter((t) => t.status === "done").length;
  const todayPct = todayTasks.length ? Math.round((doneToday / todayTasks.length) * 100) : 0;

  const openTasks = tasks.filter((t) => t.status !== "done");
  const overdue = openTasks.filter((t) => t.due_at && t.due_at < today).length;
  const focusToday = sessions
    .filter((s) => s.started_at.startsWith(today))
    .reduce((sum, s) => sum + s.minutes, 0);

  const trend = useMemo(() => {
    const days: { day: string; label: string; minutes: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate(),
      ).padStart(2, "0")}`;
      days.push({
        day: iso,
        label: d.toLocaleDateString("en", { weekday: "short" }).slice(0, 2),
        minutes: metrics.find((m) => m.date === iso)?.focus_minutes ?? 0,
      });
    }
    return days;
  }, [metrics]);

  const weekFocus = trend.reduce((s, d) => s + d.minutes, 0);
  const lastWeekFocus = trend.slice(0, 7).reduce((s, d) => s + d.minutes, 0);
  const thisWeekFocus = trend.slice(7).reduce((s, d) => s + d.minutes, 0);
  const focusDelta = lastWeekFocus > 0 ? Math.round(((thisWeekFocus - lastWeekFocus) / lastWeekFocus) * 100) : 0;

  const bestDay = trend.reduce((best, d) => (d.minutes > best.minutes ? d : best), trend[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            {greeting()}, {name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {overdue > 0
              ? `${overdue} task${overdue > 1 ? "s" : ""} slipped past their due date — worth a look.`
              : "You're on top of things. Here's your flow today."}
          </p>
        </div>
        <Link to="/focus">
          <Button variant="hero" className="gap-2">
            <Timer className="h-4 w-4" /> Start a focus session
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Focus today" value={`${focusToday} min`} sub={`${sessions.filter((s) => s.started_at.startsWith(today)).length} session(s)`} icon={Timer} />
        <StatCard label="Open tasks" value={openTasks.length} sub={`${tasks.filter((t) => t.status === "done").length} completed all-time`} icon={CheckCircle2} />
        <StatCard label="Active goals" value={goals.filter((g) => g.status === "active").length} sub="in motion right now" icon={Target} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's focus + tasks */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Today's focus
              </p>
              <p className="mt-1 font-display text-lg font-semibold">
                {todayTasks.length
                  ? `${doneToday} of ${todayTasks.length} planned tasks done`
                  : "Nothing scheduled for today yet"}
              </p>
            </div>
            <ProgressRing value={todayPct} size={84} strokeWidth={8}>
              <span className="font-display text-lg font-semibold">{todayPct}%</span>
            </ProgressRing>
          </div>
          <div className="mt-5 space-y-1.5">
            {openTasks.slice(0, 5).map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
            {openTasks.length === 0 && (
              <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
                All clear. Add a task to keep the momentum.
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Link to="/tasks" className="text-xs font-medium text-primary hover:underline">
              View all tasks
            </Link>
            <QuickAddInline />
          </div>
        </Card>

        {/* Focus timer widget */}
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Focus timer
          </p>
          <MiniTimer />
          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Goal in progress
            </p>
            {goals.filter((g) => g.status === "active").slice(0, 2).map((g) => {
              const total = g.milestones.length;
              const done = g.milestones.filter((m) => m.done).length;
              const pct = total ? Math.round((done / total) * 100) : g.progress;
              return (
                <div key={g.id} className="mt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{g.title}</span>
                    <span className="tabular-nums text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-border">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && (
              <Link to="/goals" className="mt-3 flex items-center gap-1.5 text-sm text-primary hover:underline">
                Create your first goal <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trend chart */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Focus trend · last 14 days
              </p>
              <p className="mt-1 font-display text-lg font-semibold tabular-nums">
                {weekFocus} minutes
              </p>
            </div>
            <span
              className={cn(
                "flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-xs",
                focusDelta >= 0 ? "text-success" : "text-destructive",
              )}
            >
              <TrendingUp className={cn("h-3.5 w-3.5", focusDelta < 0 && "rotate-180")} />
              {focusDelta >= 0 ? "+" : ""}{focusDelta}% vs last week
            </span>
          </div>
          <ChartContainer
            config={{ minutes: { label: "Focus minutes", color: "var(--color-primary)" } }}
            className="mt-4 h-40 w-full"
          >
            <AreaChart data={trend} margin={{ left: -20, right: 8 }}>
              <defs>
                <linearGradient id="dashFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#dashFill)"
              />
            </AreaChart>
          </ChartContainer>
        </Card>

        {/* AI insight */}
        <Card className="border-primary/25 p-5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15">
              <Bot className="h-4 w-4 text-primary" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              FocusFlow Intelligence
            </p>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {focusToday > 0
              ? `You've logged ${focusToday} focus minutes today. Your strongest recent day was ${
                  bestDay?.label ?? "—"
                } with ${bestDay?.minutes ?? 0} minutes — try protecting a similar block tomorrow.`
              : openTasks.length > 0
                ? `You have ${openTasks.length} open tasks but no focus time yet today. Starting with the ${
                    openTasks.find((t) => t.priority === "high") ? "highest-priority" : "oldest"
                  } one usually unlocks momentum.`
                : "Your plate is clear — a great moment to plan the next goal."}
          </p>
          <Link
            to="/planner"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            Plan with AI <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: Task }) {
  const queryClient = useQueryClient();
  const toggle = useMutation({
    mutationFn: async () => {
      const done = task.status === "done";
      const { error } = await supabase
        .from("tasks")
        .update({
          status: done ? "todo" : "done",
          completed_at: done ? null : new Date().toISOString(),
        })
        .eq("id", task.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    onError: (e) => toast.error(e.message),
  });
  const overdue = task.due_at && task.due_at < todayISO() && task.status !== "done";

  return (
    <button
      onClick={() => toggle.mutate()}
      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-accent/50"
    >
      {task.status === "done" ? (
        <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
      ) : (
        <Circle className="h-4 w-4 shrink-0 text-primary/70" />
      )}
      <span className={cn("truncate", task.status === "done" && "text-muted-foreground line-through")}>
        {task.title}
      </span>
      {overdue && <span className="ml-auto shrink-0 text-[10px] font-medium text-destructive">Overdue</span>}
      {task.due_at && !overdue && (
        <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">
          {task.due_at.slice(5, 10).replace("-", "/")}
        </span>
      )}
    </button>
  );
}

function QuickAddInline() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" className="gap-1" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" /> Add
      </Button>
      <TaskDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function MiniTimer() {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (running && secondsLeft === 0 && startedAt) {
      setRunning(false);
      (async () => {
        const { data } = await supabase.auth.getUser();
        if (!data.user) return;
        const completed = new Date().toISOString();
        const { error } = await supabase.from("focus_sessions").insert({
          user_id: data.user.id,
          minutes: 25,
          session_type: "pomodoro",
          started_at: startedAt,
          completed_at: completed,
        });
        if (error) {
          toast.error(error.message);
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ["focus-sessions"] });
        toast.success("25-minute session recorded. Nice work!");
      })();
    }
  }, [running, secondsLeft, startedAt, queryClient]);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const pct = 100 - (secondsLeft / (25 * 60)) * 100;

  return (
    <div className="mt-4 flex flex-col items-center">
      <ProgressRing value={pct} size={132} strokeWidth={10}>
        <span className="font-display text-2xl font-semibold tabular-nums">
          {mm}:{ss}
        </span>
        <span className="text-[10px] text-muted-foreground">Pomodoro · 25 min</span>
      </ProgressRing>
      <div className="mt-4 flex gap-2">
        <Button
          size="sm"
          variant={running ? "secondary" : "hero"}
          className="gap-1.5"
          onClick={() => {
            if (!running && secondsLeft === 25 * 60) setStartedAt(new Date().toISOString());
            setRunning((r) => !r);
          }}
        >
          {running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {running ? "Pause" : secondsLeft === 25 * 60 ? "Start" : "Resume"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-label="Reset timer"
          onClick={() => {
            setRunning(false);
            setSecondsLeft(25 * 60);
            setStartedAt(null);
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
      <Link
        to="/focus"
        className="mt-3 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <Flame className="h-3 w-3" /> Open Focus Studio for longer sessions
      </Link>
    </div>
  );
}
