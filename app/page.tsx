import { RoutineDashboardShell } from "@/components/routine-dashboard-shell";
import { StatsGrid } from "@/components/stats-grid";
import { getRoutinePageData } from "@/utils/routine-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getRoutinePageData();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <RoutineDashboardShell
        initialTasks={data.daily.tasks}
      />

      <StatsGrid stats={data.weekly.summary} />
    </main>
  );
}
