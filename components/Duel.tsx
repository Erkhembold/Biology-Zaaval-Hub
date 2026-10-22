"use client";
import { useEffect, useState } from "react";
import { supabase, type Quiz } from "@/lib/supabase";
import { awardXp, useProfile } from "@/lib/useProfile";

type Item =
  | { kind: "mc"; question: string; options: string[]; answer: string }
  | { kind: "typed"; question: string; answer: string; accepted: string[]; time: number };

type Phase = "idle" | "playing" | "done";
type Reveal = { correct: boolean; botCorrect: boolean; shown: string };

const norm = (s: string) =>
  s.toLowerCase().replace(/[–—]/g, "-").replace(/°c?/g, "").replace(/[^a-z0-9 -]/g, "").replace(/\s+/g, " ").trim();

export default function Duel() {
  const { profile, refresh } = useProfile();
  const [phase, setPhase] = useState<Phase>("idle");
  const [items, setItems] = useState<Item[]>([]);
  const [i, setI] = useState(0);
  const [me, setMe] = useState(0);
  const [bot, setBot] = useState(0);
  const [reveal, setReveal] = useState<Reveal | null>(null);
  const [typed, setTyped] = useState("");
  const [time, setTime] = useState(0);

  const item = items[i];

  async function start() {
    const { data } = await supabase.from("quizzes").select("*");
    const quizzes = (data as Quiz[]) ?? [];
    const pool: Item[] = quizzes.flatMap((q) => [
      ...(q.duel_questions ?? []).map((d) => ({ kind: "typed" as const, ...d })),
      ...q.questions.map((m) => ({ kind: "mc" as const, question: m.question, options: m.options, answer: m.answer })),
    ]);
    setItems(pool.sort(() => Math.random() - 0.5).slice(0, 5));
    setI(0);
    setMe(0);
    setBot(0);
    setReveal(null);
    setTyped("");
    setPhase("playing");
  }

  async function submit(given: string) {
    if (reveal || !item) return;
    const correct =
      item.kind === "mc"
        ? given === item.answer
        : [item.answer, ...item.accepted].map(norm).includes(norm(given));
    const botCorrect = Math.random() < 0.6; // simulated opponent
    setReveal({ correct, botCorrect, shown: given });
    if (correct) {
      setMe((m) => m + 1);
      if (profile) {
        await awardXp(1); // +5 XP per correct answer
        refresh();
      }
    }
    if (botCorrect) setBot((b) => b + 1);
  }

  // countdown for typed questions
  useEffect(() => {
    if (phase !== "playing" || !item || item.kind !== "typed" || reveal) return;
    setTime(item.time);
  }, [phase, item, reveal]);

  useEffect(() => {
    if (phase !== "playing" || !item || item.kind !== "typed" || reveal) return;
    if (time <= 0) {
      submit(typed);
      return;
    }
    const t = setTimeout(() => setTime((x) => x - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time, phase, item, reveal]);

  function next() {
    setReveal(null);
    setTyped("");
    if (i + 1 >= items.length) setPhase("done");
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

  return (
    <div>
      <div className="mb-3 flex justify-between text-sm font-semibold">
        <span className="text-green-700">You: {me}</span>
        <span>Round {i + 1}/{items.length}</span>
        <span className="text-orange-600">Opponent: {bot}</span>
      </div>
      <p className="mb-3 text-lg font-semibold">{item.question}</p>

      {item.kind === "mc" ? (
        <div className="grid gap-2">
          {item.options.map((o) => {
            const good = !!reveal && o === item.answer;
            const bad = !!reveal && reveal.shown === o && o !== item.answer;
            return (
              <button
                key={o}
                disabled={!!reveal}
                onClick={() => submit(o)}
                className={`rounded-lg border-2 p-2 text-left ${good ? "border-green-600 bg-green-50" : bad ? "border-red-500 bg-red-50" : "border-slate-200 hover:border-green-400"}`}
              >
                {o}
              </button>
            );
          })}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit(typed);
          }}
          className="space-y-2"
        >
          {!reveal && <p className="text-sm font-bold text-orange-600">⏱ {time}s</p>}
          <input
            autoFocus
            disabled={!!reveal}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="Type your answer"
            className="w-full rounded-lg border-2 border-slate-200 px-3 py-2"
          />
          {!reveal && (
            <button className="rounded-full bg-orange-600 px-5 py-2 font-semibold text-white">Submit</button>
          )}
          {reveal && <p className="text-sm text-slate-600">Answer: <b>{item.answer}</b></p>}
        </form>
      )}

      {reveal && (
        <div className="mt-3">
          <p className={`font-semibold ${reveal.correct ? "text-green-700" : "text-red-600"}`}>
            {reveal.correct ? (profile ? "Correct! +5 XP" : "Correct!") : "Not quite."}{" "}
            <span className="text-sm font-normal text-orange-600">
              Opponent {reveal.botCorrect ? "got it right" : "missed"}
            </span>
          </p>
          <button onClick={next} className="mt-2 rounded-full bg-green-600 px-5 py-2 font-semibold text-white">
            {i + 1 >= items.length ? "Finish" : "Next round"}
          </button>
        </div>
      )}
    </div>
  );
}
