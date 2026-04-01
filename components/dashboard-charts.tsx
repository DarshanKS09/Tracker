"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { WeeklyChartPoint } from "@/utils/types";

type DashboardChartsProps = {
  chartData: WeeklyChartPoint[];
};

export function DashboardCharts({ chartData }: DashboardChartsProps) {
  return (
    <section className="panel flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Weekly dashboard</h2>
        <p className="mt-1 text-sm text-slate-400">Completion percentage and task volume over the last 7 days</p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <p className="mb-4 text-sm text-slate-300">Daily completion %</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#08111f",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 16
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completionPercentage"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={{ fill: "#22c55e", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
          <p className="mb-4 text-sm text-slate-300">Tasks completed</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#08111f",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 16
                  }}
                />
                <Bar dataKey="completedTasks" fill="#38bdf8" radius={[12, 12, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
