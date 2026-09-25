import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  CalendarRange,
  CheckCircle2,
  LayoutDashboard,
  ListChecks,
  Moon,
  Plus,
  Sun,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStudyFlow } from "@/lib/studyflow/store";
import { TaskDialog } from "./TaskDialog";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/planner", label: "Planner", icon: CalendarRange },
  { to: "/progress", label: "Progress", icon: TrendingUp },
] as const;

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

  return (
    <div className="app-backdrop min-h-screen px-3 py-5 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-5xl">
        {/* Brand header */}
        <header className="surface-card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-5 sm:px-8 sm:py-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-soft)]">
              <CheckCircle2 className="size-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-2xl font-semibold leading-none sm:text-3xl">
                StudyFlow
              </p>
              <p className="mt-1 truncate text-xs text-muted-foreground sm:text-sm">
                Study planner & task manager
              </p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="shrink-0 rounded-full"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>

          <nav className="border-t border-border bg-muted/50 px-2 py-2 sm:px-6">
            <ul className="grid grid-cols-4 gap-1 sm:flex sm:justify-center sm:gap-2">
              {nav.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    activeOptions={{ exact: to === "/" }}
                    className="flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground sm:flex-row sm:gap-2 sm:px-4 sm:text-sm"
                    activeProps={{
                      className: "bg-card text-primary shadow-[var(--shadow-soft)] hover:text-primary",
                    }}
                  >
                    <Icon className="size-4" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        {/* Page title + primary action */}
        <div className="mt-8 flex flex-col gap-4 px-1 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <Button onClick={() => setDialogOpen(true)} size="lg" className="shrink-0 rounded-xl">
            <Plus className="size-4" />
            Add Task
          </Button>
        </div>

        <main className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </main>

        <footer className="mt-12 pb-4 text-center text-xs text-muted-foreground">
          StudyFlow · Your tasks and sessions are saved in this browser.
        </footer>
      </div>

      <TaskDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
