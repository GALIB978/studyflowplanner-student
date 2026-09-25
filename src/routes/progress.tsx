import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/studyflow/AppShell";
import { Progress } from "@/components/ui/progress";
import { useStudyFlow } from "@/lib/studyflow/store";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — StudyFlow Study Planner" },
      {
        name: "description",
        content:
          "Visualise how much of your coursework is finished overall and subject by subject with progress bars and charts.",
      },
      { property: "og:title", content: "Progress — StudyFlow Study Planner" },
      {
        property: "og:description",
        content: "Overall and per-subject completion for all of your study tasks.",
      },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { tasks } = useStudyFlow();

  const overall = tasks.length === 0 ? 0 : Math.round((tasks.filter((t) => t.completed).length / tasks.length) * 100);

  const bySubject = useMemo(() => {
    const map = new Map<string, { subject: string; total: number; done: number }>();
    for (const t of tasks) {
      const row = map.get(t.subject) ?? { subject: t.subject, total: 0, done: 0 };
      row.total += 1;
      if (t.completed) row.done += 1;
      map.set(t.subject, row);
    }
    return Array.from(map.values())
      .map((r) => ({ ...r, percent: Math.round((r.done / r.total) * 100) }))
      .sort((a, b) => b.percent - a.percent);
  }, [tasks]);

  const byPriority = useMemo(() => {
    return (["High", "Medium", "Low"] as const).map((p) => {
      const list = tasks.filter((t) => t.priority === p);
      return {
        priority: p,
        pending: list.filter((t) => !t.completed).length,
        completed: list.filter((t) => t.completed).length,
      };
    });
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <AppShell title="Progress" subtitle="Your completion overview">
        <div className="surface-card p-10 text-center">
          <p className="font-sans font-semibold">No progress to show yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first task and your progress will appear here.
          </p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Progress" subtitle="Your completion overview">
      <section className="surface-card p-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-sans text-base font-semibold">Overall completion</h2>
            <p className="text-sm text-muted-foreground">
              {tasks.filter((t) => t.completed).length} of {tasks.length} tasks completed
            </p>
          </div>
          <span className="font-display text-4xl font-semibold text-primary">{overall}%</span>
        </div>
        <Progress value={overall} className="mt-4" />
      </section>

      <section className="surface-card mt-6 p-6">
        <h2 className="font-sans text-base font-semibold">Progress by subject</h2>
        <div className="mt-4 grid gap-4">
          {bySubject.map((row) => (
            <div key={row.subject}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{row.subject}</span>
                <span className="text-muted-foreground">
                  {row.done}/{row.total} · {row.percent}%
                </span>
              </div>
              <Progress value={row.percent} className="mt-2" />
            </div>
          ))}
        </div>
      </section>

      <section className="surface-card mt-6 p-6">
        <h2 className="font-sans text-base font-semibold">Pending work by priority</h2>
        <div className="mt-4 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byPriority}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="priority" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "0.75rem",
                  color: "var(--popover-foreground)",
                }}
              />
              <Bar dataKey="pending" name="Pending" radius={[8, 8, 0, 0]}>
                {byPriority.map((row) => (
                  <Cell
                    key={row.priority}
                    fill={
                      row.priority === "High"
                        ? "var(--destructive)"
                        : row.priority === "Medium"
                          ? "var(--warning)"
                          : "var(--primary)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </AppShell>
  );
}
