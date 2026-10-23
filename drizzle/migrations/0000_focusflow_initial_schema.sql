create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'general',
  priority text not null default 'medium',
  status text not null default 'todo',
  due_at timestamptz,
  completed_at timestamptz,
  estimated_minutes int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'personal',
  target_date date,
  status text not null default 'active',
  progress int not null default 0,
  plan jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  target_date date,
  done boolean not null default false,
  sort_order int not null default 0
);

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  color text not null default 'violet',
  target_per_week int not null default 7,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  unique (habit_id, date)
);

create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  session_type text not null default 'focus',
  minutes int not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.activity_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_type text not null,
  payload jsonb,
  occurred_at timestamptz not null default now()
);

create table public.daily_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  tasks_created int not null default 0,
  tasks_completed int not null default 0,
  focus_minutes int not null default 0,
  sessions_count int not null default 0,
  habits_completed int not null default 0,
  unique (user_id, date)
);

create table public.weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  week_start date not null,
  tasks_completed int not null default 0,
  focus_minutes int not null default 0,
  completion_rate numeric not null default 0,
  habit_consistency numeric not null default 0,
  unique (user_id, week_start)
);

create table public.pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'running',
  records_processed int not null default 0,
  validation_errors int not null default 0,
  stage_details jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

-- Profile auto-creation on signup (auth lifecycle trigger)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS + grants per table
alter table public.profiles enable row level security;
create policy "profiles select own" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "profiles insert own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles update own" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.tasks enable row level security;
create policy "tasks select own" on public.tasks for select to authenticated using (auth.uid() = user_id);
create policy "tasks insert own" on public.tasks for insert to authenticated with check (auth.uid() = user_id);
create policy "tasks update own" on public.tasks for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks delete own" on public.tasks for delete to authenticated using (auth.uid() = user_id);
grant select, insert, update, delete on public.tasks to authenticated;
grant all on public.tasks to service_role;

alter table public.goals enable row level security;
create policy "goals select own" on public.goals for select to authenticated using (auth.uid() = user_id);
create policy "goals insert own" on public.goals for insert to authenticated with check (auth.uid() = user_id);
create policy "goals update own" on public.goals for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals delete own" on public.goals for delete to authenticated using (auth.uid() = user_id);
grant select, insert, update, delete on public.goals to authenticated;
grant all on public.goals to service_role;

alter table public.milestones enable row level security;
create policy "milestones select own" on public.milestones for select to authenticated using (auth.uid() = user_id);
create policy "milestones insert own" on public.milestones for insert to authenticated with check (auth.uid() = user_id);
create policy "milestones update own" on public.milestones for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "milestones delete own" on public.milestones for delete to authenticated using (auth.uid() = user_id);
grant select, insert, update, delete on public.milestones to authenticated;
grant all on public.milestones to service_role;

alter table public.habits enable row level security;
create policy "habits select own" on public.habits for select to authenticated using (auth.uid() = user_id);
create policy "habits insert own" on public.habits for insert to authenticated with check (auth.uid() = user_id);
create policy "habits update own" on public.habits for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "habits delete own" on public.habits for delete to authenticated using (auth.uid() = user_id);
grant select, insert, update, delete on public.habits to authenticated;
grant all on public.habits to service_role;

alter table public.habit_completions enable row level security;
create policy "habit_completions select own" on public.habit_completions for select to authenticated using (auth.uid() = user_id);
create policy "habit_completions insert own" on public.habit_completions for insert to authenticated with check (auth.uid() = user_id);
create policy "habit_completions delete own" on public.habit_completions for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.habit_completions to authenticated;
grant all on public.habit_completions to service_role;

alter table public.focus_sessions enable row level security;
create policy "focus_sessions select own" on public.focus_sessions for select to authenticated using (auth.uid() = user_id);
create policy "focus_sessions insert own" on public.focus_sessions for insert to authenticated with check (auth.uid() = user_id);
create policy "focus_sessions update own" on public.focus_sessions for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "focus_sessions delete own" on public.focus_sessions for delete to authenticated using (auth.uid() = user_id);
grant select, insert, update, delete on public.focus_sessions to authenticated;
grant all on public.focus_sessions to service_role;

alter table public.activity_records enable row level security;
create policy "activity_records select own" on public.activity_records for select to authenticated using (auth.uid() = user_id);
create policy "activity_records insert own" on public.activity_records for insert to authenticated with check (auth.uid() = user_id);
create policy "activity_records delete own" on public.activity_records for delete to authenticated using (auth.uid() = user_id);
grant select, insert, delete on public.activity_records to authenticated;
grant all on public.activity_records to service_role;

alter table public.daily_metrics enable row level security;
create policy "daily_metrics select own" on public.daily_metrics for select to authenticated using (auth.uid() = user_id);
create policy "daily_metrics insert own" on public.daily_metrics for insert to authenticated with check (auth.uid() = user_id);
create policy "daily_metrics update own" on public.daily_metrics for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "daily_metrics delete own" on public.daily_metrics for delete to authenticated using (auth.uid() = user_id);
grant select, insert, update, delete on public.daily_metrics to authenticated;
grant all on public.daily_metrics to service_role;

alter table public.weekly_summaries enable row level security;
create policy "weekly_summaries select own" on public.weekly_summaries for select to authenticated using (auth.uid() = user_id);
create policy "weekly_summaries insert own" on public.weekly_summaries for insert to authenticated with check (auth.uid() = user_id);
create policy "weekly_summaries update own" on public.weekly_summaries for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "weekly_summaries delete own" on public.weekly_summaries for delete to authenticated using (auth.uid() = user_id);
grant select, insert, update, delete on public.weekly_summaries to authenticated;
grant all on public.weekly_summaries to service_role;

alter table public.pipeline_runs enable row level security;
create policy "pipeline_runs select own" on public.pipeline_runs for select to authenticated using (auth.uid() = user_id);
create policy "pipeline_runs insert own" on public.pipeline_runs for insert to authenticated with check (auth.uid() = user_id);
create policy "pipeline_runs update own" on public.pipeline_runs for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update on public.pipeline_runs to authenticated;
grant all on public.pipeline_runs to service_role;