"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Avatar from "@/components/Avatar";
import { removeAvatar, uploadAvatar } from "@/lib/avatar";
import { supabase, type Duel, type Quiz, type QuizAttempt } from "@/lib/supabase";
import { useProfile } from "@/lib/useProfile";

const LEVEL_XP = 100; // XP needed per level

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, refresh } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [quizzes, setQuizzes] = useState<Pick<Quiz, "id" | "topic_name">[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [duels, setDuels] = useState<Duel[]>([]);
  const [rank, setRank] = useState<{ pos: number; of: number } | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("11B");

  const id = profile?.id;
  useEffect(() => {
    if (!id) return;
    supabase.from("quizzes").select("id, topic_name").order("created_at").then(({ data }) => setQuizzes(data ?? []));
    supabase.from("quiz_attempts").select("*").eq("user_id", id).order("created_at", { ascending: false })
      .then(({ data }) => setAttempts((data as QuizAttempt[]) ?? []));
    supabase.from("duels").select("*").eq("status", "completed").order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => setDuels((data as Duel[]) ?? []));
    supabase.from("profiles").select("id, xp_points").order("xp_points", { ascending: false }).then(({ data }) => {
      if (!data) return;
      const pos = data.findIndex((p) => p.id === id);
      setRank({ pos: pos + 1, of: data.length });
    });
  }, [id, profile?.xp_points]);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name);
      setGrade(profile.grade);
    }
  }, [profile]);

  if (loading) return <p className="p-10 text-center text-slate-500">Loading...</p>;
  if (!profile) {
    return (
      <section className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-green-700">You&apos;re not signed in</h1>
        <p className="mt-2 text-slate-600">Sign in to see your profile, XP and duel record.</p>
        <Link href="/login" className="mt-4 inline-block rounded-full bg-green-600 px-6 py-2 font-semibold text-white">Sign in</Link>
      </section>
    );
  }

  const xp = profile.xp_points;
  const level = Math.floor(xp / LEVEL_XP) + 1;
  const into = xp % LEVEL_XP;

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !profile) return;
    setPhotoBusy(true);
    setMsg("");
    try {
      const path = await uploadAvatar(profile.id, file);
      const { error } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", profile.id);
      if (error) throw new Error("Couldn't save your photo.");
      if (profile.avatar_path && profile.avatar_path !== path) removeAvatar(profile.avatar_path);
      await refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setPhotoBusy(false);
    }
  }

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    const { error } = await supabase.from("profiles").update({ full_name: name.trim(), grade }).eq("id", profile.id);
    if (error) setMsg("Couldn't save changes.");
    else {
      setMsg("");
      setEditing(false);
      refresh();
    }
  }

  // duel record
  const mine = duels.map((d) => {
    const host = d.host_id === profile.id;
    const my = host ? d.host_score : d.guest_score;
    const their = host ? d.guest_score : d.host_score;
    return { d, my, their, other: (host ? d.guest_name : d.host_name) || "Opponent" };
  });
  const won = mine.filter((m) => m.my > m.their).length;
  const drawn = mine.filter((m) => m.my === m.their).length;
  const lost = mine.length - won - drawn;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      {/* header */}
      <header className="rounded-2xl bg-white p-6 shadow">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={photoBusy}
            aria-label="Change profile photo"
            className="group relative shrink-0 self-start"
          >
            <Avatar path={profile.avatar_path} name={profile.full_name} size={88} />
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
              {photoBusy ? "Uploading" : "Change"}
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={onPhoto} />

          <div className="flex-1">
            <h1 className="text-3xl font-extrabold">{profile.full_name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700">Grade {profile.grade}</span>
              {rank && (
                <Link href="/leaderboard" className="rounded-full bg-orange-100 px-3 py-1 font-semibold text-orange-700">
                  Rank #{rank.pos} of {rank.of}
                </Link>
              )}
              <button onClick={() => setEditing((v) => !v)} className="text-slate-600 underline">
                {editing ? "Cancel" : "Edit profile"}
              </button>
            </div>
          </div>

          <dl className="flex gap-6">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Total XP</dt>
              <dd className="text-3xl font-extrabold text-orange-600">{xp.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Level</dt>
              <dd className="text-3xl font-extrabold text-green-700">{level}</dd>
            </div>
          </dl>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/");
            }}
            className="self-start rounded-full border border-slate-300 px-4 py-1.5 text-sm hover:bg-slate-100"
          >
            Sign out
          </button>
        </div>

        {editing && (
          <form onSubmit={saveDetails} className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-end">
            <label className="flex-1 text-sm">
              <span className="mb-1 block font-medium">Full name</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm">
              <span className="mb-1 block font-medium">Class</span>
              <select value={grade} onChange={(e) => setGrade(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2">
                {["11A", "11B", "11C", "11D"].map((g) => <option key={g}>{g}</option>)}
              </select>
            </label>
            <button className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white">Save</button>
          </form>
        )}
        {msg && <p className="mt-3 text-sm text-orange-700" role="alert">{msg}</p>}

        {/* level progress */}
        <div className="mt-6 flex items-center gap-3 text-sm font-medium">
          <span>Level {level}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-orange-500" style={{ width: `${(into / LEVEL_XP) * 100}%` }} />
          </div>
          <span>Level {level + 1}</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">{LEVEL_XP - into} XP to level {level + 1}</p>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* progress */}
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">Your progress</h2>
          <div className="mt-4 space-y-3">
            {quizzes.map((q) => {
              const a = attempts.filter((x) => x.quiz_id === q.id);
              const best = a.reduce((m, x) => Math.max(m, Math.round((x.correct / x.total) * 100)), 0);
              return (
                <Link key={q.id} href={`/lessons/${q.id}/quiz`} className="block rounded-xl border border-slate-200 p-4 hover:border-green-400">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{q.topic_name}</span>
                    <span className="text-sm text-orange-600">{a.length ? `Best ${best}%` : "Not tried"}</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full bg-green-600" style={{ width: `${best}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {a.length ? `${a.length} attempt${a.length === 1 ? "" : "s"}` : "Take the quiz to start tracking"}
                  </p>
                </Link>
              );
            })}
            {quizzes.length === 0 && <p className="text-slate-500">No lessons yet.</p>}
          </div>
        </section>

        {/* duels */}
        <section className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-xl font-bold">Duel record</h2>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
            {[["Played", mine.length], ["Won", won], ["Drawn", drawn], ["Lost", lost]].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-slate-50 p-3">
                <div className="text-2xl font-extrabold text-green-700">{v}</div>
                <div className="text-xs text-slate-500">{l}</div>
              </div>
            ))}
          </div>
          <ul className="mt-4 divide-y divide-slate-100">
            {mine.slice(0, 5).map(({ d, my, their, other }) => (
              <li key={d.id} className="flex items-center justify-between py-2 text-sm">
                <span>vs {other}</span>
                <span className={`font-semibold ${my > their ? "text-green-700" : my === their ? "text-slate-600" : "text-red-600"}`}>
                  {my} – {their} · {my > their ? "Win" : my === their ? "Draw" : "Loss"}
                </span>
              </li>
            ))}
            {mine.length === 0 && <li className="py-2 text-sm text-slate-500">No duels yet. Challenge a classmate!</li>}
          </ul>
          <Link href="/games" className="mt-4 inline-block rounded-full bg-orange-600 px-5 py-2 text-sm font-semibold text-white">Start a duel</Link>
        </section>
      </div>
    </section>
  );
}
