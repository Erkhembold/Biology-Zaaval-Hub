"use client";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { supabase, type Quiz } from "@/lib/supabase";

const NOTES: Record<string, string[]> = {
  "Biologiin Moleculuud": [
    "Carbohydrates store and supply energy (glucose, starch, glycogen).",
    "Lipids store long-term energy and form cell membranes.",
    "Proteins are chains of amino acids and do most of the work in cells.",
    "Nucleic acids (DNA, RNA) carry genetic information.",
  ],
  Enzyme: [
    "Enzymes are biological catalysts, mostly proteins.",
    "The substrate binds to the enzyme's active site.",
    "Enzymes lower the activation energy of a reaction and are not used up.",
    "High temperature or extreme pH can denature an enzyme: it changes shape and loses function.",
  ],
};

export default function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  useEffect(() => {
    supabase.from("quizzes").select("*").eq("id", id).single().then(({ data }) => setQuiz(data as Quiz));
  }, [id]);

  if (!quiz) return <p className="p-8 text-center text-slate-500">Loading...</p>;
  const notes = NOTES[quiz.topic_name] ?? ["Lesson notes coming soon."];

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/lessons" className="text-sm text-green-700 hover:underline">← All lessons</Link>
      <h1 className="mt-2 text-4xl font-extrabold text-green-700">{quiz.topic_name}</h1>
      <ul className="mt-6 space-y-3 rounded-2xl bg-white p-6 shadow">
        {notes.map((n) => (
          <li key={n} className="flex gap-3">
            <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
            <span>{n}</span>
          </li>
        ))}
      </ul>
      <Link href={`/lessons/${id}/quiz`} className="mt-6 inline-block rounded-full bg-orange-600 px-6 py-2.5 font-semibold text-white hover:bg-orange-700">
        Take the quiz
      </Link>
    </section>
  );
}
