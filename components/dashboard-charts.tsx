"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { DailyRoutineChartPoint, DailyTaskItem } from "@/utils/types";

type DashboardChartsProps = {
  tasks: DailyTaskItem[];
};

function buildDailyRoutineChart(tasks: DailyTaskItem[]): DailyRoutineChartPoint[] {
  return tasks.map((task) => ({
    routine: task.taskName,
    done: task.completed ? 1 : 0,
    undone: task.completed ? 0 : 1
  }));
}

export function DashboardCharts({ tasks }: DashboardChartsProps) {
  const chartData = buildDailyRoutineChart(tasks);

  return (
    <section className="panel flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Daily routine chart</h2>
        <p className="mt-1 text-sm text-slate-400">Live view of routines versus done and undone states</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <p className="mb-4 text-sm text-slate-300">Routines vs done / undone</p>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="routine"
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-18}
                height={72}
                textAnchor="end"
              />
              <YAxis
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
                domain={[0, 1]}
                ticks={[0, 1]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#08111f",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 16
                }}
              />
              <Area
                type="monotone"
                dataKey="done"
                stackId="status"
                stroke="#22c55e"
                fill="rgba(34,197,94,0.55)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="undone"
                stackId="status"
                stroke="#ef4444"
                fill="rgba(239,68,68,0.35)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
