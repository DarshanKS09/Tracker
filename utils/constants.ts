import type { RoutineSettings, RoutineTaskConfig } from "@/utils/types";

export const DEFAULT_ROUTINE_TASK_CONFIGS: RoutineTaskConfig[] = [
  {
    name: "Wake up at 5",
    type: "boolean",
    helperText: "Mark complete once you are up by 5."
  },
  {
    name: "Run (>5 km)",
    type: "boolean",
    helperText: "Complete after your run crosses 5 km."
  },
  {
    name: "Books",
    type: "boolean",
    helperText: "Tick this once your reading session is done."
  },
  {
    name: "Duolingo",
    type: "boolean",
    helperText: "Finish your language streak for the day."
  },
  {
    name: "Morning work (before breakfast)",
    type: "duration",
    unit: "hr",
    helperText: "Set how many hours you focused before breakfast."
  },
  {
    name: "Midday work (after BF to before lunch)",
    type: "duration",
    unit: "hr",
    helperText: "Set how many hours you worked after breakfast."
  },
  {
    name: "Learn TR + MNY (after lunch to evening break)",
    type: "duration",
    unit: "hr",
    helperText: "Set your study time for trading and money."
  },
  {
    name: "Evening work (6 to dinner)",
    type: "duration",
    unit: "hr",
    helperText: "Set your work time between 6 PM and dinner."
  },
  {
    name: "Late night work (dinner to 11)",
    type: "duration",
    unit: "hr",
    helperText: "Set your final work block for the night."
  },
  {
    name: "Water 4+ litre",
    type: "water",
    unit: "L",
    helperText: "Select how much water you have drunk today."
  }
];

export const DEFAULT_ROUTINE_SETTINGS: RoutineSettings = {
  profile: {
    displayName: "Routine owner",
    avatarUrl: ""
  },
  routines: DEFAULT_ROUTINE_TASK_CONFIGS
};

export const SUCCESS_THRESHOLD = 80;

export function getTaskConfig(taskName: string, tasks: RoutineTaskConfig[]) {
  return tasks.find((task) => task.name === taskName);
}

export function getTaskCompletion(
  taskName: string,
  tasks: RoutineTaskConfig[],
  value?: number | null,
  completed?: boolean
) {
  const config = getTaskConfig(taskName, tasks);

  if (!config) {
    return false;
  }

  void value;
  return Boolean(completed);
}

export function formatTaskValue(value: number, unit?: string) {
  if (!unit) {
    return value.toString();
  }

  return `${Number.isInteger(value) ? value : value.toFixed(1)} ${unit}`;
}
