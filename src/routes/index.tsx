import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock, ListChecks, Target } from "lucide-react";
import { AppShell } from "@/components/studyflow/AppShell";
import { TaskCard } from "@/components/studyflow/TaskCard";
import { Progress } from "@/components/ui/progress";
import { formatDate, todayISO, useStudyFlow } from "@/lib/studyflow/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — StudyFlow Study Planner" },
      {
        name: "description",
        content:
          "See your study overview at a glance: total tasks, completed work, pending work and everything due today.",
      },
      { property: "og:title", content: "Dashboard — StudyFlow Study Planner" },
      {
        property: "og:description",
        content: "Track tasks, plan study sessions and follow your progress with StudyFlow.",
      },
    ],
  }),
  component: Dashboard,
});

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: typeof ListChecks;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Dashboard() {
  const { tasks, sessions } = useStudyFlow();
  const today = todayISO();

  const completed = tasks.filter((t) => t.completed).length;
  const pending = tasks.length - completed;
  const percent = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);
  const todaysTasks = tasks.filter((t) => t.dueDate === today);
  const todaysSessions = sessions
    .filter((s) => s.date === today)
    .sort((a, b) => a.start.localeCompare(b.start));

  return (
    <AppShell title="Welcome back" subtitle={`Today is ${formatDate(today)} · here is your study overview`}>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total tasks" value={tasks.length} icon={ListChecks} />
        <StatCard label="Completed" value={completed} icon={CheckCircle2} />
        <StatCard label="Pending" value={pending} icon={Clock} />
        <StatCard label="Completion" value={`${percent}%`} icon={Target} />
      </div>

      <section className="surface-card mt-6 p-5">
        <div className="flex items-center justify-between text-sm">
          <h2 className="font-sans font-semibold">Overall completion</h2>
          <span className="text-muted-foreground">
            {completed} of {tasks.length} tasks done
          </span>
        </div>
        <Progress value={percent} className="mt-3" />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Today's tasks</h2>
            <Link to="/tasks" className="text-sm font-medium text-primary hover:underline">
              View all
            </Link>
          </div>
          {todaysTasks.length === 0 ? (
            <div className="surface-card p-8 text-center text-sm text-muted-foreground">
              Nothing due today. A good moment to get ahead on upcoming work.
            </div>
          ) : (
            <div className="grid gap-3">
              {todaysTasks.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Today's study sessions</h2>
          {todaysSessions.length === 0 ? (
            <div className="surface-card p-8 text-center text-sm text-muted-foreground">
              No sessions planned for today.
            </div>
          ) : (
            <div className="grid gap-3">
              {todaysSessions.map((s) => (
                <div key={s.id} className="surface-card p-4">
                  <p className="text-sm font-semibold">{s.subject}</p>
                  <p className="text-sm text-muted-foreground">{s.topic}</p>
                  <p className="mt-2 text-xs font-medium text-primary">
                    {s.start} – {s.end}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
