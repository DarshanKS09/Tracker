export type RoutineTaskType = "boolean" | "duration" | "water";

export type RoutineTaskConfig = {
  name: string;
  type: RoutineTaskType;
  target: number;
  unit?: string;
  options?: number[];
  helperText: string;
};

export const ROUTINE_TASK_CONFIGS: RoutineTaskConfig[] = [
  {
    name: "Wake up at 5",
    type: "boolean",
    target: 1,
    helperText: "Mark complete once you are up by 5."
  },
  {
    name: "Run (>5 km)",
    type: "boolean",
    target: 1,
    helperText: "Complete after your run crosses 5 km."
  },
  {
    name: "Books",
    type: "boolean",
    target: 1,
    helperText: "Tick this once your reading session is done."
  },
  {
    name: "Duolingo",
    type: "boolean",
    target: 1,
    helperText: "Finish your language streak for the day."
  },
  {
    name: "Morning work (before breakfast)",
    type: "duration",
    target: 2,
    unit: "hr",
    options: [0, 0.5, 1, 1.5, 2, 2.5, 3, 4],
    helperText: "Select the hours you focused before breakfast."
  },
  {
    name: "Midday work (after BF to before lunch)",
    type: "duration",
    target: 3,
    unit: "hr",
    options: [0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5],
    helperText: "Track your work block after breakfast."
  },
  {
    name: "Learn TR + MNY (after lunch to evening break)",
    type: "duration",
    target: 2,
    unit: "hr",
    options: [0, 0.5, 1, 1.5, 2, 2.5, 3, 4],
    helperText: "Choose how long you studied trading and money."
  },
  {
    name: "Evening work (6 to dinner)",
    type: "duration",
    target: 2,
    unit: "hr",
    options: [0, 0.5, 1, 1.5, 2, 2.5, 3, 4],
    helperText: "Log the hours worked between 6 PM and dinner."
  },
  {
    name: "Late night work (dinner to 11)",
    type: "duration",
    target: 2,
    unit: "hr",
    options: [0, 0.5, 1, 1.5, 2, 2.5, 3, 4],
    helperText: "Track the final work block of the day."
  },
  {
    name: "Water 4+ litre",
    type: "water",
    target: 4,
    unit: "L",
    options: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6],
    helperText: "Select how much water you have drunk today."
  }
];

export const ROUTINE_TASKS = ROUTINE_TASK_CONFIGS.map((task) => task.name);

export const SUCCESS_THRESHOLD = 80;

export function getTaskConfig(taskName: string) {
  return ROUTINE_TASK_CONFIGS.find((task) => task.name === taskName);
}

export function getTaskCompletion(taskName: string, value?: number | null, completed?: boolean) {
  const config = getTaskConfig(taskName);

  if (!config) {
    return false;
  }

  if (config.type === "boolean") {
    return Boolean(completed);
  }

  return (value ?? 0) >= config.target;
}

export function formatTaskValue(value: number, unit?: string) {
  if (!unit) {
    return value.toString();
  }

  return `${Number.isInteger(value) ? value : value.toFixed(1)} ${unit}`;
}
