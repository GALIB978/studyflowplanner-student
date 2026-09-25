import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/studyflow/AppShell";
import { TaskCard } from "@/components/studyflow/TaskCard";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { priorityRank, useStudyFlow } from "@/lib/studyflow/store";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — StudyFlow Study Planner" },
      {
        name: "description",
        content:
          "Browse, filter and sort every study task by subject, priority and status, and mark work as completed.",
      },
      { property: "og:title", content: "Tasks — StudyFlow Study Planner" },
      {
        property: "og:description",
        content: "Filter by subject, priority or status and sort by due date or priority.",
      },
    ],
  }),
  component: TasksPage,
});

function TasksPage() {
  const { tasks } = useStudyFlow();
  const [subject, setSubject] = useState("all");
  const [priority, setPriority] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("dueDate");

  const subjects = useMemo(
    () => Array.from(new Set(tasks.map((t) => t.subject))).sort(),
    [tasks],
  );

  const visible = useMemo(() => {
    return tasks
      .filter((t) => (subject === "all" ? true : t.subject === subject))
      .filter((t) => (priority === "all" ? true : t.priority === priority))
      .filter((t) =>
        status === "all" ? true : status === "completed" ? t.completed : !t.completed,
      )
      .sort((a, b) =>
        sort === "priority"
          ? priorityRank[a.priority] - priorityRank[b.priority] ||
            a.dueDate.localeCompare(b.dueDate)
          : a.dueDate.localeCompare(b.dueDate),
      );
  }, [tasks, subject, priority, status, sort]);

  return (
    <AppShell title="Tasks" subtitle={`${visible.length} of ${tasks.length} tasks shown`}>
      <section className="surface-card grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="grid gap-2">
          <Label>Subject</Label>
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subjects</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Priority</Label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Sort by</Label>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Due date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {visible.length === 0 ? (
        <div className="surface-card mt-6 p-10 text-center">
          <p className="font-sans font-semibold">No tasks to show</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try changing the filters, or add a new task with the button in the top bar.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {visible.map((t) => (
            <TaskCard key={t.id} task={t} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
