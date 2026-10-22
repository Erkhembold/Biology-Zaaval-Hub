"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/lib/useProfile";

const links = [
  { href: "/lessons", label: "Lessons" },
  { href: "/games", label: "Games" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const path = usePathname();
  const router = useRouter();
  const { profile } = useProfile();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="Oyunlag Biology zaaval logo" width={40} height={40} priority />
          <span className="font-bold text-green-700">Oyunlag Biology zaaval</span>
        </Link>
        <ul className="flex items-center gap-1 text-sm font-medium sm:gap-3">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`rounded-full px-3 py-1.5 transition ${
                  path.startsWith(l.href) ? "bg-green-600 text-white" : "text-slate-700 hover:bg-green-50"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            {profile ? (
              <div className="flex items-center gap-2">
                <span className="hidden rounded-full bg-orange-100 px-3 py-1.5 text-orange-700 sm:inline">
                  {profile.full_name} · {profile.xp_points} XP
                </span>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.refresh();
                  }}
                  className="rounded-full border border-slate-300 px-3 py-1.5 hover:bg-slate-100"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link href="/login" className="rounded-full bg-orange-600 px-4 py-1.5 text-white hover:bg-orange-700">
                Sign in / Profile
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}
