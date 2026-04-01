import clsx from "clsx";
import type { WeeklySummary } from "@/utils/types";

type StatsGridProps = {
  stats: WeeklySummary;
  compact?: boolean;
};

const statItems = [
  {
    key: "totalTasks",
    label: "Total tasks this week",
    accent: "text-cyan-200"
  },
  {
    key: "averageCompletion",
    label: "Average completion",
    accent: "text-emerald-200"
  },
  {
    key: "bestDay",
    label: "Best day",
    accent: "text-amber-200"
  },
  {
    key: "currentStreak",
    label: "Current streak",
    accent: "text-fuchsia-200"
  },
  {
    key: "longestStreak",
    label: "Longest streak",
    accent: "text-violet-200"
  }
] as const;

export function StatsGrid({ stats, compact = false }: StatsGridProps) {
  const values: Record<(typeof statItems)[number]["key"], string> = {
    totalTasks: stats.totalTasks.toString(),
    averageCompletion: `${stats.averageCompletion}%`,
    bestDay: stats.bestDay,
    currentStreak: `${stats.currentStreak} day${stats.currentStreak === 1 ? "" : "s"}`,
    longestStreak: `${stats.longestStreak} day${stats.longestStreak === 1 ? "" : "s"}`
  };

  return (
    <section className={compact ? "grid gap-3" : "grid gap-4 md:grid-cols-2 xl:grid-cols-5"}>
      {statItems.map((item) => (
        <div key={item.key} className={clsx("panel", compact ? "p-4" : "p-5")}>
          <p className={clsx("text-slate-400", compact ? "text-xs" : "text-sm")}>{item.label}</p>
          <p className={clsx("mt-3 font-semibold", item.accent, compact ? "text-xl" : "text-2xl")}>
            {values[item.key]}
          </p>
        </div>
      ))}
    </section>
  );
}
