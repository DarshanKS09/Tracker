import { NextResponse } from "next/server";
import { getRoutinePageData } from "@/utils/routine-data";

export async function GET() {
  try {
    const data = await getRoutinePageData();
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load routine data.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
