"use client";
import { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import { supabase, type Profile } from "@/lib/supabase";

function weekEnd() {
  // End of the current week: next Monday 00:00 local time
  const d = new Date();
  const end = new Date(d);
  end.setHours(0, 0, 0, 0);
  end.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
  return end.getTime();
}

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Profile[] | null>(null);
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .order("xp_points", { ascending: false })
      .limit(100)
      .then(({ data }) => setRows((data as Profile[]) ?? []));
  }, []);

  useEffect(() => {
    const tick = () => setLeft(Math.max(0, weekEnd() - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");
  const s = left === null ? 0 : Math.floor(left / 1000);
  const parts = [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-extrabold text-green-700">Leaderboard</h1>

      <div className="mt-6 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-center text-white shadow">
        <p className="text-sm uppercase tracking-wide opacity-90">Week ends in</p>
        <p className="mt-1 font-mono text-4xl font-extrabold" suppressHydrationWarning>
          {left === null ? "-- : -- : -- : --" : parts.map(pad).join(" : ")}
        </p>
        <p className="mt-1 text-xs opacity-80">days / hours / min / sec</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow">
        <table className="w-full text-left">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="p-3">Rank</th>
              <th className="p-3">Student</th>
              <th className="p-3">Grade</th>
              <th className="p-3 text-right">XP</th>
            </tr>
          </thead>
          <tbody>
            {rows?.map((p, i) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="p-3 font-bold">{i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</td>
                <td className="flex items-center gap-2 p-3">
                  <Avatar path={p.avatar_path} name={p.full_name} size={32} />
                  {p.full_name}
                </td>
                <td className="p-3">{p.grade}</td>
                <td className="p-3 text-right font-bold text-green-700">{p.xp_points}</td>
              </tr>
            ))}
            {rows && rows.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-slate-500">No students yet. Sign up to be first!</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
