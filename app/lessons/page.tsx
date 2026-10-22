"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase, type Quiz } from "@/lib/supabase";

export default function LessonsPage() {
  const [quizzes, setQuizzes] = useState<Quiz[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase
      .from("quizzes")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setQuizzes(data as Quiz[]);
      });
  }, []);

  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-4xl font-extrabold text-green-700">11th grade</h1>
      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow">
        {error && <p className="p-4 text-orange-700">{error}</p>}
        {!quizzes && !error && <p className="p-4 text-slate-500">Loading...</p>}
        <ul className="divide-y divide-slate-100">
          {quizzes?.map((q, i) => (
            <li key={q.id} className="flex items-center justify-between gap-3 p-4">
              <span className="font-medium">
                {i + 1}. {q.topic_name}
              </span>
              <span className="flex gap-2">
                <Link href={`/lessons/${q.id}`} className="rounded-full bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700">
                  Lesson
                </Link>
                <Link href={`/lessons/${q.id}/quiz`} className="rounded-full bg-orange-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-orange-700">
                  Quiz
                </Link>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-6 text-center text-slate-500">More soon when we learn more lessons</p>
    </section>
  );
}
