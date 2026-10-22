"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const router = useRouter();
  const [failed, setFailed] = useState("");

  useEffect(() => {
    (async () => {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const err = url.searchParams.get("error_description") || hash.get("error_description");
      if (err) return setFailed(err);

      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          // Opened on a different browser/device than the one that signed up: the email is
          // still confirmed, the student just has to sign in once.
          const { data } = await supabase.auth.getSession();
          if (!data.session) return setFailed("Your email is confirmed. Please sign in to continue.");
        }
      } else {
        // implicit-flow links put the tokens in the #hash, which the client picks up on load
        await new Promise((r) => setTimeout(r, 300));
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) router.replace("/lessons");
      else setFailed("Your email is confirmed. Please sign in to continue.");
    })();
  }, [router]);

  return (
    <section className="mx-auto max-w-md px-4 py-20 text-center">
      {failed ? (
        <div className="rounded-2xl bg-white p-8 shadow">
          <p className="text-slate-700">{failed}</p>
          <Link href="/login" className="mt-4 inline-block rounded-full bg-green-600 px-6 py-2 font-semibold text-white">
            Sign in
          </Link>
        </div>
      ) : (
        <p className="text-slate-600">Confirming your email and signing you in...</p>
      )}
    </section>
  );
}
