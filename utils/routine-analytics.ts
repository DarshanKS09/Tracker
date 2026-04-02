import { SUCCESS_THRESHOLD } from "@/utils/constants";
import { formatDayLabel } from "@/utils/date";
import type {
  RoutineLog,
  RoutineTaskConfig,
  WeeklyChartPoint,
  WeeklyFeedbackPoint,
  WeeklySummary,
  WeeklyTaskRow
} from "@/utils/types";

type DaySnapshot = {
  date: string;
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
  successfulDay: boolean;
};

export function buildDailyTasks(logs: RoutineLog[], taskConfigs: RoutineTaskConfig[]) {
  const taskMap = buildLatestTaskMap(logs);

  return taskConfigs.map((task) => {
    const log = taskMap.get(task.name);

    return {
      taskName: task.name,
      taskType: task.type,
      completed: log?.completed ?? false,
      unit: task.unit,
      helperText: task.helperText,
      value: log?.value ?? 0,
      timestamp: log?.createdAt ?? null
    };
  });
}

export function buildWeeklyChartData(logs: RoutineLog[], dates: string[], totalTasksPerDay: number) {
  const grouped = groupLogsByDate(logs);

  return dates.map((date) => {
    const dayLogs = Array.from(buildLatestTaskMap(grouped.get(date) ?? []).values());
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

export function buildWeeklyTaskTable(
  logs: RoutineLog[],
  dates: string[],
  taskConfigs: RoutineTaskConfig[]
): WeeklyTaskRow[] {
  const grouped = groupLogsByDate(logs);

  return taskConfigs.map((task) => {
    const completionByDate = dates.reduce<Record<string, boolean>>((accumulator, date) => {
      const dayLogs = buildLatestTaskMap(grouped.get(date) ?? []);
      const log = dayLogs.get(task.name);
      accumulator[date] = log?.completed ?? false;
      return accumulator;
    }, {});

    const completedDays = dates.filter((date) => completionByDate[date]).length;

    return {
      taskName: task.name,
      completionByDate,
      weeklyPercentage: Math.round((completedDays / dates.length) * 100)
    };
  });
}

export function buildWeeklyFeedback(chartData: WeeklyChartPoint[]): WeeklyFeedbackPoint[] {
  return chartData.map((item) => ({
    date: item.date,
    label: item.label,
    percentage: item.completionPercentage,
    feedback:
      item.completionPercentage >= 80
        ? "Great"
        : item.completionPercentage >= 50
          ? "Good"
          : item.completionPercentage >= 25
            ? "Low"
            : "Poor"
  }));
}

export function buildDaySnapshot(logs: RoutineLog[], totalTasksPerDay: number): DaySnapshot {
  const latestLogs = Array.from(buildLatestTaskMap(logs).values());
  const completedTasks = latestLogs.filter((log) => log.completed).length;
  const completionPercentage = Math.round((completedTasks / totalTasksPerDay) * 100);

  return {
    date: latestLogs[0]?.date ?? logs[0]?.date ?? "",
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

function buildLatestTaskMap(logs: RoutineLog[]) {
  const latestByTask = new Map<string, RoutineLog>();

  for (const log of logs) {
    const existing = latestByTask.get(log.taskName);

    if (!existing || new Date(log.createdAt).getTime() >= new Date(existing.createdAt).getTime()) {
      latestByTask.set(log.taskName, log);
    }
  }

  return latestByTask;
}
