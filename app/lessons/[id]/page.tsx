"use client";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import TrueFalse from "@/components/TrueFalse";
import { supabase, type NoteSection, type Quiz } from "@/lib/supabase";

const FALLBACK: Record<string, NoteSection[]> = {
  "Biologiin Moleculuud": [
    {
      heading: "Biological molecules",
      bullets: [
        "Carbohydrates store and supply energy (glucose, starch, glycogen).",
        "Lipids store long-term energy and form cell membranes.",
        "Proteins are chains of amino acids and do most of the work in cells.",
        "Nucleic acids (DNA, RNA) carry genetic information.",
      ],
    },
  ],
};

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    supabase.from("quizzes").select("*").eq("id", id).single().then(({ data }) => setQuiz(data as Quiz));
  }, [id]);

  if (!quiz) return <p className="p-8 text-center text-slate-500">Loading...</p>;
  const sections = quiz.lesson_notes ?? FALLBACK[quiz.topic_name] ?? [{ heading: "Notes", bullets: ["Lesson notes coming soon."] }];

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/lessons" className="text-sm text-green-700 hover:underline">← All lessons</Link>
      <h1 className="mt-2 text-4xl font-extrabold text-green-700">{quiz.topic_name}</h1>

      <div className="mt-6 space-y-6">
        {sections.map((s, n) => (
          <article key={s.heading} className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-3 text-xl font-bold">
              <span className="mr-2 text-orange-600">{n + 1}.</span>
              {s.heading}
            </h2>
            {s.table && (
              <div className="mb-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-green-600 text-white">
                    <tr>{s.table.headers.map((h) => <th key={h} className="p-2">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {s.table.rows.map((r, ri) => (
                      <tr key={ri} className="border-t border-slate-100 odd:bg-slate-50">
                        {r.map((cell, ci) => (
                          <td key={ci} className={`p-2 ${ci === 0 ? "font-semibold" : ""}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {s.bullets && (
              <ul className="space-y-2">
                {s.bullets.map((b) => (
                  <li key={b} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>

      {quiz.flashcards && quiz.flashcards.length > 0 && (
        <article className="mt-6 rounded-2xl border-l-4 border-orange-500 bg-white p-6 shadow">
          <h2 className="mb-3 text-xl font-bold">Quick check: true or false?</h2>
          <TrueFalse cards={quiz.flashcards} />
        </article>
      )}

      <Link href={`/lessons/${id}/quiz`} className="mt-6 inline-block rounded-full bg-orange-600 px-6 py-2.5 font-semibold text-white hover:bg-orange-700">
        Take the quiz
      </Link>
    </section>
  );
}
