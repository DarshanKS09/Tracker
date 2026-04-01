export type RoutineLog = {
  id: string;
  date: string;
  taskName: string;
  completed: boolean;
  value: number | null;
  createdAt: string;
};

export type DailyTaskItem = {
  taskName: string;
  taskType: "boolean" | "duration" | "water";
  completed: boolean;
  target: number;
  unit?: string;
  helperText: string;
  value: number;
  options: number[];
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
