import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      {/* Two flowing curves: focus + motion */}
      <path
        d="M6 24C6 13 13 6 24 6"
        stroke="var(--color-primary)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M6 24C14 24 20 18 20 10"
        stroke="var(--color-violet-deep)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="24" cy="6" r="3" fill="var(--color-lavender)" />
    </svg>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className={markClassName} />
      <span className="font-display text-lg font-semibold lowercase tracking-tight text-foreground">
        focusflow
      </span>
    </span>
  );
}
