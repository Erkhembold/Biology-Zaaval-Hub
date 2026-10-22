"use client";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { supabase, type Quiz } from "@/lib/supabase";
import { awardXp, useProfile } from "@/lib/useProfile";

const SECONDS = 20;
const LETTERS = ["A", "B", "C", "D"];

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { profile, refresh } = useProfile();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(SECONDS);
  const [done, setDone] = useState(false);

  useEffect(() => {
    supabase.from("quizzes").select("*").eq("id", id).single().then(({ data }) => setQuiz(data as Quiz));
  }, [id]);

  const q = quiz?.questions[i];

  const confirm = useCallback(
    async (choice: number | null) => {
      if (!q || confirmed) return;
      setConfirmed(true);
      if (choice !== null && q.options[choice] === q.answer) {
        setScore((s) => s + 1);
        if (profile) {
          await awardXp(1); // +5 XP, synced immediately
          refresh();
        }
      }
    },
    [q, confirmed, profile, refresh]
  );

  useEffect(() => {
    if (!q || confirmed || done) return;
    if (time <= 0) {
      confirm(picked);
      return;
    }
    const t = setTimeout(() => setTime((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [time, q, confirmed, done, picked, confirm]);

  function next() {
    if (!quiz) return;
    if (i + 1 >= quiz.questions.length) return setDone(true);
    setI(i + 1);
    setPicked(null);
    setConfirmed(false);
    setTime(SECONDS);
  }

  if (!quiz) return <p className="p-8 text-center text-slate-500">Loading...</p>;

  if (done) {
    return (
      <section className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-3xl font-extrabold text-green-700">Quiz complete</h1>
          <p className="mt-4 text-5xl font-extrabold text-orange-600">
            {score}/{quiz.questions.length}
          </p>
          <p className="mt-2 text-slate-600">
            {profile ? `+${score * 5} XP earned` : "Sign in to earn XP for correct answers."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/lessons" className="rounded-full bg-green-600 px-5 py-2 font-semibold text-white">Lessons</Link>
            {!profile && <Link href="/login" className="rounded-full bg-orange-600 px-5 py-2 font-semibold text-white">Sign in</Link>}
          </div>
        </div>
      </section>
    );
  }

  const isCorrect = confirmed && picked !== null && q!.options[picked] === q!.answer;

  return (
    <section className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-4 text-2xl font-bold text-green-700">{quiz.topic_name} quiz</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-green-600 to-green-700 p-6 text-white shadow">
          <div className="flex items-center justify-between text-sm">
            <span>Question {i + 1} / {quiz.questions.length}</span>
            <span className={`rounded-full px-3 py-1 font-bold ${time <= 5 ? "bg-orange-500" : "bg-white/20"}`}>⏱ {time}s</span>
          </div>
          <p className="my-8 text-2xl font-semibold">{q!.question}</p>
          <div className="h-2 overflow-hidden rounded-full bg-white/25">
            <div className="h-full bg-orange-400 transition-all" style={{ width: `${(time / SECONDS) * 100}%` }} />
          </div>
        </div>

        <div className="space-y-3 rounded-2xl bg-white p-6 shadow">
          {q!.options.map((o, idx) => {
            const correct = confirmed && o === q!.answer;
            const wrong = confirmed && picked === idx && o !== q!.answer;
            return (
              <button
                key={o}
                disabled={confirmed}
                onClick={() => setPicked(idx)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition ${
                  correct
                    ? "border-green-600 bg-green-50"
                    : wrong
                    ? "border-red-500 bg-red-50"
                    : picked === idx
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-200 hover:border-green-400"
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 font-bold">{LETTERS[idx]}</span>
                {o}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow">
        {!confirmed ? (
          <div className="flex items-center justify-between">
            <span className="text-slate-600">
              {picked === null ? "Pick an answer" : `You chose ${LETTERS[picked]}`}
            </span>
            <button
              disabled={picked === null}
              onClick={() => confirm(picked)}
              className="rounded-full bg-orange-600 px-5 py-2 font-semibold text-white disabled:opacity-40"
            >
              Confirm answer
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className={`font-semibold ${isCorrect ? "text-green-700" : "text-red-600"}`}>
              {isCorrect ? (profile ? "Correct! +5 XP" : "Correct!") : `Not quite. Answer: ${q!.answer}`}
            </span>
            <button onClick={next} className="rounded-full bg-green-600 px-5 py-2 font-semibold text-white">
              {i + 1 >= quiz.questions.length ? "Finish" : "Next"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
