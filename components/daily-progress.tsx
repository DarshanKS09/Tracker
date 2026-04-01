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
    <div className="flex min-w-0 flex-col gap-3 rounded-3xl border border-white/10 bg-black/20 p-4 sm:min-w-[280px] sm:gap-4 sm:p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 sm:text-sm">Today&apos;s progress</p>
          <p className="mt-1 text-3xl font-semibold text-white sm:mt-2 sm:text-4xl">{percentage}%</p>
        </div>
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-right sm:px-3 sm:py-2">
          <p className="text-xs uppercase tracking-[0.24em] text-emerald-300/80">Complete</p>
          <p className="mt-1 text-base font-medium text-emerald-100 sm:text-lg">
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
