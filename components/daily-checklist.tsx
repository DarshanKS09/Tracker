"use client";

import { startTransition, useOptimistic, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Check, ChevronDown, ChevronUp, Droplets, LoaderCircle } from "lucide-react";
import { formatTaskValue } from "@/utils/constants";
import type { DailyTaskItem } from "@/utils/types";

type DailyChecklistProps = {
  tasks: DailyTaskItem[];
};

export function DailyChecklist({ tasks }: DailyChecklistProps) {
  const router = useRouter();
  const [pendingTask, setPendingTask] = useState<string | null>(null);
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasks,
    (currentState, update: { taskName: string; completed: boolean; value?: number }) =>
      currentState.map((task) =>
        task.taskName === update.taskName
          ? {
              ...task,
              completed: update.completed,
              value: typeof update.value === "number" ? update.value : task.value
            }
          : task
      )
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUpdate = async ({
    taskName,
    completed,
    value
  }: {
    taskName: string;
    completed: boolean;
    value?: number;
  }) => {
    setPendingTask(taskName);
    setErrorMessage(null);
    startTransition(() => {
      setOptimisticTasks({ taskName, completed, value });
    });

    try {
      const response = await fetch("/api/routine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          taskName,
          completed,
          value
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
          const statusTone = task.completed
            ? "border-emerald-400/30 bg-emerald-400/10"
            : "border-red-400/20 bg-red-400/5";

          return (
            <div
              key={task.taskName}
              className={clsx(
                "rounded-2xl border px-4 py-4 transition-all duration-200",
                statusTone
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span
                    className={clsx(
                      "mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border transition-colors duration-200",
                      task.completed
                        ? "border-emerald-300 bg-emerald-400 text-surface-950"
                        : "border-white/20 bg-white/5 text-transparent"
                    )}
                  >
                    {task.taskType === "water" && !task.completed ? (
                      <Droplets className="h-4 w-4 text-sky-300" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                  </span>
                  <div>
                    <p className="font-medium text-white">{task.taskName}</p>
                    <p className="mt-1 text-sm text-slate-300">{task.helperText}</p>
                    <p
                      className={clsx(
                        "mt-2 text-xs uppercase tracking-[0.2em]",
                        task.completed ? "text-emerald-200/80" : "text-red-200/70"
                      )}
                    >
                      {task.taskType === "boolean"
                        ? task.completed
                          ? "Done today"
                          : "Open"
                        : `${formatTaskValue(task.value, task.unit)} / ${formatTaskValue(task.target, task.unit)}`}
                    </p>
                  </div>
                </div>

                {isPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin text-slate-300" />
                ) : task.taskType === "boolean" ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdate({
                        taskName: task.taskName,
                        completed: !task.completed
                      })
                    }
                    className={clsx(
                      "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] transition-colors",
                      task.completed
                        ? "bg-emerald-300/15 text-emerald-200"
                        : "bg-red-300/10 text-red-200"
                    )}
                  >
                    {task.completed ? "Done" : "Mark done"}
                  </button>
                ) : (
                  <div
                    className={clsx(
                      "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]",
                      task.completed
                        ? "bg-emerald-300/15 text-emerald-200"
                        : "bg-red-300/10 text-red-200"
                    )}
                  >
                    {task.completed ? "Goal met" : "In progress"}
                  </div>
                )}
              </div>

              {task.taskType !== "boolean" ? (
                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = task.options.indexOf(task.value);
                      const nextIndex = Math.max(currentIndex - 1, 0);
                      const nextValue = task.options[nextIndex] ?? 0;

                      handleUpdate({
                        taskName: task.taskName,
                        value: nextValue,
                        completed: nextValue >= task.target
                      });
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                    aria-label={`Decrease ${task.taskName}`}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </button>

                  <div className="min-w-[132px] rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {task.taskType === "water" ? "Consumed" : "Selected"}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {formatTaskValue(task.value, task.unit)}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const currentIndex = task.options.indexOf(task.value);
                      const safeIndex = currentIndex === -1 ? 0 : currentIndex;
                      const nextIndex = Math.min(safeIndex + 1, task.options.length - 1);
                      const nextValue = task.options[nextIndex] ?? task.value;

                      handleUpdate({
                        taskName: task.taskName,
                        value: nextValue,
                        completed: nextValue >= task.target
                      });
                    }}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10"
                    aria-label={`Increase ${task.taskName}`}
                  >
                    <ChevronUp className="h-5 w-5" />
                  </button>

                  <div className="ml-auto flex flex-wrap justify-end gap-2">
                    {task.options.map((option) => (
                      <button
                        key={`${task.taskName}-${option}`}
                        type="button"
                        onClick={() =>
                          handleUpdate({
                            taskName: task.taskName,
                            value: option,
                            completed: option >= task.target
                          })
                        }
                        className={clsx(
                          "rounded-full border px-3 py-1.5 text-xs transition",
                          task.value === option
                            ? "border-emerald-300/50 bg-emerald-400/15 text-emerald-100"
                            : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                        )}
                      >
                        {formatTaskValue(option, task.unit)}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
