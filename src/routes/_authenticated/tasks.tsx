import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock,
  Columns3,
  ListChecks,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, EmptyState, PageHeader, PRIORITY_STYLES } from "@/components/app/bits";
import { TaskDialog } from "@/components/app/task-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { tasksQuery, type Task } from "@/lib/queries";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/tasks")({
  ssr: false,
  loader: ({ context }) => {
    void context.queryClient.ensureQueryData(tasksQuery());
  },
  component: TasksPage,
  validateSearch: (search: Record<string, unknown>): { view?: "list" | "board" | "calendar" } => ({
    view: ["list", "board", "calendar"].includes(String(search.view))
      ? (search.view as "list" | "board" | "calendar")
      : undefined,
  }),
});

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

function TasksPage() {
  const { view: rawView } = Route.useSearch();
  const navigate = useNavigateSafe();
  const view = rawView ?? "list";
  const { data: tasks } = useSuspenseQuery(tasksQuery());
  const queryClient = useQueryClient();

  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"created" | "due" | "priority">("created");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const categories = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.category))).sort(),
    [tasks],
  );

  const filtered = useMemo(() => {
    let list = tasks;
    if (status === "open") list = list.filter((t) => t.status !== "done");
    else if (status !== "all") list = list.filter((t) => t.status === status);
    if (priority !== "all") list = list.filter((t) => t.priority === priority);
    if (category !== "all") list = list.filter((t) => t.category === category);
    if (search.trim())
      list = list.filter((t) => t.title.toLowerCase().includes(search.trim().toLowerCase()));
    return [...list].sort((a, b) => {
      if (sort === "due") {
        if (!a.due_at) return 1;
        if (!b.due_at) return -1;
        return a.due_at.localeCompare(b.due_at);
      }
      if (sort === "priority") return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      return b.created_at.localeCompare(a.created_at);
    });
  }, [tasks, status, priority, category, search, sort]);

  const toggle = useMutation({
    mutationFn: async (task: Task) => {
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

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted");
    },
    onError: (e) => toast.error(e.message),
  });

  function openNew() {
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(task: Task) {
    setEditing(task);
    setDialogOpen(true);
  }

  return (
    <div>
      <PageHeader title="My Tasks" description={`${filtered.length} of ${tasks.length} tasks shown`}>
        <Button onClick={openNew} className="gap-1.5">
          <Plus className="h-4 w-4" /> New task
        </Button>
      </PageHeader>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <Tabs
          value={view}
          onValueChange={(v) => navigate({ search: { view: v as typeof view } })}
        >
          <TabsList>
            <TabsTrigger value="list" className="gap-1.5">
              <ListChecks className="h-3.5 w-3.5" /> List
            </TabsTrigger>
            <TabsTrigger value="board" className="gap-1.5">
              <Columns3 className="h-3.5 w-3.5" /> Board
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> Calendar
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tasks…"
          className="h-9 w-40"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="todo">To do</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="h-9 w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Newest first</SelectItem>
            <SelectItem value="due">Due date</SelectItem>
            <SelectItem value="priority">Priority</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListChecks}
          title="No tasks yet"
          description="Capture what needs doing, give it a priority, and let your daily flow build itself."
          action={
            <Button onClick={openNew} className="gap-1.5">
              <Plus className="h-4 w-4" /> Add your first task
            </Button>
          }
        />
      ) : view === "list" ? (
        <Card className="divide-y divide-border p-1">
          {filtered.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No tasks match these filters.
            </p>
          )}
          {filtered.map((t) => (
            <TaskListRow
              key={t.id}
              task={t}
              onToggle={() => toggle.mutate(t)}
              onEdit={() => openEdit(t)}
              onDelete={() => remove.mutate(t.id)}
            />
          ))}
        </Card>
      ) : view === "board" ? (
        <div className="grid gap-4 md:grid-cols-3">
          {(["todo", "in_progress", "done"] as const).map((col) => (
            <div key={col} className="rounded-xl border border-border bg-surface/50 p-3">
              <p className="mb-3 px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {col === "todo" ? "To do" : col === "in_progress" ? "In progress" : "Done"} ·{" "}
                {filtered.filter((t) => t.status === col).length}
              </p>
              <div className="space-y-2">
                {filtered
                  .filter((t) => t.status === col)
                  .map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      onEdit={() => openEdit(t)}
                      onDelete={() => remove.mutate(t.id)}
                      onAdvance={() => {
                        const next =
                          col === "todo" ? "in_progress" : col === "in_progress" ? "done" : "todo";
                        void (async () => {
                          const { error } = await supabase
                            .from("tasks")
                            .update({
                              status: next,
                              completed_at: next === "done" ? new Date().toISOString() : null,
                            })
                            .eq("id", t.id);
                          if (error) return toast.error(error.message);
                          queryClient.invalidateQueries({ queryKey: ["tasks"] });
                        })();
                      }}
                    />
                  ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <CalendarView tasks={tasks} onDayClick={openNew} />
      )}

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} task={editing} />
    </div>
  );
}

function useNavigateSafe() {
  // small wrapper to keep the import surface tiny
  const { useNavigate } = require("@tanstack/react-router") as typeof import("@tanstack/react-router");
  return useNavigate();
}

function TaskListRow({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const today = todayISO();
  const overdue = task.due_at && task.due_at < today && task.status !== "done";
  return (
    <div className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/40">
      <button onClick={onToggle} aria-label="Toggle task status" className="shrink-0">
        {task.status === "done" ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <Circle className="h-5 w-5 text-primary/60 transition-colors hover:text-primary" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "truncate text-sm font-medium",
            task.status === "done" && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </p>
        <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>{task.category}</span>
          {task.due_at && (
            <span className={cn("flex items-center gap-1", overdue && "text-destructive")}>
              <Clock className="h-3 w-3" /> {task.due_at.slice(0, 10)}
              {overdue ? " · overdue" : ""}
            </span>
          )}
          {task.estimated_minutes && <span>{task.estimated_minutes} min</span>}
        </div>
      </div>
      <span className={cn("shrink-0 text-xs font-medium", PRIORITY_STYLES[task.priority])}>
        {task.priority}
      </span>
      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button size="icon" variant="ghost" aria-label="Edit task" onClick={onEdit} className="h-7 w-7">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" aria-label="Delete task" onClick={onDelete} className="h-7 w-7 text-muted-foreground hover:text-destructive">
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onEdit,
  onDelete,
  onAdvance,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onAdvance: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className={cn("text-sm font-medium", task.status === "done" && "text-muted-foreground line-through")}>
        {task.title}
      </p>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span className={cn("font-medium", PRIORITY_STYLES[task.priority])}>{task.priority}</span>
        <span>{task.category}</span>
      </div>
      <div className="mt-2 flex gap-1">
        <Button size="sm" variant="secondary" className="h-6 flex-1 text-[11px]" onClick={onAdvance}>
          Advance
        </Button>
        <Button size="icon" variant="ghost" aria-label="Edit task" onClick={onEdit} className="h-6 w-6">
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Delete task"
          onClick={onDelete}
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

function CalendarView({ tasks, onDayClick }: { tasks: Task[]; onDayClick: () => void }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const base = new Date();
  base.setDate(1);
  base.setMonth(base.getMonth() + monthOffset);
  const year = base.getFullYear();
  const month = base.getMonth();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = todayISO();

  const byDay = new Map<string, Task[]>();
  for (const t of tasks) {
    if (!t.due_at) continue;
    const key = t.due_at.slice(0, 10);
    byDay.set(key, [...(byDay.get(key) ?? []), t]);
  }

  const cells: (Date | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="font-display font-semibold">
          {base.toLocaleDateString("en", { month: "long", year: "numeric" })}
        </p>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => setMonthOffset((m) => m - 1)}>
            ←
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setMonthOffset((m) => m + 1)}>
            →
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-wider text-muted-foreground">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
            d.getDate(),
          ).padStart(2, "0")}`;
          const dayTasks = byDay.get(iso) ?? [];
          return (
            <button
              key={iso}
              onClick={onDayClick}
              className={cn(
                "min-h-20 rounded-lg border border-transparent p-1.5 text-left transition-colors hover:border-border hover:bg-accent/40",
                iso === today && "border-primary/40 bg-primary/5",
              )}
            >
              <span
                className={cn(
                  "text-xs tabular-nums",
                  iso === today ? "font-semibold text-primary" : "text-muted-foreground",
                )}
              >
                {d.getDate()}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayTasks.slice(0, 2).map((t) => (
                  <p
                    key={t.id}
                    className={cn(
                      "truncate rounded bg-secondary px-1 py-0.5 text-[10px]",
                      t.status === "done" && "text-muted-foreground line-through",
                    )}
                  >
                    {t.title}
                  </p>
                ))}
                {dayTasks.length > 2 && (
                  <p className="text-[10px] text-muted-foreground">+{dayTasks.length - 2} more</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function todayISO() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate(),
  ).padStart(2, "0")}`;
}
