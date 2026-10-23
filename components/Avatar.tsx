"use client";
import { avatarUrl } from "@/lib/avatar";

export default function Avatar({ path, name, size = 40 }: { path?: string | null; name: string; size?: number }) {
  const url = avatarUrl(path);
  const style = { width: size, height: size, fontSize: size * 0.42 };
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt={name} style={style} className="shrink-0 rounded-full object-cover" />
  ) : (
    <span
      style={style}
      className="flex shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700"
      aria-label={name}
    >
      {name.charAt(0).toUpperCase() || "?"}
    </span>
  );
}
