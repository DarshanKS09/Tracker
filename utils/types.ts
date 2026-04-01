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
  unit?: string;
  helperText: string;
  value: number;
  timestamp?: string | null;
};

export type DailyRoutineChartPoint = {
  routine: string;
  done: number;
  undone: number;
};

export type WeeklyChartPoint = {
  date: string;
  label: string;
  completionPercentage: number;
  completedTasks: number;
  successfulDay: boolean;
};

export type WeeklyTaskRow = {
  taskName: string;
  completionByDate: Record<string, boolean>;
  weeklyPercentage: number;
};

export type WeeklyFeedbackPoint = {
  date: string;
  label: string;
  percentage: number;
  feedback: string;
};

export type WeeklySummary = {
  totalTasks: number;
  averageCompletion: number;
  bestDay: string;
  currentStreak: number;
  longestStreak: number;
};
