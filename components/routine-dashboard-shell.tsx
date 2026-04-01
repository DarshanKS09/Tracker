"use client";

import { useEffect, useState } from "react";
import { DailyChecklist } from "@/components/daily-checklist";
import { DailyProgress } from "@/components/daily-progress";
import { DashboardCharts } from "@/components/dashboard-charts";
import { StatsGrid } from "@/components/stats-grid";
import type { DailyTaskItem, WeeklyChartPoint, WeeklyFeedbackPoint, WeeklySummary } from "@/utils/types";

type RoutineDashboardShellProps = {
  today: string;
  initialTasks: DailyTaskItem[];
  weeklyChartData: WeeklyChartPoint[];
  weeklyFeedback: WeeklyFeedbackPoint[];
  stats: WeeklySummary;
};

export function RoutineDashboardShell({
  today,
  initialTasks,
  weeklyChartData,
  weeklyFeedback,
  stats
}: RoutineDashboardShellProps) {
  const [tasks, setTasks] = useState(initialTasks);
  const [mobileView, setMobileView] = useState<"today" | "charts" | "stats">("today");

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const completedCount = tasks.filter((task) => task.completed).length;
  const percentage = Math.round((completedCount / tasks.length) * 100);

  return (
    <>
      <section className="panel mobile-shell overflow-hidden p-4 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center justify-between lg:hidden">
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-emerald-300/80">
                  Routine mode
                </p>
                <p className="mt-1 text-xs text-slate-400">Built for quick daily check-ins</p>
              </div>
              <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-200">
                {percentage}% done
              </div>
            </div>

            <p className="text-xs uppercase tracking-[0.32em] text-emerald-300/80 sm:text-sm">
              Daily routine system
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:mt-3 sm:text-5xl">
              Routine Tracker
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:mt-4 sm:text-base">
              Keep today moving, see what slipped, and spot patterns across the day without
              wading through clutter.
            </p>
          </div>
          <div className="hidden lg:block">
            <DailyProgress
              completedCount={completedCount}
              percentage={percentage}
              totalTasks={tasks.length}
            />
          </div>
        </div>

        <div className="mt-4 lg:hidden">
          <DailyProgress
            completedCount={completedCount}
            percentage={percentage}
            totalTasks={tasks.length}
          />
        </div>
      </section>

      <div className="mobile-nav lg:hidden">
        <button
          type="button"
          onClick={() => setMobileView("today")}
          className={mobileView === "today" ? "mobile-nav-item active" : "mobile-nav-item"}
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => setMobileView("charts")}
          className={mobileView === "charts" ? "mobile-nav-item active" : "mobile-nav-item"}
        >
          Charts
        </button>
        <button
          type="button"
          onClick={() => setMobileView("stats")}
          className={mobileView === "stats" ? "mobile-nav-item active" : "mobile-nav-item"}
        >
          Stats
        </button>
      </div>

      <section className="hidden gap-6 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        <DailyChecklist tasks={tasks} onTasksChange={setTasks} />
        <DashboardCharts
          tasks={tasks}
          today={today}
          weeklyChartData={weeklyChartData}
          weeklyFeedback={weeklyFeedback}
        />
      </section>

      <section className="lg:hidden">
        {mobileView === "today" ? (
          <DailyChecklist tasks={tasks} onTasksChange={setTasks} />
        ) : null}
        {mobileView === "charts" ? (
          <DashboardCharts
            tasks={tasks}
            today={today}
            weeklyChartData={weeklyChartData}
            weeklyFeedback={weeklyFeedback}
          />
        ) : null}
        {mobileView === "stats" ? <StatsGrid stats={stats} compact /> : null}
      </section>

      <section className="hidden lg:block">
        <StatsGrid stats={stats} />
      </section>
    </>
  );
}
