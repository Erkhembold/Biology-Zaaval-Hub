"use client";
import { useState } from "react";
import type { Flashcard } from "@/lib/supabase";

export default function TrueFalse({ cards }: { cards: Flashcard[] }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const c = cards[i];

  function choose(v: boolean) {
    if (picked !== null) return;
    setPicked(v);
    if (v === c.answer) setScore((s) => s + 1);
  }
  function next() {
    if (i + 1 >= cards.length) return setDone(true);
    setI(i + 1);
    setPicked(null);
  }
  function restart() {
    setI(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }

  if (done) {
    return (
      <div className="text-center">
        <p className="text-2xl font-extrabold text-green-700">
          {score}/{cards.length} correct
        </p>
        <button onClick={restart} className="mt-3 rounded-full bg-orange-600 px-5 py-2 font-semibold text-white">
          Try again
        </button>
      </div>
    );
  }

  const right = picked !== null && picked === c.answer;
  return (
    <div>
      <p className="text-sm text-slate-500">Card {i + 1} / {cards.length} · practice only, no XP</p>
      <p className="my-4 text-lg font-semibold">{c.statement}</p>
      <div className="flex gap-3">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            disabled={picked !== null}
            onClick={() => choose(v)}
            className={`flex-1 rounded-xl border-2 py-3 font-bold ${
              picked === null
                ? "border-slate-200 hover:border-green-400"
                : v === c.answer
                ? "border-green-600 bg-green-50"
                : picked === v
                ? "border-red-500 bg-red-50"
                : "border-slate-200 opacity-60"
            }`}
          >
            {v ? "True" : "False"}
          </button>
        ))}
      </div>
      {picked !== null && (
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className={`font-semibold ${right ? "text-green-700" : "text-red-600"}`}>{right ? "Correct!" : "Not quite."}</p>
          <p className="mt-1 text-slate-700">{c.explanation}</p>
          <button onClick={next} className="mt-3 rounded-full bg-green-600 px-5 py-2 font-semibold text-white">
            {i + 1 >= cards.length ? "Finish" : "Next card"}
          </button>
        </div>
      )}
    </div>
  );
}
