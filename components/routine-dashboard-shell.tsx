"use client";

import { startTransition, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { DailyChecklist } from "@/components/daily-checklist";
import { DailyProgress } from "@/components/daily-progress";
import { DashboardCharts } from "@/components/dashboard-charts";
import { ProfileEntryButton } from "@/components/profile-entry-button";
import { StatsGrid } from "@/components/stats-grid";
import { formatFullDate, getDateString } from "@/utils/date";
import type {
  DailyTaskItem,
  RoutineSettings,
  WeeklyChartPoint,
  WeeklyFeedbackPoint,
  WeeklySummary
} from "@/utils/types";

type RoutineDashboardShellProps = {
  today: string;
  selectedDate: string;
  initialTasks: DailyTaskItem[];
  weeklyChartData: WeeklyChartPoint[];
  weeklyFeedback: WeeklyFeedbackPoint[];
  stats: WeeklySummary;
  settings: RoutineSettings;
};

export function RoutineDashboardShell({
  today,
  selectedDate,
  initialTasks,
  weeklyChartData,
  weeklyFeedback,
  stats,
  settings
}: RoutineDashboardShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState(initialTasks);
  const [mobileView, setMobileView] = useState<"today" | "charts" | "stats">("today");
  const [maxSelectableDate, setMaxSelectableDate] = useState(today);
  const [displayDate, setDisplayDate] = useState(selectedDate);
  const [isDatePending, startDateTransition] = useTransition();

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  useEffect(() => {
    setDisplayDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    setMaxSelectableDate(getDateString(new Date()));
  }, []);

  useEffect(() => {
    if (selectedDate !== getDateString()) {
      return;
    }

    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const timeout = window.setTimeout(() => {
      const nextDate = getDateString(new Date());
      const params = new URLSearchParams(searchParams.toString());
      params.set("date", nextDate);
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, nextMidnight.getTime() - now.getTime() + 250);

    return () => window.clearTimeout(timeout);
  }, [pathname, router, searchParams, selectedDate]);

  const updateSelectedDate = (nextDate: string) => {
    setDisplayDate(nextDate);
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", nextDate);
    const href = `${pathname}?${params.toString()}`;
    router.prefetch(href);
    startDateTransition(() => {
      router.replace(href, { scroll: false });
    });
  };

  const completedCount = tasks.filter((task) => task.completed).length;
  const percentage = Math.round((completedCount / tasks.length) * 100);

  return (
    <>
      <section className="panel mobile-shell overflow-hidden p-4 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center justify-between lg:hidden">
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-emerald-300/80">
                  Routine mode
                </p>
                <p className="mt-1 text-xs text-slate-400">Built for quick daily check-ins</p>
              </div>
              <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-200">
                {isDatePending ? "Loading" : `${percentage}% done`}
              </div>
            </div>

            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Active day</p>
                <p className="mt-1 text-sm font-medium text-white">{formatFullDate(displayDate)}</p>
              </div>
              <div className="flex items-center gap-2">
                <label
                  className={`flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200 transition ${
                    isDatePending ? "opacity-70" : ""
                  }`}
                >
                  <CalendarDays className="h-4 w-4 text-cyan-300" />
                  <input
                    type="date"
                    value={displayDate}
                    max={maxSelectableDate}
                    onChange={(event) => updateSelectedDate(event.target.value)}
                    className="bg-transparent text-sm text-slate-100 outline-none [&::-webkit-calendar-picker-indicator]:opacity-70"
                    aria-label="Select routine date"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => updateSelectedDate(today)}
                  disabled={displayDate === today && isDatePending}
                  className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-emerald-200 transition hover:bg-emerald-400/15 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Today
                </button>
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
          <div className="flex flex-col items-stretch gap-3 lg:items-end">
            <div className="self-end">
              <ProfileEntryButton settings={settings} />
            </div>
            <div className="hidden lg:block">
              <DailyProgress
                completedCount={completedCount}
                percentage={percentage}
                totalTasks={tasks.length}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:hidden">
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
        <DailyChecklist activeDate={selectedDate} tasks={tasks} onTasksChange={setTasks} />
        <DashboardCharts
          tasks={tasks}
          today={selectedDate}
          weeklyChartData={weeklyChartData}
          weeklyFeedback={weeklyFeedback}
        />
      </section>

      <section className="lg:hidden">
        {mobileView === "today" ? (
          <DailyChecklist activeDate={selectedDate} tasks={tasks} onTasksChange={setTasks} />
        ) : null}
        {mobileView === "charts" ? (
          <DashboardCharts
            tasks={tasks}
            today={selectedDate}
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
