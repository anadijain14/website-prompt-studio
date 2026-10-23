import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import "@lovable.dev/cloud-auth-js/styles.css";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Mode = "signin" | "signup";

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>): { mode: Mode; redirect?: string } => ({
    mode: search["mode"] === "signup" ? "signup" : "signin",
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  ssr: false,
  component: AuthPage,
});

const AUTH_REDIRECT_TARGET = "/dashboard";

function safeRedirect(raw?: string) {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return AUTH_REDIRECT_TARGET;
}

function AuthPage() {
  const { mode, redirect } = Route.useSearch();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: safeRedirect(redirect), replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [navigate, redirect]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-border bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(480px 280px at 30% 20%, var(--glow), transparent 70%), radial-gradient(420px 260px at 70% 85%, oklch(0.713 0.143 292 / 10%), transparent 70%)",
          }}
        />
        <Logo />
        <div className="relative">
          <h1 className="max-w-md font-display text-4xl font-semibold leading-tight tracking-tight">
            Less chaos. More <span className="gradient-text">meaningful progress</span>.
          </h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            One place to plan your goals, protect your focus, and see the patterns behind your
            progress.
          </p>
          <div className="mt-8 flex gap-3">
            {["Goals", "Focus", "Habits", "Insights"].map((t) => (
              <span
                key={t}
                className="rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-muted-foreground">Your goals. Your pace. Your progress.</p>
      </div>

      {/* Form panel */}
      <div className="relative flex items-center justify-center px-6 py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{ background: "radial-gradient(400px 240px at 50% 10%, var(--glow), transparent 70%)" }}
        />
        <div className="relative w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <Logo />
          </div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "signup"
              ? "Start turning ambition into daily action."
              : "Sign in to continue your flow."}
          </p>

          <Tabs defaultValue={mode} className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="signin"
                onClick={() => navigate({ to: "/auth", search: { mode: "signin" }, replace: true })}
              >
                Sign in
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                onClick={() => navigate({ to: "/auth", search: { mode: "signup" }, replace: true })}
              >
                Sign up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <SignInForm redirectTo={safeRedirect(redirect)} />
            </TabsContent>
            <TabsContent value="signup">
              <SignUpForm />
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or continue with
            <span className="h-px flex-1 bg-border" />
          </div>

          <div className="grid gap-2.5">
            <Button
              variant="outline"
              className="h-11"
              onClick={async () => {
                const { error } = await lovable.auth.signInWithOAuth("google", {
                  redirect_uri: window.location.origin,
                });
                if (error) toast.error(error.message);
              }}
            >
              <GoogleMark /> Google
            </Button>
            <button
              type="button"
              className="lovable-auth-button h-11"
              onClick={async () => {
                const { error } = await lovable.auth.signInWithOAuth("lovable", {
                  redirect_uri: window.location.origin,
                });
                if (error) toast.error(error.message);
              }}
            >
              Continue with Lovable
            </button>
          </div>

          <p className="mt-8 text-center text-[11px] leading-relaxed text-muted-foreground">
            By continuing you agree that your goals, tasks and analytics are stored in your
            personal account.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#EA4335" d="M12 5.04c1.62 0 3.06.56 4.2 1.64l3.12-3.12C17.46 1.8 14.96.72 12 .72 7.44.72 3.56 3.36 1.72 7.28l3.66 2.84C6.26 7.14 8.88 5.04 12 5.04z" />
      <path fill="#4285F4" d="M23.28 12.26c0-.8-.08-1.56-.2-2.26H12v4.52h6.34c-.28 1.48-1.1 2.74-2.34 3.58l3.62 2.8c2.12-1.96 3.66-4.84 3.66-8.64z" />
      <path fill="#FBBC05" d="M5.4 14.24a6.9 6.9 0 0 1 0-4.12L1.72 7.28a11.28 11.28 0 0 0 0 9.8l3.66-2.84z" />
      <path fill="#34A853" d="M12 23.28c3.04 0 5.6-1 7.46-2.72l-3.62-2.8c-1 .68-2.28 1.08-3.84 1.08-3.12 0-5.74-2.1-6.6-4.96l-3.66 2.84c1.84 3.92 5.72 6.56 10.26 6.56z" />
    </svg>
  );
}

function SignInForm({ redirectTo }: { redirectTo: string }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentReset, setSentReset] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: redirectTo, replace: true });
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <Input
          id="signin-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="signin-password">Password</Label>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={async () => {
              if (!email) {
                toast.error("Enter your email first, then tap reset.");
                return;
              }
              const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
              });
              if (error) toast.error(error.message);
              else setSentReset(true);
            }}
          >
            Forgot password?
          </button>
        </div>
        <Input
          id="signin-password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {sentReset && (
          <p className="text-xs text-success">Check your inbox for the reset link.</p>
        )}
      </div>
      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Sign in
      </Button>
    </form>
  );
}

function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [awaitConfirm, setAwaitConfirm] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name.trim() }, emailRedirectTo: window.location.origin },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setAwaitConfirm(true);
  }

  if (awaitConfirm) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-card p-6 text-center">
        <LogoMark className="mx-auto h-10 w-10" />
        <p className="mt-3 font-display text-lg font-semibold">Confirm your email</p>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a confirmation link to <span className="text-foreground">{email}</span>. Click it
          to activate your account and start your first flow.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Your name</Label>
        <Input
          id="signup-name"
          required
          autoComplete="name"
          placeholder="Alex"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <Button type="submit" variant="hero" size="lg" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Create account
      </Button>
    </form>
  );
}
