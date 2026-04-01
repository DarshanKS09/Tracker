"use client";

import Link from "next/link";
import type { RoutineSettings } from "@/utils/types";

type ProfileEntryButtonProps = {
  settings: RoutineSettings;
};

export function ProfileEntryButton({ settings }: ProfileEntryButtonProps) {
  const initials = settings.profile.displayName
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href="/settings"
      className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
      aria-label="Open profile and routine settings"
    >
      {settings.profile.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={settings.profile.avatarUrl}
          alt={settings.profile.displayName}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-semibold text-cyan-200">
          {initials || "U"}
        </span>
      )}
      <div className="hidden text-left sm:block">
        <p className="text-xs text-slate-400">Profile</p>
        <p className="text-sm font-medium text-white">{settings.profile.displayName}</p>
      </div>
    </Link>
  );
}
