import { connectToDatabase } from "@/lib/mongodb";
import { RoutineLog as RoutineLogModel } from "@/models/routine-log";
import { ROUTINE_TASKS } from "@/utils/constants";
import { getDateString, getLastNDates } from "@/utils/date";
import { buildDailyTasks, buildWeeklyChartData, buildWeeklySummary } from "@/utils/routine-analytics";
import type { RoutineLog } from "@/utils/types";

export async function getRoutinePageData() {
  const today = getDateString();
  const lastSevenDates = getLastNDates(7);
  await connectToDatabase();

  const [todayLogsRaw, weekLogsRaw] = await Promise.all([
    RoutineLogModel.find({ date: today }).sort({ createdAt: -1 }).lean(),
    RoutineLogModel.find({
      date: {
        $gte: lastSevenDates[0],
        $lte: lastSevenDates[lastSevenDates.length - 1]
      }
    })
      .sort({ date: 1, createdAt: 1 })
      .lean()
  ]);

  const todayLogs = serializeRoutineLogs(todayLogsRaw);
  const weekLogs = serializeRoutineLogs(weekLogsRaw);

  const dailyTasks = buildDailyTasks(todayLogs);
  const completedCount = dailyTasks.filter((task) => task.completed).length;
  const percentage = Math.round((completedCount / ROUTINE_TASKS.length) * 100);

  const chartData = buildWeeklyChartData(weekLogs, lastSevenDates, ROUTINE_TASKS.length);
  const summary = buildWeeklySummary(chartData);

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

function serializeRoutineLogs(logs: Array<Record<string, unknown>>): RoutineLog[] {
  return logs.map((log) => ({
    id: String(log._id),
    date: String(log.date),
    taskName: String(log.taskName),
    completed: Boolean(log.completed),
    value: typeof log.value === "number" ? log.value : null,
    createdAt: new Date(String(log.createdAt)).toISOString()
  }));
}
