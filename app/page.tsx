import { DailyChecklist } from "@/components/daily-checklist";
import { DailyProgress } from "@/components/daily-progress";
import { DashboardCharts } from "@/components/dashboard-charts";
import { StatsGrid } from "@/components/stats-grid";
import { getRoutinePageData } from "@/utils/routine-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getRoutinePageData();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
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
              Keep today moving, see what slipped, and spot patterns across the week without
              wading through clutter.
            </p>
          </div>
          <DailyProgress
            completedCount={data.daily.completedCount}
            percentage={data.daily.percentage}
            totalTasks={data.daily.totalTasks}
          />
        </div>
      </section>

      <StatsGrid stats={data.weekly.summary} />

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <DailyChecklist tasks={data.daily.tasks} />
        <DashboardCharts chartData={data.weekly.chartData} />
      </section>
    </main>
  );
}
