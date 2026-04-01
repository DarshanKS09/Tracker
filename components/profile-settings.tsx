"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Pencil, Plus, Trash2, Upload, UserRound, X } from "lucide-react";
import type { RoutineSettings, RoutineTaskConfig, RoutineTaskType, WeeklySummary } from "@/utils/types";

type ProfileSettingsProps = {
  settings: RoutineSettings;
  stats: WeeklySummary;
};

const taskTypes: RoutineTaskType[] = ["boolean", "duration", "water"];

function createEmptyRoutine(): RoutineTaskConfig {
  return {
    name: "",
    type: "boolean",
    helperText: ""
  };
}

export function ProfileSettings({ settings, stats }: ProfileSettingsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<RoutineSettings>(settings);

  const initials = form.profile.displayName
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const updateRoutine = (index: number, nextPartial: Partial<RoutineTaskConfig>) => {
    setForm((current) => ({
      ...current,
      routines: current.routines.map((routine, routineIndex) =>
        routineIndex === index ? { ...routine, ...nextPartial } : routine
      )
    }));
  };

  const handleAvatarFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file for the profile picture.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({
        ...current,
        profile: {
          ...current.profile,
          avatarUrl: typeof reader.result === "string" ? reader.result : current.profile.avatarUrl
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const saveSettings = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Unable to save settings.");
      }

      setOpen(false);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setForm(settings);
          setOpen(true);
        }}
        className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
        aria-label="Open profile and routine settings"
      >
        {form.profile.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.profile.avatarUrl}
            alt={form.profile.displayName}
            className="h-8 w-8 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-400/15 text-xs font-semibold text-cyan-200">
            {initials || "U"}
          </span>
        )}
        <div className="hidden text-left sm:block">
          <p className="text-xs text-slate-400">Profile</p>
          <p className="text-sm font-medium text-white">{form.profile.displayName}</p>
        </div>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-surface-950/70 p-3 backdrop-blur-sm sm:p-6">
          <div className="panel max-h-[92vh] w-full max-w-2xl overflow-y-auto p-4 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-cyan-300/80">Profile settings</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Customize your routine space</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Update your profile, check streaks, change routine labels, and add or delete routine cards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-white/10 bg-black/20 p-2 text-slate-300 transition hover:bg-white/10"
                aria-label="Close settings"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <section className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                {form.profile.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.profile.avatarUrl}
                    alt={form.profile.displayName}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-200">
                    <UserRound className="h-7 w-7" />
                  </div>
                )}
                <div className="grid flex-1 gap-3 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm text-slate-300">
                    Name
                    <input
                      value={form.profile.displayName}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          profile: { ...current.profile, displayName: event.target.value }
                        }))
                      }
                      className="rounded-2xl border border-white/10 bg-surface-950 px-3 py-2 text-white outline-none ring-0"
                      placeholder="Your name"
                    />
                  </label>
                  <div className="grid gap-2 text-sm text-slate-300">
                    Profile picture
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-400/15">
                        <Upload className="h-4 w-4" />
                        Choose file
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFile}
                          className="hidden"
                        />
                      </label>
                      {form.profile.avatarUrl ? (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              profile: { ...current.profile, avatarUrl: "" }
                            }))
                          }
                          className="rounded-2xl border border-white/10 bg-surface-950 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-300 transition hover:bg-white/5"
                        >
                          Remove
                        </button>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500">Pick an image from your device. It will be saved with your profile.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Current streak</p>
                <p className="mt-2 text-2xl font-semibold text-fuchsia-200">{stats.currentStreak}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Longest streak</p>
                <p className="mt-2 text-2xl font-semibold text-violet-200">{stats.longestStreak}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Average completion</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-200">{stats.averageCompletion}%</p>
              </div>
            </section>

            <section className="mt-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold text-white">Routines</h4>
                  <p className="text-sm text-slate-400">Edit names, helper text, type, and remove anything you no longer need.</p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      routines: [...current.routines, createEmptyRoutine()]
                    }))
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-emerald-200 transition hover:bg-emerald-400/15"
                >
                  <Plus className="h-4 w-4" />
                  Add routine
                </button>
              </div>

              <div className="grid gap-3">
                {form.routines.map((routine, index) => (
                  <div key={`${routine.name}-${index}`} className="rounded-3xl border border-white/10 bg-black/20 p-4">
                    <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
                      <label className="grid gap-2 text-sm text-slate-300">
                        Routine name
                        <input
                          value={routine.name}
                          onChange={(event) => updateRoutine(index, { name: event.target.value })}
                          className="rounded-2xl border border-white/10 bg-surface-950 px-3 py-2 text-white outline-none"
                          placeholder="Routine title"
                        />
                      </label>
                      <label className="grid gap-2 text-sm text-slate-300">
                        Type
                        <select
                          value={routine.type}
                          onChange={(event) => {
                            const type = event.target.value as RoutineTaskType;
                            updateRoutine(index, {
                              type,
                              unit: type === "boolean" ? undefined : type === "water" ? "L" : "hr"
                            });
                          }}
                          className="rounded-2xl border border-white/10 bg-surface-950 px-3 py-2 text-white outline-none"
                        >
                          {taskTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                      <label className="grid gap-2 text-sm text-slate-300">
                        Helper text
                        <input
                          value={routine.helperText}
                          onChange={(event) => updateRoutine(index, { helperText: event.target.value })}
                          className="rounded-2xl border border-white/10 bg-surface-950 px-3 py-2 text-white outline-none"
                          placeholder="Short helper text"
                        />
                      </label>

                      <div className="flex items-end gap-2">
                        {routine.type !== "boolean" ? (
                          <label className="grid gap-2 text-sm text-slate-300">
                            Unit
                            <input
                              value={routine.unit ?? ""}
                              onChange={(event) => updateRoutine(index, { unit: event.target.value })}
                              className="w-24 rounded-2xl border border-white/10 bg-surface-950 px-3 py-2 text-white outline-none"
                              placeholder="hr"
                            />
                          </label>
                        ) : null}
                        <button
                          type="button"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              routines: current.routines.filter((_, routineIndex) => routineIndex !== index)
                            }))
                          }
                          className={clsx(
                            "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs uppercase tracking-[0.18em] transition",
                            form.routines.length === 1
                              ? "cursor-not-allowed border-white/10 bg-white/5 text-slate-500"
                              : "border-red-400/20 bg-red-400/10 text-red-200 hover:bg-red-400/15"
                          )}
                          disabled={form.routines.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {error ? (
              <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveSettings}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Pencil className="h-4 w-4" />
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
