"use client";
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Question = {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  difficulty?: string;
};
export type DuelQuestion = { question: string; answer: string; accepted: string[]; time: number };
export type Flashcard = { statement: string; answer: boolean; explanation: string };
export type NoteSection = {
  heading: string;
  bullets?: string[];
  table?: { headers: string[]; rows: string[][] };
};
export type Quiz = {
  id: string;
  topic_name: string;
  questions: Question[];
  lesson_notes: NoteSection[] | null;
  duel_questions: DuelQuestion[] | null;
  flashcards: Flashcard[] | null;
  created_at: string;
};
export type Profile = { id: string; full_name: string; grade: string; xp_points: number };
