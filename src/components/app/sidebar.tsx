import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bot,
  CalendarCheck,
  FileBarChart,
  Focus,
  LayoutDashboard,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Target,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/tasks", label: "My Tasks", icon: ListChecks },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/planner", label: "AI Planner", icon: Bot },
  { to: "/focus", label: "Focus Studio", icon: Focus },
  { to: "/habits", label: "Habits", icon: CalendarCheck },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reports", label: "Weekly Reports", icon: FileBarChart },
  { to: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileOpen: (open: boolean) => void;
}

export function AppSidebar({ collapsed, onToggle, mobileOpen, onMobileOpen }: SidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const navList = (onNavigate?: () => void) => (
    <ul className="space-y-1">
      {NAV.map((item) => {
        const active = pathname.startsWith(item.to);
        const link = (
          <Link
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex h-10 items-center rounded-lg text-sm font-medium transition-colors",
              collapsed ? "justify-center px-0" : "gap-3 px-3",
              active
                ? "bg-primary/15 text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <item.icon className={cn("h-4.5 w-4.5 shrink-0", active && "text-primary")} />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </Link>
        );
        return (
          <li key={item.to}>
            {collapsed && !onNavigate ? (
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              link
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <TooltipProvider>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-surface/70 md:flex",
          collapsed ? "w-[68px]" : "w-60",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-border",
            collapsed ? "justify-center" : "px-5",
          )}
        >
          {collapsed ? (
            <LogoMark className="h-7 w-7" />
          ) : (
            <span className="font-display text-lg font-semibold lowercase">focusflow</span>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">{navList()}</nav>
        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn("w-full text-muted-foreground", collapsed && "justify-center")}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
            {!collapsed && <span className="text-xs">Collapse</span>}
          </Button>
        </div>
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpen}>
        <SheetTrigger asChild>
          <button aria-label="Open navigation" className="sr-only" />
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-popover p-0">
          <SheetHeader className="border-b border-border px-5 py-4">
            <SheetTitle className="font-display text-lg font-semibold lowercase">
              focusflow
            </SheetTitle>
          </SheetHeader>
          <nav className="px-3 py-4">
            {navList(() => onMobileOpen(false))}
          </nav>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
}
