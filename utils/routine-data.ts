import { createSupabaseServerClient } from "@/lib/supabase";
import { ROUTINE_TASKS } from "@/utils/constants";
import { getDateString, getLastNDates } from "@/utils/date";
import { buildDailyTasks, buildWeeklyChartData, buildWeeklySummary } from "@/utils/routine-analytics";
import type { RoutineLog } from "@/utils/types";

export async function getRoutinePageData() {
  const supabase = createSupabaseServerClient();
  const today = getDateString();
  const lastSevenDates = getLastNDates(7);

  const [{ data: todayLogs, error: todayError }, { data: weekLogs, error: weekError }] = await Promise.all([
    supabase
      .from("routine_logs")
      .select("id, date, task_name, completed, created_at")
      .eq("date", today)
      .order("created_at", { ascending: false }),
    supabase
      .from("routine_logs")
      .select("id, date, task_name, completed, created_at")
      .gte("date", lastSevenDates[0])
      .lte("date", lastSevenDates[lastSevenDates.length - 1])
      .order("date", { ascending: true })
  ]);

  if (todayError) {
    throw new Error(todayError.message);
  }

  if (weekError) {
    throw new Error(weekError.message);
  }

  const dailyTasks = buildDailyTasks((todayLogs ?? []) as RoutineLog[], ROUTINE_TASKS);
  const completedCount = dailyTasks.filter((task) => task.completed).length;
  const percentage = Math.round((completedCount / ROUTINE_TASKS.length) * 100);

  const chartData = buildWeeklyChartData((weekLogs ?? []) as RoutineLog[], lastSevenDates, ROUTINE_TASKS.length);
  const summary = buildWeeklySummary(chartData, ROUTINE_TASKS.length);

  return {
    daily: {
      tasks: dailyTasks,
      completedCount,
      totalTasks: ROUTINE_TASKS.length,
      percentage
    },
    weekly: {
      chartData,
      summary
    }
  };
}
