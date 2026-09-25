import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  CalendarRange,
  CheckCircle2,
  LayoutDashboard,
  ListChecks,
  Menu,
  Moon,
  Plus,
  Sun,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useStudyFlow } from "@/lib/studyflow/store";
import { TaskDialog } from "./TaskDialog";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/planner", label: "Study Planner", icon: CalendarRange },
  { to: "/progress", label: "Progress", icon: TrendingUp },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="grid gap-1">
      {nav.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          activeProps={{
            className: "bg-sidebar-primary/10 text-sidebar-primary hover:bg-sidebar-primary/15",
          }}
        >
          <Icon className="size-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
        <CheckCircle2 className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-base font-semibold">StudyFlow</span>
        <span className="block text-xs text-muted-foreground">Study Planner</span>
      </span>
    </div>
  );
}

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { theme, toggleTheme } = useStudyFlow();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col lg:gap-6 lg:p-5">
        <Brand />
        <NavLinks />
        <div className="mt-auto rounded-xl bg-sidebar-accent/60 p-4 text-xs text-muted-foreground">
          Your tasks and study sessions are saved in this browser, so they stay after a refresh.
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-5">
              <div className="mb-6">
                <Brand />
              </div>
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold sm:text-xl">{title}</h1>
            {subtitle && (
              <p className="hidden truncate text-sm text-muted-foreground sm:block">{subtitle}</p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="shrink-0"
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
          <Button onClick={() => setDialogOpen(true)} className="shrink-0">
            <Plus className="size-4" />
            <span className={cn("hidden sm:inline")}>Add Task</span>
          </Button>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
