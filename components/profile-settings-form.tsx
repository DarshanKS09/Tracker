"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { ArrowLeft, Pencil, Plus, Trash2, Upload, UserRound } from "lucide-react";
import type { RoutineSettings, RoutineTaskConfig, RoutineTaskType, WeeklySummary } from "@/utils/types";

type ProfileSettingsFormProps = {
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

export function ProfileSettingsForm({ settings, stats }: ProfileSettingsFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<RoutineSettings>(settings);
  const backHref = useMemo(() => {
    const date = searchParams.get("date");
    return date ? `/?date=${encodeURIComponent(date)}` : "/";
  }, [searchParams]);

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
    setSuccess(null);

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

      setSuccess("Changes saved successfully.");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
      <section className="panel overflow-hidden p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs uppercase tracking-[0.18em] text-slate-300 transition hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-cyan-300/80">Profile settings</p>
            <h1 className="mt-2 text-3xl font-semibold text-white sm:text-4xl">Customize your routine space</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-400">
              Update your single-user profile, manage routines, and keep the app exactly how you want it.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <section className="panel p-4 sm:p-6">
            <div className="flex items-center gap-4">
              {form.profile.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.profile.avatarUrl}
                  alt={form.profile.displayName}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-200">
                  <UserRound className="h-8 w-8" />
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
                    className="rounded-2xl border border-white/10 bg-surface-950 px-3 py-2 text-white outline-none"
                    placeholder="Your name"
                  />
                </label>
                <div className="grid gap-2 text-sm text-slate-300">
                  Profile picture
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs uppercase tracking-[0.18em] text-cyan-100 transition hover:bg-cyan-400/15">
                      <Upload className="h-4 w-4" />
                      Choose file
                      <input type="file" accept="image/*" onChange={handleAvatarFile} className="hidden" />
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
                </div>
              </div>
            </div>
          </section>

          <section className="panel p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Routines</h2>
                <p className="text-sm text-slate-400">Edit existing routines or add new ones.</p>
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
        </div>

        <div className="space-y-6">
          <section className="panel p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-white">Streaks</h2>
            <div className="mt-4 grid gap-3">
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
            </div>
          </section>

          {error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              {success}
            </div>
          ) : null}

          <div className="panel p-4 sm:p-6">
            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Pencil className="h-4 w-4" />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
