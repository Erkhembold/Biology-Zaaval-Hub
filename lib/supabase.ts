"use client";
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Question = { question: string; options: string[]; answer: string };
export type Quiz = { id: string; topic_name: string; questions: Question[]; created_at: string };
export type Profile = { id: string; full_name: string; grade: string; xp_points: number };
