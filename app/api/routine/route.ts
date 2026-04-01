import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { ROUTINE_TASKS } from "@/utils/constants";
import { getDateString } from "@/utils/date";

type TogglePayload = {
  taskName?: string;
  completed?: boolean;
  date?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as TogglePayload;
  const date = body.date ?? getDateString();

  if (!body.taskName || !ROUTINE_TASKS.includes(body.taskName) || typeof body.completed !== "boolean") {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("routine_logs")
    .upsert(
      {
        date,
        task_name: body.taskName,
        completed: body.completed,
        created_at: new Date().toISOString()
      },
      {
        onConflict: "date,task_name"
      }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
