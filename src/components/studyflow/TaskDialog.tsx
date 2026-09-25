import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useStudyFlow, type Priority, type Task } from "@/lib/studyflow/store";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
};

const empty = { title: "", subject: "", description: "", dueDate: "", priority: "Medium" as Priority };

export function TaskDialog({ open, onOpenChange, task }: Props) {
  const { addTask, updateTask, tasks } = useStudyFlow();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState<{
    title?: string;
    subject?: string;
    dueDate?: string;
  }>({});



  const subjects = Array.from(new Set(tasks.map((t) => t.subject))).sort();

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm(
      task
        ? {
            title: task.title,
            subject: task.subject,
            description: task.description,
            dueDate: task.dueDate,
            priority: task.priority,
          }
        : empty,
    );
  }, [open, task]);

  function submit() {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = "Please enter a task title.";
    if (!form.subject.trim()) next.subject = "Please enter a subject.";
    if (!form.dueDate) next.dueDate = "Please choose a due date.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const payload = {
      title: form.title.trim(),
      subject: form.subject.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate,
      priority: form.priority,
    };

    if (task) {
      updateTask(task.id, payload);
      toast.success("Task updated");
    } else {
      addTask(payload);
      toast.success("Task added");
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "Add task"}</DialogTitle>
          <DialogDescription>
            Keep your coursework organised by subject, due date and priority.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Task title</Label>
            <Input
              id="title"
              value={form.title}
              placeholder="e.g. Finish statistics assignment"
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                list="subject-suggestions"
                value={form.subject}
                placeholder="e.g. Mathematics"
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
              <datalist id="subject-suggestions">
                {subjects.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
              {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
              {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Priority</Label>
            <Select
              value={form.priority}
              onValueChange={(v) => setForm({ ...form, priority: v as Priority })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description}
              placeholder="Optional notes, chapters, page numbers…"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>{task ? "Save changes" : "Add task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
