import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { DEFAULT_ROUTINE_SETTINGS } from "@/utils/constants";
import { RoutineSettingsModel } from "@/models/routine-settings";
import { normalizeRoutineSettingsDocument } from "@/utils/routine-settings";
import type { RoutineSettings, RoutineTaskConfig } from "@/utils/types";

function normalizeRoutine(task: Partial<RoutineTaskConfig>): RoutineTaskConfig | null {
  if (!task.name || !task.type) {
    return null;
  }

  const name = task.name.trim();
  const helperText = (task.helperText ?? "").trim();

  if (!name) {
    return null;
  }

  return {
    name,
    type: task.type,
    unit: task.type === "boolean" ? undefined : task.unit?.trim() || (task.type === "water" ? "L" : "hr"),
    helperText: helperText || `Track ${name.toLowerCase()} for the day.`
  };
}

export async function GET() {
  try {
    await connectToDatabase();
    const existing = await RoutineSettingsModel.findOne({ key: "default" }).lean();

    if (!existing) {
      return NextResponse.json(DEFAULT_ROUTINE_SETTINGS);
    }

    return NextResponse.json(normalizeRoutineSettingsDocument(existing) satisfies RoutineSettings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<RoutineSettings>;
    const routines = (body.routines ?? []).map(normalizeRoutine).filter(Boolean) as RoutineTaskConfig[];

    if (routines.length === 0) {
      return NextResponse.json({ error: "At least one routine is required." }, { status: 400 });
    }

    await connectToDatabase();
    await RoutineSettingsModel.findOneAndUpdate(
      { key: "default" },
      {
        key: "default",
        profile: {
          displayName: body.profile?.displayName?.trim() || DEFAULT_ROUTINE_SETTINGS.profile.displayName,
          avatarUrl: body.profile?.avatarUrl?.trim() || ""
        },
        routines
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save settings.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
