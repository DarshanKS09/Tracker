export type RoutineLog = {
  id: string;
  date: string;
  taskName: string;
  completed: boolean;
  createdAt: string;
};

export type DailyTaskItem = {
  taskName: string;
  completed: boolean;
  timestamp?: string | null;
};

export type WeeklyChartPoint = {
  date: string;
  label: string;
  completionPercentage: number;
  completedTasks: number;
  successfulDay: boolean;
};

export type WeeklySummary = {
  totalTasks: number;
  averageCompletion: number;
  bestDay: string;
  currentStreak: number;
  longestStreak: number;
};
