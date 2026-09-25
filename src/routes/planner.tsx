import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/studyflow/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, useStudyFlow } from "@/lib/studyflow/store";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Study Planner — StudyFlow" },
      {
        name: "description",
        content:
          "Plan a weekly study schedule with subject, date, start and end time, and the topic for each session.",
      },
      { property: "og:title", content: "Study Planner — StudyFlow" },
      {
        property: "og:description",
        content: "Build your weekly study schedule session by session.",
      },
    ],
  }),
  component: PlannerPage,
});

function startOfWeek(offsetWeeks = 0) {
  const d = new Date();
  const day = (d.getDay() + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - day + offsetWeeks * 7);
  return d;
}

const emptyForm = { subject: "", date: "", start: "", end: "", topic: "" };

function PlannerPage() {
  const { sessions, addSession, deleteSession } = useStudyFlow();
  const [weekOffset, setWeekOffset] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const days = useMemo(() => {
    const base = startOfWeek(weekOffset);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d.toISOString().slice(0, 10);
    });
  }, [weekOffset]);

  function submit() {
    const next: Record<string, string> = {};
    if (!form.subject.trim()) next.subject = "Subject is required.";
    if (!form.date) next.date = "Date is required.";
    if (!form.start) next.start = "Start time is required.";
    if (!form.end) next.end = "End time is required.";
    if (form.start && form.end && form.end <= form.start) next.end = "End must be after start.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    addSession({
      subject: form.subject.trim(),
      date: form.date,
      start: form.start,
      end: form.end,
      topic: form.topic.trim() || "Study session",
    });
    setForm(emptyForm);
    toast.success("Study session added");
  }

  return (
    <AppShell title="Study Planner" subtitle="Your weekly study schedule">
      <section className="surface-card p-5">
        <h2 className="font-sans text-base font-semibold">Add a study session</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="grid gap-2">
            <Label htmlFor="s-subject">Subject</Label>
            <Input
              id="s-subject"
              value={form.subject}
              placeholder="e.g. Physics"
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />
            {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-date">Date</Label>
            <Input
              id="s-date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-start">Start</Label>
            <Input
              id="s-start"
              type="time"
              value={form.start}
              onChange={(e) => setForm({ ...form, start: e.target.value })}
            />
            {errors.start && <p className="text-xs text-destructive">{errors.start}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-end">End</Label>
            <Input
              id="s-end"
              type="time"
              value={form.end}
              onChange={(e) => setForm({ ...form, end: e.target.value })}
            />
            {errors.end && <p className="text-xs text-destructive">{errors.end}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-topic">Topic</Label>
            <Input
              id="s-topic"
              value={form.topic}
              placeholder="e.g. Kinematics recap"
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
            />
          </div>
        </div>
        <Button className="mt-4" onClick={submit}>
          <Plus className="size-4" />
          Add session
        </Button>
      </section>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {weekOffset === 0 ? "This week" : weekOffset > 0 ? "Upcoming week" : "Previous week"}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setWeekOffset((w) => w - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset(0)}>
            Today
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekOffset((w) => w + 1)}>
            Next
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {days.map((day) => {
          const list = sessions
            .filter((s) => s.date === day)
            .sort((a, b) => a.start.localeCompare(b.start));
          return (
            <div key={day} className="surface-card p-4">
              <p className="text-sm font-semibold">{formatDate(day)}</p>
              {list.length === 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">No sessions planned.</p>
              ) : (
                <ul className="mt-3 grid gap-2">
                  {list.map((s) => (
                    <li key={s.id} className="rounded-lg bg-secondary/70 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{s.subject}</p>
                          <p className="truncate text-xs text-muted-foreground">{s.topic}</p>
                          <p className="mt-1 text-xs font-medium text-primary">
                            {s.start} – {s.end}
                          </p>
                        </div>
                        <button
                          aria-label="Delete session"
                          onClick={() => {
                            deleteSession(s.id);
                            toast.success("Session removed");
                          }}
                          className="text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
