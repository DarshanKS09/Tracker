import { connectToDatabase } from "@/lib/mongodb";
import { RoutineLog as RoutineLogModel } from "@/models/routine-log";
import { DEFAULT_ROUTINE_SETTINGS } from "@/utils/constants";
import { RoutineSettingsModel } from "@/models/routine-settings";
import { getCurrentWeekDatesStartingSunday, getDateString, isValidDateString } from "@/utils/date";
import {
  buildDailyTasks,
  buildWeeklyChartData,
  buildWeeklyFeedback,
  buildWeeklySummary,
  buildWeeklyTaskTable
} from "@/utils/routine-analytics";
import type { RoutineLog, RoutineSettings } from "@/utils/types";

export async function getRoutinePageData(selectedDateParam?: string) {
  const today = getDateString();
  const selectedDate: string = isValidDateString(selectedDateParam) ? selectedDateParam! : today;
  const lastSevenDates = getCurrentWeekDatesStartingSunday(new Date(`${selectedDate}T00:00:00`));
  await connectToDatabase();
  const settings = await getRoutineSettings();

  const [selectedLogsRaw, weekLogsRaw] = await Promise.all([
    RoutineLogModel.find({ date: selectedDate }).sort({ createdAt: -1 }).lean(),
    RoutineLogModel.find({
      date: {
        $gte: lastSevenDates[0],
        $lte: lastSevenDates[lastSevenDates.length - 1]
      }
    })
      .sort({ date: 1, createdAt: 1 })
      .lean()
  ]);

  const selectedLogs = serializeRoutineLogs(selectedLogsRaw);
  const weekLogs = serializeRoutineLogs(weekLogsRaw);

  const dailyTasks = buildDailyTasks(selectedLogs, settings.routines);
  const completedCount = dailyTasks.filter((task) => task.completed).length;
  const percentage = Math.round((completedCount / settings.routines.length) * 100);

  const chartData = buildWeeklyChartData(weekLogs, lastSevenDates, settings.routines.length);
  const summary = buildWeeklySummary(chartData);
  const taskTable = buildWeeklyTaskTable(weekLogs, lastSevenDates, settings.routines);
  const feedback = buildWeeklyFeedback(chartData);

  return {
    today,
    selectedDate,
    settings,
    daily: {
      tasks: dailyTasks,
      completedCount,
      totalTasks: settings.routines.length,
      percentage
    },
    weekly: {
      chartData,
      dates: lastSevenDates,
      taskTable,
      feedback,
      summary
    }
  };
}

async function getRoutineSettings(): Promise<RoutineSettings> {
  const existing = await RoutineSettingsModel.findOne({ key: "default" }).lean();

  if (!existing) {
    return DEFAULT_ROUTINE_SETTINGS;
  }

  return {
    profile: {
      displayName: existing.profile?.displayName || DEFAULT_ROUTINE_SETTINGS.profile.displayName,
      avatarUrl: existing.profile?.avatarUrl || ""
    },
    routines:
      existing.routines?.map((task) => ({
        name: String(task.name),
        type: task.type,
        unit: task.unit || undefined,
        helperText: task.helperText || ""
      })) ?? DEFAULT_ROUTINE_SETTINGS.routines
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
