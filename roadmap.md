# FocusFlow AI — Roadmap

Source spec: user upload `PROJECT_FocusFlow_AI_pasted.md` (725 lines).

## Phase 1 — Foundation (this build)
- [x] Enable Lovable Cloud, email/password auth, Google + Lovable sign-in
- [x] Database schema + RLS (profiles, tasks, goals, milestones, habits, habit_completions, focus_sessions, activity_records, daily_metrics, weekly_summaries, pipeline_runs)
- [x] Design system in src/styles.css (dark, violet/lavender, Inter + Space Grotesk)
- [x] Root shell: fonts, Toaster, auth state listener
- [x] Logo component (two flowing curves + lowercase wordmark)

## Phase 2 — Landing & shell
- [x] Landing page (/) with nav, hero + layered dashboard preview, metrics strip, features, data pipeline, final CTA, footer
- [x] Auth page (/auth) — sign in / sign up / Google / Lovable
- [x] _authenticated layout: slim collapsible sidebar + top utility bar

## Phase 3 — Core app pages
- [x] Dashboard: greeting, Today's Focus card, task list w/ filters, goal cards, focus timer widget, trend chart, AI insight card
- [x] My Tasks: list/board/calendar views, filters, sorting, CRUD, empty states
- [x] Goals: CRUD, milestone tracking, progress
- [x] Habits: habit cards, heatmap, streaks, CRUD, duplicate-completion guard
- [x] Settings: profile name, sign out

## Phase 4 — Intelligence
- [x] Focus Studio: immersive timer, records sessions
- [x] Data pipeline: Run Pipeline server fn (validate → daily metrics → weekly summaries), status panel
- [x] Analytics: overview stats + 6 charts from stored records, date-range filters
- [x] Weekly Reports: weekly calendar selector, comparison vs prev week, Export CSV
- [x] AI Planner: real AI gateway call (goal → milestones/weekly plan/tasks), approve & save

## Phase 5 — Verification
- [ ] Responsive checks (desktop/tablet/mobile), empty states, auth end-to-end test in preview
