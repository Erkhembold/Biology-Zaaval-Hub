"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase, type Profile } from "./supabase";

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from("profiles").select("*").eq("id", u.user.id).single();
    setProfile((data as Profile) ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refresh());
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  return { profile, loading, refresh };
}

/** +5 XP per correct answer. Returns the new XP total or null if not signed in. */
export async function awardXp(correct: number): Promise<number | null> {
  if (correct <= 0) return null;
  const { data, error } = await supabase.rpc("award_xp", { correct_answers: correct });
  if (error) return null;
  return data as number;
}
