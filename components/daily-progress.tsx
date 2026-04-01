type DailyProgressProps = {
  percentage: number;
  completedCount: number;
  totalTasks: number;
};

export function DailyProgress({
  percentage,
  completedCount,
  totalTasks
}: DailyProgressProps) {
  return (
    <div className="flex min-w-[280px] flex-col gap-4 rounded-3xl border border-white/10 bg-black/20 p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-slate-400">Today&apos;s progress</p>
          <p className="mt-2 text-4xl font-semibold text-white">{percentage}%</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-right">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">Complete</p>
          <p className="mt-1 text-lg font-medium text-emerald-100">
            {completedCount}/{totalTasks}
          </p>
        </div>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
