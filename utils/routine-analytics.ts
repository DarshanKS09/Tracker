import { ROUTINE_TASK_CONFIGS, SUCCESS_THRESHOLD } from "@/utils/constants";
import { formatDayLabel } from "@/utils/date";
import type { RoutineLog, WeeklyChartPoint, WeeklySummary } from "@/utils/types";

type DaySnapshot = {
  date: string;
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
  successfulDay: boolean;
};

export function buildDailyTasks(logs: RoutineLog[]) {
  const taskMap = new Map(logs.map((log) => [log.taskName, log]));

  return ROUTINE_TASK_CONFIGS.map((task) => {
    const log = taskMap.get(task.name);

    return {
      taskName: task.name,
      taskType: task.type,
      completed: log?.completed ?? false,
      target: task.target,
      unit: task.unit,
      helperText: task.helperText,
      value: log?.value ?? 0,
      options: task.options ?? [],
      timestamp: log?.createdAt ?? null
    };
  });
}

export function buildWeeklyChartData(logs: RoutineLog[], dates: string[], totalTasksPerDay: number) {
  const grouped = groupLogsByDate(logs);

  return dates.map((date) => {
    const dayLogs = grouped.get(date) ?? [];
    const completedTasks = dayLogs.filter((item) => item.completed).length;
    const completionPercentage = Math.round((completedTasks / totalTasksPerDay) * 100);

    return {
      date,
      label: formatDayLabel(date),
      completionPercentage,
      completedTasks,
      successfulDay: completionPercentage >= SUCCESS_THRESHOLD
    } satisfies WeeklyChartPoint;
  });
}

export function buildWeeklySummary(chartData: WeeklyChartPoint[]): WeeklySummary {
  const totalTasks = chartData.reduce((sum, item) => sum + item.completedTasks, 0);
  const averageCompletion = Math.round(
    chartData.reduce((sum, item) => sum + item.completionPercentage, 0) / chartData.length
  );

  const bestDay = [...chartData].sort((a, b) => b.completionPercentage - a.completionPercentage)[0];

  const { currentStreak, longestStreak } = calculateStreaks(chartData);

  return {
    totalTasks,
    averageCompletion,
    bestDay: bestDay ? `${bestDay.label} (${bestDay.completionPercentage}%)` : "No data",
    currentStreak,
    longestStreak
  };
}

export function buildDaySnapshot(logs: RoutineLog[], totalTasksPerDay: number): DaySnapshot {
  const completedTasks = logs.filter((log) => log.completed).length;
  const completionPercentage = Math.round((completedTasks / totalTasksPerDay) * 100);

  return {
    date: logs[0]?.date ?? "",
    completedTasks,
    totalTasks: totalTasksPerDay,
    completionPercentage,
    successfulDay: completionPercentage >= SUCCESS_THRESHOLD
  };
}

function calculateStreaks(chartData: WeeklyChartPoint[]) {
  let currentStreak = 0;
  let longestStreak = 0;
  let running = 0;

  for (const day of chartData) {
    if (day.successfulDay) {
      running += 1;
      longestStreak = Math.max(longestStreak, running);
    } else {
      running = 0;
    }
  }

  for (let index = chartData.length - 1; index >= 0; index -= 1) {
    if (!chartData[index].successfulDay) {
      break;
    }

    currentStreak += 1;
  }

  return {
    currentStreak,
    longestStreak
  };
}

function groupLogsByDate(logs: RoutineLog[]) {
  const grouped = new Map<string, RoutineLog[]>();

  for (const log of logs) {
    const existing = grouped.get(log.date) ?? [];
    existing.push(log);
    grouped.set(log.date, existing);
  }

  return grouped;
}
