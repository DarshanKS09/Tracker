export type RoutineLog = {
  id: string;
  date: string;
  task_name: string;
  completed: boolean;
  created_at: string;
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
