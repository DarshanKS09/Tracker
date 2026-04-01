"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  Cell,
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

const ROUTINE_COLORS = [
  "#22c55e",
  "#38bdf8",
  "#f97316",
  "#eab308",
  "#a855f7",
  "#14b8a6",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
  "#f43f5e"
];

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

function buildDailyDonutData(tasks: DailyTaskItem[]) {
  return tasks.map((task, index) => {
    const numericValue = task.taskType === "boolean" ? (task.completed ? 1 : 0.2) : Math.max(task.value, 0.1);

    return {
      name: task.taskName,
      value: numericValue,
      completed: task.completed,
      unit: task.unit,
      displayValue:
        task.taskType === "boolean" ? (task.completed ? "Done" : "Not done") : formatTooltipValue(task.value, task.unit),
      fill: ROUTINE_COLORS[index % ROUTINE_COLORS.length]
    };
  });
}

function formatTooltipValue(value: number, unit?: string) {
  if (!unit) {
    return value.toString();
  }

  return `${value.toFixed(1)} ${unit}`;
}

export function DashboardCharts({
  tasks,
  today,
  weeklyChartData,
  weeklyFeedback
}: DashboardChartsProps) {
  const [chartView, setChartView] = useState<"daily" | "weekly">("daily");
  const liveChartData = buildLiveWeeklyChart(weeklyChartData, tasks, today);
  const dailyDonutData = buildDailyDonutData(tasks);
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
                {tasks.filter((task) => task.completed).length} done today
              </span>
            </div>
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dailyDonutData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="58%"
                      outerRadius="86%"
                      paddingAngle={3}
                      stroke="rgba(7,17,31,0.9)"
                      strokeWidth={2}
                    >
                      {dailyDonutData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, _name, item) => {
                        const payload = item.payload as {
                          displayValue: string;
                        };
                        return [payload.displayValue, "Progress"];
                      }}
                      contentStyle={{
                        backgroundColor: "#08111f",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 16
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid gap-2 self-center">
                {dailyDonutData.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3.5 w-3.5 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-100">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.displayValue}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] ${
                        item.completed
                          ? "bg-emerald-400/15 text-emerald-200"
                          : "bg-red-400/10 text-red-200"
                      }`}
                    >
                      {item.completed ? "Done" : "Open"}
                    </span>
                  </div>
                ))}
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
