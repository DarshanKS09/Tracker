import { RoutineDashboardShell } from "@/components/routine-dashboard-shell";
import { getRoutinePageData } from "@/utils/routine-data";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams
}: {
  searchParams?: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const data = await getRoutinePageData(params?.date);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-8 lg:px-8">
      <RoutineDashboardShell
        today={data.today}
        selectedDate={data.selectedDate}
        initialTasks={data.daily.tasks}
        weeklyChartData={data.weekly.chartData}
        weeklyFeedback={data.weekly.feedback}
        stats={data.weekly.summary}
        settings={data.settings}
      />
    </main>
  );
}
