import { DEFAULT_ROUTINE_SETTINGS } from "@/utils/constants";
import type { RoutineSettings, RoutineTaskConfig } from "@/utils/types";

type LeanRoutineTask = {
  name?: unknown;
  type?: unknown;
  unit?: unknown;
  helperText?: unknown;
};

type LeanRoutineSettings = {
  profile?: {
    displayName?: unknown;
    avatarUrl?: unknown;
  };
  routines?: LeanRoutineTask[];
};

function normalizeRoutine(task: LeanRoutineTask): RoutineTaskConfig | null {
  if (typeof task.name !== "string" || typeof task.type !== "string") {
    return null;
  }

  if (task.type !== "boolean" && task.type !== "duration" && task.type !== "water") {
    return null;
  }

  const name = task.name.trim();

  if (!name) {
    return null;
  }

  return {
    name,
    type: task.type,
    unit: typeof task.unit === "string" && task.unit.trim() ? task.unit.trim() : undefined,
    helperText: typeof task.helperText === "string" ? task.helperText : ""
  };
}

export function normalizeRoutineSettingsDocument(document: unknown): RoutineSettings {
  const value = (document ?? {}) as LeanRoutineSettings;

  return {
    profile: {
      displayName:
        typeof value.profile?.displayName === "string" && value.profile.displayName.trim()
          ? value.profile.displayName
          : DEFAULT_ROUTINE_SETTINGS.profile.displayName,
      avatarUrl: typeof value.profile?.avatarUrl === "string" ? value.profile.avatarUrl : ""
    },
    routines:
      value.routines?.map(normalizeRoutine).filter(Boolean) as RoutineTaskConfig[] || DEFAULT_ROUTINE_SETTINGS.routines
  };
}
