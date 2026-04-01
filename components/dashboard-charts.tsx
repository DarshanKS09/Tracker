"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { DailyTaskItem, WeeklyChartPoint, WeeklyFeedbackPoint } from "@/utils/types";

type DashboardChartsProps = {
  tasks: DailyTaskItem[];
  today: string;
  weeklyChartData: WeeklyChartPoint[];
  weeklyFeedback: WeeklyFeedbackPoint[];
};

function buildLiveWeeklyChart(
  weeklyChartData: WeeklyChartPoint[],
  tasks: DailyTaskItem[],
  today: string
) {
  const completedToday = tasks.filter((task) => task.completed).length;
  const percentageToday = Math.round((completedToday / tasks.length) * 100);

  return weeklyChartData.map((point) =>
    point.date === today
      ? {
          ...point,
          completionPercentage: percentageToday,
          completedTasks: completedToday
        }
      : point
  );
}

function getFeedbackLabel(percentage: number) {
  if (percentage >= 80) {
    return "Great";
  }
  if (percentage >= 50) {
    return "Good";
  }
  if (percentage >= 25) {
    return "Low";
  }
  return "Poor";
}

export function DashboardCharts({
  tasks,
  today,
  weeklyChartData,
  weeklyFeedback
}: DashboardChartsProps) {
  const [chartView, setChartView] = useState<"daily" | "weekly">("daily");
  const liveChartData = buildLiveWeeklyChart(weeklyChartData, tasks, today);
  const completedCount = tasks.filter((task) => task.completed).length;
  const completionPercentage = Math.round((completedCount / tasks.length) * 100);
  const dailyDonutData = [
    {
      name: "Completed",
      value: completedCount,
      fill: "#22c55e"
    },
    {
      name: "Remaining",
      value: Math.max(tasks.length - completedCount, 0),
      fill: "rgba(255,255,255,0.10)"
    }
  ];
  const liveFeedback = weeklyFeedback.map((item) => {
    if (item.date !== today) {
      return item;
    }

    const todayPoint = liveChartData.find((point) => point.date === today);
    const percentage = todayPoint?.completionPercentage ?? item.percentage;

    return {
      ...item,
      percentage,
      feedback: getFeedbackLabel(percentage)
    };
  });
  const weeklyAverage = Math.round(
    liveChartData.reduce((sum, point) => sum + point.completionPercentage, 0) / liveChartData.length
  );

  return (
    <section className="panel flex flex-col gap-6 p-6">
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Routine charts</h2>
            <p className="mt-1 text-sm text-slate-400">
              Switch between today&apos;s routine coverage and the live weekly trend
            </p>
          </div>
          <div className="inline-flex rounded-full border border-white/10 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setChartView("daily")}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                chartView === "daily"
                  ? "bg-cyan-400 text-surface-950"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setChartView("weekly")}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.2em] transition ${
                chartView === "weekly"
                  ? "bg-cyan-400 text-surface-950"
                  : "text-slate-300 hover:bg-white/5"
              }`}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        {chartView === "daily" ? (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-300">Daily routine coverage</p>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-cyan-200">
                {completedCount} of {tasks.length} done
              </span>
            </div>
            <div className="grid place-items-center">
              <div className="relative h-80 w-full max-w-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dailyDonutData}
                      dataKey="value"
                      nameKey="name"
                      fill="#22c55e"
                      innerRadius="70%"
                      outerRadius="92%"
                      startAngle={90}
                      endAngle={-270}
                      cornerRadius={10}
                      stroke="rgba(7,17,31,0.9)"
                      strokeWidth={3}
                    />
                    <Tooltip
                      formatter={(value, name) => [`${value} routines`, name]}
                      contentStyle={{
                        backgroundColor: "#08111f",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 16
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-5xl font-semibold text-white">{completionPercentage}%</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-slate-400">
                    Routine completion
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-300">Weekly percentage</p>
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.18em]">
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-cyan-200">
                  Weekly avg {weeklyAverage}%
                </span>
                {liveFeedback.map((point) => (
                  <span
                    key={point.date}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-slate-300"
                  >
                    {point.label} {point.percentage}%
                  </span>
                ))}
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liveChartData} margin={{ left: 0, right: 8, top: 8, bottom: 8 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
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
                    dataKey="completionPercentage"
                    stroke="#00e5ff"
                    fill="rgba(0, 229, 255, 0.26)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
