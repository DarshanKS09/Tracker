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
  const liveChartData = buildLiveWeeklyChart(weeklyChartData, tasks, today);
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
        <h2 className="text-xl font-semibold text-white">Weekly chart</h2>
        <p className="mt-1 text-sm text-slate-400">Today&apos;s task changes roll into the current week instantly</p>
      </div>

      <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-300">Daily percentage</p>
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
      </div>
    </section>
  );
}
