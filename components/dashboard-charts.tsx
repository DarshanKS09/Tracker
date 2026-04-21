"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
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

function getDayOrder(dateString: string) {
  return new Date(`${dateString}T00:00:00`).getDay();
}

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
  const liveChartData = buildLiveWeeklyChart(weeklyChartData, tasks, today).sort(
    (left, right) => getDayOrder(left.date) - getDayOrder(right.date)
  );
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
  }).sort((left, right) => getDayOrder(left.date) - getDayOrder(right.date));
  const weeklyAverage = Math.round(
    liveChartData.reduce((sum, point) => sum + point.completionPercentage, 0) / liveChartData.length
  );

  return (
    <section className="panel shadow-none flex flex-col gap-4 p-4 sm:p-5">
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Routine charts</h2>
            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              Switch between today&apos;s routine coverage and the live weekly trend
            </p>
          </div>
          <div className="inline-flex rounded-full border border-white/10 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setChartView("daily")}
              className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition sm:px-4 sm:py-2 sm:text-xs ${
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
              className={`rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] transition sm:px-4 sm:py-2 sm:text-xs ${
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

      <div className="rounded-3xl border border-white/10 bg-black/20 p-3 sm:p-4">
        {chartView === "daily" ? (
          <>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-300 sm:text-sm">Daily routine coverage</p>
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-cyan-200 sm:px-3 sm:py-1.5 sm:text-xs">
                {completedCount} of {tasks.length} done
              </span>
            </div>
            <div className="grid place-items-center">
              <div className="relative h-52 w-full max-w-[220px] sm:h-60 sm:max-w-[250px]">
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
                      isAnimationActive
                      animationBegin={0}
                      animationDuration={700}
                      animationEasing="ease-in-out"
                    >
                      {dailyDonutData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${value} routines`, name]}
                      contentStyle={{
                        backgroundColor: "#08111f",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 16,
                        color: "#e2e8f0"
                      }}
                      labelStyle={{ color: "#f8fafc" }}
                      itemStyle={{ color: "#cbd5e1" }}
                      cursor={{ fill: "rgba(255,255,255,0.05)" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-3xl font-semibold text-white sm:text-4xl">{completionPercentage}%</p>
                  <p className="mt-1.5 text-[10px] uppercase tracking-[0.24em] text-slate-400 sm:text-xs">
                    Routine completion
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-300 sm:text-sm">Weekly percentage</p>
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] sm:text-xs">
                <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-cyan-200 sm:px-3 sm:py-1.5">
                  Weekly avg {weeklyAverage}%
                </span>
                {liveFeedback.map((point) => (
                  <span
                    key={point.date}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300 sm:px-3 sm:py-1.5"
                  >
                    {point.label} {point.percentage}%
                  </span>
                ))}
              </div>
            </div>
            <div className="h-52 sm:h-60">
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
                      borderRadius: 16,
                      color: "#e2e8f0"
                    }}
                    labelStyle={{ color: "#f8fafc" }}
                    itemStyle={{ color: "#cbd5e1" }}
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
