"use client";
import { useState } from "react";
import { supabase, type Question, type Quiz } from "@/lib/supabase";
import { awardXp, useProfile } from "@/lib/useProfile";

type Phase = "idle" | "playing" | "done";

export default function Duel() {
  const { profile, refresh } = useProfile();
  const [phase, setPhase] = useState<Phase>("idle");
  const [qs, setQs] = useState<Question[]>([]);
  const [i, setI] = useState(0);
  const [me, setMe] = useState(0);
  const [bot, setBot] = useState(0);
  const [reveal, setReveal] = useState<{ pick: string; botPick: string } | null>(null);

  async function start() {
    const { data } = await supabase.from("quizzes").select("*");
    const all = ((data as Quiz[]) ?? []).flatMap((q) => q.questions);
    const picked = all.sort(() => Math.random() - 0.5).slice(0, 5);
    setQs(picked);
    setI(0);
    setMe(0);
    setBot(0);
    setReveal(null);
    setPhase("playing");
  }

  async function answer(opt: string) {
    if (reveal) return;
    const q = qs[i];
    // Simulated opponent: answers correctly ~60% of the time
    const botCorrect = Math.random() < 0.6;
    const wrongs = q.options.filter((o) => o !== q.answer);
    const botPick = botCorrect ? q.answer : wrongs[Math.floor(Math.random() * wrongs.length)];
    setReveal({ pick: opt, botPick });
    if (opt === q.answer) {
      setMe((m) => m + 1);
      if (profile) {
        await awardXp(1); // +5 XP per correct answer
        refresh();
      }
    }
    if (botPick === q.answer) setBot((b) => b + 1);
  }

  function next() {
    setReveal(null);
    if (i + 1 >= qs.length) setPhase("done");
    else setI(i + 1);
  }

  if (phase === "idle") {
    return (
      <div>
        <p className="mb-4 text-slate-600">Answer 5 questions faster and better than your opponent. +5 XP for each correct answer.</p>
        <button onClick={start} className="w-full rounded-xl bg-green-600 py-4 text-2xl font-extrabold text-white shadow hover:bg-green-700">
          Start
        </button>
        {!profile && <p className="mt-3 text-sm text-orange-700">Sign in to earn XP from duels.</p>}
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="text-center">
        <p className="text-2xl font-extrabold text-green-700">{me > bot ? "You win!" : me === bot ? "It's a draw" : "Opponent wins"}</p>
        <p className="mt-2 text-lg">You {me} – {bot} Opponent</p>
        <button onClick={start} className="mt-4 rounded-full bg-orange-600 px-6 py-2 font-semibold text-white">Play again</button>
      </div>
    );
  }

  const q = qs[i];
  return (
    <div>
      <div className="mb-3 flex justify-between text-sm font-semibold">
        <span className="text-green-700">You: {me}</span>
        <span>Round {i + 1}/{qs.length}</span>
        <span className="text-orange-600">Opponent: {bot}</span>
      </div>
      <p className="mb-3 text-lg font-semibold">{q.question}</p>
      <div className="grid gap-2">
        {q.options.map((o) => {
          const show = !!reveal;
          const good = show && o === q.answer;
          const bad = show && reveal!.pick === o && o !== q.answer;
          return (
            <button
              key={o}
              disabled={show}
              onClick={() => answer(o)}
              className={`rounded-lg border-2 p-2 text-left ${good ? "border-green-600 bg-green-50" : bad ? "border-red-500 bg-red-50" : "border-slate-200 hover:border-green-400"}`}
            >
              {o}
              {show && reveal!.botPick === o && <span className="ml-2 text-xs text-orange-600">(opponent)</span>}
            </button>
          );
        })}
      </div>
      {reveal && (
        <button onClick={next} className="mt-3 rounded-full bg-green-600 px-5 py-2 font-semibold text-white">
          {i + 1 >= qs.length ? "Finish" : "Next round"}
        </button>
      )}
    </div>
  );
}
