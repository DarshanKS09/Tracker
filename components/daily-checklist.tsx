"use client";

import { startTransition, useOptimistic, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Check, LoaderCircle } from "lucide-react";
import type { DailyTaskItem } from "@/utils/types";

type DailyChecklistProps = {
  tasks: DailyTaskItem[];
};

export function DailyChecklist({ tasks }: DailyChecklistProps) {
  const router = useRouter();
  const [pendingTask, setPendingTask] = useState<string | null>(null);
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasks,
    (currentState, update: { taskName: string; completed: boolean }) =>
      currentState.map((task) =>
        task.taskName === update.taskName ? { ...task, completed: update.completed } : task
      )
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleToggle = async (taskName: string, nextValue: boolean) => {
    setPendingTask(taskName);
    setErrorMessage(null);
    setOptimisticTasks({ taskName, completed: nextValue });

    try {
      const response = await fetch("/api/routine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          taskName,
          completed: nextValue
        })
      });

      if (!response.ok) {
        throw new Error("Unable to update task.");
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update task.");
      startTransition(() => {
        router.refresh();
      });
    } finally {
      setPendingTask(null);
    }
  };

  const completedCount = optimisticTasks.filter((task) => task.completed).length;

  return (
    <section className="panel p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Today&apos;s checklist</h2>
          <p className="mt-1 text-sm text-slate-400">
            {completedCount} of {optimisticTasks.length} routines finished
          </p>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-3">
        {optimisticTasks.map((task) => {
          const isPending = pendingTask === task.taskName;

          return (
            <button
              key={task.taskName}
              type="button"
              onClick={() => handleToggle(task.taskName, !task.completed)}
              className={clsx(
                "group flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all duration-200",
                task.completed
                  ? "border-emerald-400/30 bg-emerald-400/10"
                  : "border-red-400/20 bg-red-400/5 hover:border-red-300/30 hover:bg-red-400/10"
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={clsx(
                    "flex h-6 w-6 items-center justify-center rounded-full border transition-colors duration-200",
                    task.completed
                      ? "border-emerald-300 bg-emerald-400 text-surface-950"
                      : "border-white/20 bg-white/5 text-transparent group-hover:text-slate-500"
                  )}
                >
                  <Check className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-white">{task.taskName}</p>
                  <p className={clsx("text-sm", task.completed ? "text-emerald-200/80" : "text-red-200/70")}>
                    {task.completed ? "Done today" : "Missed so far"}
                  </p>
                </div>
              </div>

              {isPending ? (
                <LoaderCircle className="h-4 w-4 animate-spin text-slate-300" />
              ) : (
                <span
                  className={clsx(
                    "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]",
                    task.completed
                      ? "bg-emerald-300/15 text-emerald-200"
                      : "bg-red-300/10 text-red-200"
                  )}
                >
                  {task.completed ? "Done" : "Open"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
