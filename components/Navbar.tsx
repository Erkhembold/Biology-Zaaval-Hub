"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Avatar from "@/components/Avatar";
import { useProfile } from "@/lib/useProfile";

const links = [
  { href: "/lessons", label: "Lessons" },
  { href: "/games", label: "Games" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export default function Navbar() {
  const path = usePathname();
  const { profile } = useProfile();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-3 py-2 sm:px-4 sm:py-3">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="Oyunlag Biology zaaval logo" width={40} height={40} priority />
          <span className="text-sm font-bold text-green-700 sm:text-base">Oyunlag Biology zaaval</span>
        </Link>
        <ul className="flex flex-wrap items-center gap-1 text-xs font-medium sm:gap-3 sm:text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`rounded-full px-2.5 py-1.5 transition sm:px-3 ${
                  path.startsWith(l.href) ? "bg-green-600 text-white" : "text-slate-700 hover:bg-green-50"
                }`}
              >
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            {profile ? (
              <Link
                href="/profile"
                className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 transition ${
                  path.startsWith("/profile") ? "border-green-600 bg-green-50" : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Avatar path={profile.avatar_path} name={profile.full_name} size={30} />
                <span className="hidden sm:inline">{profile.full_name}</span>
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700">{profile.xp_points} XP</span>
              </Link>
            ) : (
              <Link href="/login" className="whitespace-nowrap rounded-full bg-orange-600 px-3 py-1.5 text-white hover:bg-orange-700 sm:px-4">
                Sign in / Profile
              </Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}
