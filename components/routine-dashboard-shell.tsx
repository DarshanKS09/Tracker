"use client";

import { useEffect, useState } from "react";
import { DailyChecklist } from "@/components/daily-checklist";
import { DailyProgress } from "@/components/daily-progress";
import { DashboardCharts } from "@/components/dashboard-charts";
import type { DailyTaskItem } from "@/utils/types";

type RoutineDashboardShellProps = {
  initialTasks: DailyTaskItem[];
};

export function RoutineDashboardShell({ initialTasks }: RoutineDashboardShellProps) {
  const [tasks, setTasks] = useState(initialTasks);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const percentage = Math.round((completedCount / tasks.length) * 100);

  return (
    <>
      <section className="panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.32em] text-emerald-300/80">
              Daily routine system
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Routine Tracker
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Keep today moving, see what slipped, and spot patterns across the day without
              wading through clutter.
            </p>
          </div>
          <DailyProgress
            completedCount={completedCount}
            percentage={percentage}
            totalTasks={tasks.length}
          />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <DailyChecklist tasks={tasks} onTasksChange={setTasks} />
        <DashboardCharts tasks={tasks} />
      </section>
    </>
  );
}
