import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Priority = "High" | "Medium" | "Low";

export type Task = {
  id: string;
  title: string;
  subject: string;
  description: string;
  dueDate: string; // yyyy-mm-dd
  priority: Priority;
  completed: boolean;
  createdAt: string;
};

export type Session = {
  id: string;
  subject: string;
  date: string; // yyyy-mm-dd
  start: string; // HH:mm
  end: string; // HH:mm
  topic: string;
};

const TASKS_KEY = "studyflow.tasks.v1";
const SESSIONS_KEY = "studyflow.sessions.v1";
const THEME_KEY = "studyflow.theme.v1";

const uid = () => Math.random().toString(36).slice(2, 10);

function iso(offsetDays: number) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function sampleTasks(): Task[] {
  return [
    {
      id: uid(),
      title: "Finish linear algebra problem set",
      subject: "Mathematics",
      description: "Chapter 4: eigenvalues and eigenvectors, exercises 1–12.",
      dueDate: iso(0),
      priority: "High",
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      title: "Read chapter on memory models",
      subject: "Psychology",
      description: "Summarise working memory vs long-term memory.",
      dueDate: iso(0),
      priority: "Medium",
      completed: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      title: "Prepare lab report draft",
      subject: "Physics",
      description: "Include measurement uncertainty and graphs.",
      dueDate: iso(2),
      priority: "High",
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      title: "Practice vocabulary set 12",
      subject: "Spanish",
      description: "40 new words, use flashcards.",
      dueDate: iso(3),
      priority: "Low",
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      title: "Group project: slide deck outline",
      subject: "Computer Science",
      description: "Split sections with the team and draft the intro.",
      dueDate: iso(5),
      priority: "Medium",
      completed: false,
      createdAt: new Date().toISOString(),
    },
    {
      id: uid(),
      title: "Review last week's lecture notes",
      subject: "Mathematics",
      description: "Rewrite proofs in own words.",
      dueDate: iso(-1),
      priority: "Low",
      completed: true,
      createdAt: new Date().toISOString(),
    },
  ];
}

function sampleSessions(): Session[] {
  return [
    { id: uid(), subject: "Mathematics", date: iso(0), start: "09:00", end: "10:30", topic: "Eigenvalues" },
    { id: uid(), subject: "Physics", date: iso(0), start: "13:00", end: "14:00", topic: "Lab report writing" },
    { id: uid(), subject: "Spanish", date: iso(1), start: "18:00", end: "19:00", topic: "Vocabulary drill" },
    { id: uid(), subject: "Computer Science", date: iso(2), start: "10:00", end: "12:00", topic: "Algorithms recap" },
    { id: uid(), subject: "Psychology", date: iso(4), start: "15:30", end: "16:30", topic: "Memory models" },
  ];
}

type Ctx = {
  ready: boolean;
  tasks: Task[];
  sessions: Session[];
  theme: "light" | "dark";
  toggleTheme: () => void;
  addTask: (t: Omit<Task, "id" | "completed" | "createdAt">) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  addSession: (s: Omit<Session, "id">) => void;
  deleteSession: (id: string) => void;
};

const StudyFlowContext = createContext<Ctx | null>(null);

export function StudyFlowProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const rawTasks = localStorage.getItem(TASKS_KEY);
      setTasks(rawTasks ? (JSON.parse(rawTasks) as Task[]) : sampleTasks());
      const rawSessions = localStorage.getItem(SESSIONS_KEY);
      setSessions(rawSessions ? (JSON.parse(rawSessions) as Session[]) : sampleSessions());
      const storedTheme = localStorage.getItem(THEME_KEY);
      setTheme(storedTheme === "dark" ? "dark" : "light");
    } catch {
      setTasks(sampleTasks());
      setSessions(sampleSessions());
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  }, [tasks, ready]);

  useEffect(() => {
    if (ready) localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, ready]);

  const value = useMemo<Ctx>(
    () => ({
      ready,
      tasks,
      sessions,
      theme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
      addTask: (t) =>
        setTasks((prev) => [
          { ...t, id: uid(), completed: false, createdAt: new Date().toISOString() },
          ...prev,
        ]),
      updateTask: (id, patch) =>
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t))),
      toggleTask: (id) =>
        setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))),
      deleteTask: (id) => setTasks((prev) => prev.filter((t) => t.id !== id)),
      addSession: (s) => setSessions((prev) => [...prev, { ...s, id: uid() }]),
      deleteSession: (id) => setSessions((prev) => prev.filter((s) => s.id !== id)),
    }),
    [ready, tasks, sessions, theme],
  );

  return <StudyFlowContext.Provider value={value}>{children}</StudyFlowContext.Provider>;
}

export function useStudyFlow() {
  const ctx = useContext(StudyFlowContext);
  if (!ctx) throw new Error("useStudyFlow must be used inside StudyFlowProvider");
  return ctx;
}

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const priorityRank: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };

export function formatDate(d: string) {
  const date = new Date(`${d}T00:00:00`);
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}
