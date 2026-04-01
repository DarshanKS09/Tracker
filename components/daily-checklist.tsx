"use client";

import { startTransition, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Check, Droplets } from "lucide-react";
import { formatTaskValue } from "@/utils/constants";
import type { DailyTaskItem } from "@/utils/types";

type DailyChecklistProps = {
  tasks: DailyTaskItem[];
  onTasksChange: (tasks: DailyTaskItem[]) => void;
};

export function DailyChecklist({ tasks, onTasksChange }: DailyChecklistProps) {
  const router = useRouter();
  const [localTasks, setLocalTasks] = useState(tasks);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const updateLocalTask = ({
    taskName,
    completed,
    value
  }: {
    taskName: string;
    completed: boolean;
    value?: number;
  }) => {
    setLocalTasks((currentState) => {
      const nextTasks = currentState.map((task) =>
        task.taskName === taskName
          ? {
              ...task,
              completed,
              value: typeof value === "number" ? value : task.value
            }
          : task
      );

      onTasksChange(nextTasks);
      return nextTasks;
    });
  };

  const persistTask = async ({
    taskName,
    completed,
    value
  }: {
    taskName: string;
    completed: boolean;
    value?: number;
  }) => {
    setErrorMessage(null);

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
      setLocalTasks(tasks);
      startTransition(() => {
        router.refresh();
      });
    }
  };

  const handleUpdate = async ({
    taskName,
    completed,
    value
  }: {
    taskName: string;
    completed: boolean;
    value?: number;
  }) => {
    updateLocalTask({ taskName, completed, value });
    await persistTask({ taskName, completed, value });
  };

  const completedCount = localTasks.filter((task) => task.completed).length;

  return (
    <section className="panel p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Today&apos;s checklist</h2>
          <p className="mt-1 text-sm text-slate-400">
            {completedCount} of {localTasks.length} routines finished
          </p>
        </div>
      </div>

      {errorMessage ? (
        <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-3">
        {localTasks.map((task) => {
          const statusTone = task.completed
            ? "border-emerald-400/30 bg-emerald-400/10"
            : "border-red-400/20 bg-red-400/5";

          return (
            <div
              key={task.taskName}
              className={clsx(
                "rounded-2xl border px-4 py-4 transition-all duration-200 sm:px-5",
                statusTone
              )}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  {task.taskType === "boolean" ? (
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdate({
                          taskName: task.taskName,
                          completed: !task.completed
                        })
                      }
                      className={clsx(
                        "mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border transition-colors duration-200",
                        task.completed
                          ? "border-emerald-300 bg-emerald-400 text-surface-950"
                          : "border-white/20 bg-white/5 text-transparent hover:text-slate-500"
                      )}
                      aria-label={`${task.completed ? "Unmark" : "Mark"} ${task.taskName}`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdate({
                          taskName: task.taskName,
                          value: task.value,
                          completed: !task.completed
                        })
                      }
                      className={clsx(
                        "mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border transition-colors duration-200",
                        task.completed
                          ? "border-emerald-300 bg-emerald-400 text-surface-950"
                          : "border-white/20 bg-white/5 text-transparent hover:text-slate-500"
                      )}
                      aria-label={`${task.completed ? "Reset" : "Complete"} ${task.taskName}`}
                    >
                      {task.taskType === "water" && !task.completed ? (
                        <Droplets className="h-4 w-4 text-sky-300" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                  )}
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
                        : formatTaskValue(task.value, task.unit)}
                    </p>
                  </div>
                </div>

                <div className="flex justify-start sm:justify-end">
                  {task.taskType === "boolean" ? (
                    <div
                      className={clsx(
                        "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em]",
                        task.completed
                          ? "bg-emerald-300/15 text-emerald-200"
                          : "bg-red-300/10 text-red-200"
                      )}
                    >
                      {task.completed ? "Done" : "Open"}
                    </div>
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
              </div>

              {task.taskType !== "boolean" ? (
                <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                        {task.taskType === "water" ? "Water consumed" : "Time tracked"}
                      </p>
                      <p className="mt-1 text-xl font-semibold text-white">
                        {formatTaskValue(task.value, task.unit)}
                      </p>
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-slate-300">
                      {task.completed ? "Checked done" : "Not checked"}
                    </div>
                  </div>

                  <div className="mt-5">
                    <input
                      type="range"
                      min={0}
                      max={task.taskType === "water" ? 5 : 5}
                      step={0.1}
                      value={task.value}
                      onChange={(event) => {
                        const nextValue = Number(event.target.value);
                        updateLocalTask({
                          taskName: task.taskName,
                          value: nextValue,
                          completed: task.completed
                        });
                      }}
                      onMouseUp={(event) => {
                        const nextValue = Number((event.target as HTMLInputElement).value);
                        void persistTask({
                          taskName: task.taskName,
                          value: nextValue,
                          completed: task.completed
                        });
                      }}
                      onTouchEnd={(event) => {
                        const target = event.target as HTMLInputElement;
                        const nextValue = Number(target.value);
                        void persistTask({
                          taskName: task.taskName,
                          value: nextValue,
                          completed: task.completed
                        });
                      }}
                      className="routine-slider h-3 w-full cursor-pointer appearance-none rounded-full bg-transparent"
                      style={{
                        background: `linear-gradient(90deg, #22c55e 0%, #38bdf8 ${(task.value / 5) * 100}%, rgba(255,255,255,0.08) ${(task.value / 5) * 100}%, rgba(255,255,255,0.08) 100%)`
                      }}
                      aria-label={task.taskName}
                    />
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>0</span>
                      <span>2.5 {task.unit}</span>
                      <span>5 {task.unit}</span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .routine-slider::-webkit-slider-runnable-track {
          height: 12px;
          border-radius: 9999px;
          background: transparent;
        }

        .routine-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          margin-top: -6px;
          height: 24px;
          width: 24px;
          border-radius: 9999px;
          border: 2px solid rgba(255, 255, 255, 0.9);
          background: linear-gradient(135deg, #22c55e, #38bdf8);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        }

        .routine-slider::-moz-range-track {
          height: 12px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.08);
        }

        .routine-slider::-moz-range-thumb {
          height: 24px;
          width: 24px;
          border: 2px solid rgba(255, 255, 255, 0.9);
          border-radius: 9999px;
          background: linear-gradient(135deg, #22c55e, #38bdf8);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
        }
      `}</style>
    </section>
  );
}
