import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { RoutineLog } from "@/models/routine-log";
import { getTaskCompletion, ROUTINE_TASKS } from "@/utils/constants";
import { getDateString } from "@/utils/date";

type TogglePayload = {
  taskName?: string;
  completed?: boolean;
  value?: number;
  date?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as TogglePayload;
  const date = body.date ?? getDateString();

  if (!body.taskName || !ROUTINE_TASKS.includes(body.taskName)) {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const nextValue = typeof body.value === "number" ? body.value : null;
  const nextCompleted = getTaskCompletion(body.taskName, nextValue, body.completed);

  try {
    await connectToDatabase();
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
