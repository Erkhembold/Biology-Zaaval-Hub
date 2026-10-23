"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { supabase, type Duel } from "@/lib/supabase";
import { useProfile } from "@/lib/useProfile";

type Result = { correct: boolean; answer: string };

export default function DuelRoom() {
  const { profile, loading, refresh } = useProfile();
  const [duel, setDuel] = useState<Duel | null>(null);
  const [tab, setTab] = useState<"create" | "join">("create");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [shown, setShown] = useState(0); // question index currently on screen
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [time, setTime] = useState(0);

  const duelId = duel?.id;
  const uid = profile?.id;

  // Resume an unfinished duel after a page refresh
  useEffect(() => {
    if (!uid) return;
    supabase
      .from("duels")
      .select("*")
      .neq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        const d = (data?.[0] as Duel | undefined) ?? null;
        if (d) {
          setDuel(d);
          setShown(d.host_id === uid ? d.host_progress : d.guest_progress);
        }
      });
  }, [uid]);

  // Live updates: realtime + a light poll as a safety net
  useEffect(() => {
    if (!duelId) return;
    let gone = false;
    const apply = (d: Duel | null) => {
      if (gone) return;
      if (!d) {
        setDuel(null);
        setError("The duel was closed (your opponent left).");
      } else setDuel(d);
    };
    const ch = supabase
      .channel(`duel-${duelId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "duels", filter: `id=eq.${duelId}` }, (p) => {
        if (p.eventType === "DELETE") apply(null);
        else apply(p.new as Duel);
      })
      .subscribe();
    const t = setInterval(async () => {
      const { data } = await supabase.from("duels").select("*").eq("id", duelId).maybeSingle();
      apply((data as Duel | null) ?? null);
    }, 2500);
    return () => {
      gone = true;
      clearInterval(t);
      supabase.removeChannel(ch);
    };
  }, [duelId]);

  const isHost = !!duel && duel.host_id === uid;
  const total = duel?.questions.length ?? 0;
  const q = duel?.questions[shown];

  const submit = useCallback(
    async (given: string) => {
      if (!duel || result) return;
      setBusy(true);
      const { data, error } = await supabase.rpc("answer_duel", { p_id: duel.id, p_idx: shown, p_given: given });
      setBusy(false);
      if (error) return setError(error.message);
      setResult(data as Result);
      refresh();
    },
    [duel, shown, result, refresh]
  );

  // timer for typed questions
  useEffect(() => {
    if (duel?.status !== "playing" || !q || q.kind !== "typed" || result) return;
    setTime(q.time ?? 12);
  }, [duel?.status, q, shown, result]);
  useEffect(() => {
    if (duel?.status !== "playing" || !q || q.kind !== "typed" || result || busy) return;
    if (time <= 0) {
      submit(typed);
      return;
    }
    const t = setTimeout(() => setTime((x) => x - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, duel?.status, q, result, busy]);

  async function call<T>(fn: () => PromiseLike<{ data: T | null; error: { message: string } | null }>) {
    setBusy(true);
    setError("");
    const { data, error } = await fn();
    setBusy(false);
    if (error) {
      setError(error.message);
      return null;
    }
    return data;
  }

  async function create() {
    const d = (await call(() => supabase.rpc("create_duel"))) as Duel | null;
    if (d) {
      setDuel(d);
      setShown(0);
    }
  }
  async function join() {
    const d = (await call(() => supabase.rpc("join_duel", { p_pin: pin }))) as Duel | null;
    if (d) {
      setDuel(d);
      setShown(0);
    }
  }
  async function start() {
    if (!duel) return;
    const d = (await call(() => supabase.rpc("start_duel", { p_id: duel.id }))) as Duel | null;
    if (d) setDuel(d);
  }
  async function leave() {
    if (duel && duel.status !== "completed") await supabase.rpc("leave_duel", { p_id: duel.id });
    setDuel(null);
    setResult(null);
    setTyped("");
    setShown(0);
    setPin("");
  }
  function next() {
    setResult(null);
    setTyped("");
    setShown((s) => s + 1);
  }

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (!profile) {
    return (
      <div>
        <p className="text-slate-600">Sign in to challenge a classmate with a PIN.</p>
        <Link href="/login" className="mt-3 inline-block rounded-full bg-green-600 px-6 py-2 font-semibold text-white">Sign in</Link>
      </div>
    );
  }

  // ---------- landing ----------
  if (!duel) {
    return (
      <div>
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          {(["create", "join"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); }}
              className={`rounded-lg py-2 text-sm font-semibold ${tab === t ? "bg-white shadow text-green-700" : "text-slate-600"}`}
            >
              {t === "create" ? "Create a duel" : "Join with a PIN"}
            </button>
          ))}
        </div>
        {tab === "create" ? (
          <>
            <p className="mb-4 text-slate-600">
              You&apos;ll get a 4-digit PIN to share with a friend. Both of you answer the same 5 questions, +5 XP for every correct answer.
            </p>
            <button onClick={create} disabled={busy} className="w-full rounded-xl bg-green-600 py-4 text-2xl font-extrabold text-white shadow hover:bg-green-700 disabled:opacity-60">
              {busy ? "Creating..." : "Start"}
            </button>
          </>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); if (pin.length === 4) join(); }}
            className="space-y-3"
          >
            <label className="block text-sm font-medium" htmlFor="duel-pin">4-digit PIN</label>
            <input
              id="duel-pin"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="0000"
              className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-center font-mono text-3xl tracking-[0.5em]"
            />
            <button disabled={busy || pin.length !== 4} className="w-full rounded-xl bg-orange-600 py-3 text-lg font-bold text-white disabled:opacity-50">
              {busy ? "Joining..." : "Join duel"}
            </button>
          </form>
        )}
        {error && <p className="mt-3 text-sm text-orange-700" role="alert">{error}</p>}
      </div>
    );
  }

  const meName = isHost ? duel.host_name : duel.guest_name;
  const otherName = (isHost ? duel.guest_name : duel.host_name) || "Opponent";
  const myScore = isHost ? duel.host_score : duel.guest_score;
  const theirScore = isHost ? duel.guest_score : duel.host_score;
  const theirProgress = isHost ? duel.guest_progress : duel.host_progress;
  const myProgress = isHost ? duel.host_progress : duel.guest_progress;

  // ---------- lobby ----------
  if (duel.status === "waiting") {
    return (
      <div className="text-center">
        <h3 className="text-xl font-bold">Waiting for your opponent</h3>
        <p className="mt-1 text-slate-600">Share this PIN with your friend so they can join.</p>
        <div className="my-4 rounded-2xl bg-green-50 py-5 font-mono text-6xl font-extrabold tracking-[0.3em] text-green-700">{duel.pin}</div>
        <p className="text-sm text-slate-500">This page updates by itself when they join.</p>
        <button onClick={leave} className="mt-4 rounded-full border border-slate-300 px-5 py-2 text-sm hover:bg-slate-100">Cancel duel</button>
      </div>
    );
  }

  if (duel.status === "ready") {
    return (
      <div className="text-center">
        <h3 className="text-xl font-bold">{isHost ? `${otherName} joined!` : `You joined ${duel.host_name}'s duel`}</h3>
        <p className="mt-1 text-slate-600">{meName} vs {otherName} · 5 questions</p>
        {isHost ? (
          <button onClick={start} disabled={busy} className="mt-5 w-full rounded-xl bg-green-600 py-4 text-2xl font-extrabold text-white shadow hover:bg-green-700">
            Start duel
          </button>
        ) : (
          <p className="mt-5 rounded-xl bg-orange-50 py-4 font-semibold text-orange-700">Waiting for {duel.host_name} to start...</p>
        )}
        <button onClick={leave} className="mt-4 rounded-full border border-slate-300 px-5 py-2 text-sm hover:bg-slate-100">Leave</button>
        {error && <p className="mt-3 text-sm text-orange-700">{error}</p>}
      </div>
    );
  }

  // ---------- results ----------
  if (duel.status === "completed") {
    const win = myScore > theirScore;
    const draw = myScore === theirScore;
    return (
      <div className="text-center">
        <p className="text-3xl font-extrabold text-green-700">{win ? "You win!" : draw ? "It's a draw" : `${otherName} wins`}</p>
        <div className="my-4 flex items-center justify-center gap-6">
          <div><div className="text-xs text-slate-500">You</div><div className="text-4xl font-extrabold">{myScore}</div></div>
          <span className="text-slate-400">vs</span>
          <div><div className="text-xs text-slate-500">{otherName}</div><div className="text-4xl font-extrabold">{theirScore}</div></div>
        </div>
        <p className="text-orange-600">+{myScore * 5} XP earned</p>
        <button onClick={leave} className="mt-4 rounded-full bg-orange-600 px-6 py-2 font-semibold text-white">Play again</button>
      </div>
    );
  }

  // ---------- playing ----------
  const finishedMine = shown >= total;
  return (
    <div>
      <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm">
        <span className="font-semibold text-green-700">You: {myScore} ✓</span>
        <span className="text-slate-500">Question {Math.min(shown + 1, total)}/{total}</span>
        <span className="font-semibold text-orange-600">{otherName}: {theirScore} ✓ ({theirProgress}/{total})</span>
      </div>

      {finishedMine ? (
        <div className="py-6 text-center">
          <p className="text-lg font-semibold">You finished! Score {myScore}/{total}</p>
          <p className="mt-1 text-slate-600">Waiting for {otherName} to finish ({theirProgress}/{total})...</p>
        </div>
      ) : (
        q && (
          <>
            <p className="mb-3 text-lg font-semibold">{q.question}</p>
            {q.kind === "mc" ? (
              <div className="grid gap-2">
                {q.options?.map((o) => {
                  const good = !!result && o === result.answer;
                  return (
                    <button
                      key={o}
                      disabled={!!result || busy}
                      onClick={() => { setTyped(o); submit(o); }}
                      className={`rounded-lg border-2 p-2 text-left ${
                        good ? "border-green-600 bg-green-50"
                        : result && typed === o ? "border-red-500 bg-red-50"
                        : "border-slate-200 hover:border-green-400"
                      }`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); submit(typed); }} className="space-y-2">
                {!result && <p className="text-sm font-bold text-orange-600">⏱ {time}s</p>}
                <input
                  autoFocus
                  disabled={!!result}
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="Type your answer"
                  className="w-full rounded-lg border-2 border-slate-200 px-3 py-2"
                />
                {!result && <button disabled={busy} className="rounded-full bg-orange-600 px-5 py-2 font-semibold text-white">Submit</button>}
                {result && <p className="text-sm text-slate-600">Answer: <b>{result.answer}</b></p>}
              </form>
            )}
            {result && (
              <div className="mt-3">
                <p className={`font-semibold ${result.correct ? "text-green-700" : "text-red-600"}`}>
                  {result.correct ? "Correct! +5 XP" : `Not quite. Answer: ${result.answer}`}
                </p>
                <button onClick={next} className="mt-2 rounded-full bg-green-600 px-5 py-2 font-semibold text-white">
                  {shown + 1 >= total ? "Finish" : "Next question"}
                </button>
              </div>
            )}
          </>
        )
      )}
      {error && <p className="mt-3 text-sm text-orange-700" role="alert">{error}</p>}
      <p className="mt-4 text-xs text-slate-400">Your progress: {myProgress}/{total}</p>
    </div>
  );
}
