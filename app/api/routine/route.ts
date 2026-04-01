import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { RoutineLog } from "@/models/routine-log";
import { getTaskCompletion } from "@/utils/constants";
import { getDateString } from "@/utils/date";
import { RoutineSettingsModel } from "@/models/routine-settings";

type TogglePayload = {
  taskName?: string;
  completed?: boolean;
  value?: number;
  date?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as TogglePayload;
  const date = body.date ?? getDateString();

  const nextValue = typeof body.value === "number" ? body.value : null;

  try {
    await connectToDatabase();
    const settings = await RoutineSettingsModel.findOne({ key: "default" }).lean();
    const routines =
      settings?.routines?.map((task) => ({
        name: String(task.name),
        type: task.type,
        unit: task.unit || undefined,
        helperText: task.helperText || ""
      })) ?? [];

    if (!body.taskName || !routines.some((task) => task.name === body.taskName)) {
      return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
    }

    const nextCompleted = getTaskCompletion(body.taskName, routines, nextValue, body.completed);
    await RoutineLog.findOneAndUpdate(
      { date, taskName: body.taskName },
      {
        date,
        taskName: body.taskName,
        completed: nextCompleted,
        value: nextValue,
        createdAt: new Date()
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update routine task.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
