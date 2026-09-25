import { useState } from "react";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { formatDate, todayISO, useStudyFlow, type Task } from "@/lib/studyflow/store";
import { TaskDialog } from "./TaskDialog";
import { cn } from "@/lib/utils";

const priorityStyle: Record<Task["priority"], string> = {
  High: "bg-destructive/12 text-destructive",
  Medium: "bg-warning/18 text-warning-foreground dark:text-warning",
  Low: "bg-primary/12 text-primary",
};

export function TaskCard({ task }: { task: Task }) {
  const { toggleTask, deleteTask } = useStudyFlow();
  const [editing, setEditing] = useState(false);
  const overdue = !task.completed && task.dueDate < todayISO();

  return (
    <article className="surface-card surface-card-hover p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => toggleTask(task.id)}
          aria-label={task.completed ? "Mark as pending" : "Mark as completed"}
          className="mt-1"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={cn(
                "font-sans text-base font-semibold",
                task.completed && "text-muted-foreground line-through",
              )}
            >
              {task.title}
            </h3>
            <Badge variant="secondary" className="font-normal">
              {task.subject}
            </Badge>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium",
                priorityStyle[task.priority],
              )}
            >
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" />
              {formatDate(task.dueDate)}
            </span>
            <span
              className={cn(
                "font-medium",
                task.completed ? "text-success" : overdue ? "text-destructive" : "text-primary",
              )}
            >
              {task.completed ? "Completed" : overdue ? "Overdue" : "Pending"}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 gap-1">
          <Button variant="ghost" size="icon" aria-label="Edit task" onClick={() => setEditing(true)}>
            <Pencil className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete task"
            onClick={() => {
              deleteTask(task.id);
              toast.success("Task deleted");
            }}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      </div>

      <TaskDialog open={editing} onOpenChange={setEditing} task={task} />
    </article>
  );
}
