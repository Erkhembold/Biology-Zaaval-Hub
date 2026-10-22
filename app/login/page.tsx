"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/lib/useProfile";

export default function LoginPage() {
  const router = useRouter();
  const { profile } = useProfile();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg("Account created. Check your email to confirm, then sign in.");
      else router.push("/lessons");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else router.push("/lessons");
    }
    setBusy(false);
  }

  if (profile) {
    return (
      <section className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-green-700">{profile.full_name}</h1>
          <p className="mt-2 text-slate-600">Grade {profile.grade}</p>
          <p className="mt-4 text-4xl font-extrabold text-orange-600">{profile.xp_points} XP</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-4 py-16">
      <form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-8 shadow">
        <h1 className="text-2xl font-bold text-green-700">{mode === "in" ? "Sign in" : "Create account"}</h1>
        {mode === "up" && (
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        )}
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <input
          required
          type="password"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 6 characters)"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        {msg && <p className="text-sm text-orange-700">{msg}</p>}
        <button disabled={busy} className="w-full rounded-lg bg-green-600 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-60">
          {mode === "in" ? "Sign in" : "Sign up"}
        </button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="w-full text-sm text-slate-600 underline">
          {mode === "in" ? "No account? Sign up" : "Have an account? Sign in"}
        </button>
      </form>
    </section>
  );
}
