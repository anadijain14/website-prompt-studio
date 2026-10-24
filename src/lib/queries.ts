import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type Goal = Database["public"]["Tables"]["goals"]["Row"];
export type Milestone = Database["public"]["Tables"]["milestones"]["Row"];
export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitCompletion = Database["public"]["Tables"]["habit_completions"]["Row"];
export type FocusSession = Database["public"]["Tables"]["focus_sessions"]["Row"];
export type DailyMetric = Database["public"]["Tables"]["daily_metrics"]["Row"];
export type WeeklySummary = Database["public"]["Tables"]["weekly_summaries"]["Row"];
export type PipelineRun = Database["public"]["Tables"]["pipeline_runs"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export interface GoalWithMilestones extends Goal {
  milestones: Milestone[];
}

export interface HabitWithCompletions extends Habit {
  completions: string[]; // YYYY-MM-DD
}

async function must<T>(promise: PromiseLike<{ data: T | null; error: { message: string } | null }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return data as T;
}

/* --------------------------------- reads ---------------------------------- */

export const profileQuery = () =>
  queryOptions({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return null;
      return must<Profile | null>(
        supabase.from("profiles").select("*").eq("id", data.user.id).maybeSingle(),
      );
    },
  });

export const tasksQuery = () =>
  queryOptions({
    queryKey: ["tasks"],
    queryFn: () =>
      must<Task[]>(
        supabase.from("tasks").select("*").order("created_at", { ascending: false }),
      ),
  });

export const goalsQuery = () =>
  queryOptions({
    queryKey: ["goals"],
    queryFn: async () => {
      const goals = await must<Goal[]>(
        supabase.from("goals").select("*").order("created_at", { ascending: false }),
      );
      const milestones = await must<Milestone[]>(
        supabase.from("milestones").select("*").order("sort_order", { ascending: true }),
      );
      return goals.map<GoalWithMilestones>((g) => ({
        ...g,
        milestones: milestones.filter((m) => m.goal_id === g.id),
      }));
    },
  });

export const habitsQuery = () =>
  queryOptions({
    queryKey: ["habits"],
    queryFn: async () => {
      const habits = await must<Habit[]>(
        supabase.from("habits").select("*").order("created_at", { ascending: true }),
      );
      const completions = await must<HabitCompletion[]>(
        supabase.from("habit_completions").select("*").order("date", { ascending: false }),
      );
      return habits.map<HabitWithCompletions>((h) => ({
        ...h,
        completions: completions.filter((c) => c.habit_id === h.id).map((c) => c.date),
      }));
    },
  });

export const focusSessionsQuery = () =>
  queryOptions({
    queryKey: ["focus-sessions"],
    queryFn: () =>
      must<FocusSession[]>(
        supabase
          .from("focus_sessions")
          .select("*")
          .order("started_at", { ascending: false })
          .limit(500),
      ),
  });

export const dailyMetricsQuery = () =>
  queryOptions({
    queryKey: ["daily-metrics"],
    queryFn: () =>
      must<DailyMetric[]>(
        supabase.from("daily_metrics").select("*").order("date", { ascending: false }).limit(365),
      ),
  });

export const weeklySummariesQuery = () =>
  queryOptions({
    queryKey: ["weekly-summaries"],
    queryFn: () =>
      must<WeeklySummary[]>(
        supabase
          .from("weekly_summaries")
          .select("*")
          .order("week_start", { ascending: false })
          .limit(52),
      ),
  });

export const pipelineRunsQuery = () =>
  queryOptions({
    queryKey: ["pipeline-runs"],
    queryFn: () =>
      must<PipelineRun[]>(
        supabase.from("pipeline_runs").select("*").order("started_at", { ascending: false }).limit(10),
      ),
  });

/* ------------------------------- mutations -------------------------------- */

export async function invalidateAfter(userId: string, keys: string[][]) {
  return keys;
}

export function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}
