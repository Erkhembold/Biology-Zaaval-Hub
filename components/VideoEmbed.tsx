"use client";
import Image from "next/image";
import { useState } from "react";

export default function VideoEmbed({ id }: { id: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-lg">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube.com/embed/${id}?autoplay=1`}
          title="Biology video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button onClick={() => setPlaying(true)} className="group absolute inset-0 h-full w-full" aria-label="Play video">
          <Image src="/images/video-thumbnail.png" alt="Biologi bie daalt video thumbnail" fill className="object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/10 transition group-hover:bg-black/20">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-600 text-2xl text-white shadow-lg">▶</span>
          </span>
        </button>
      )}
    </div>
  );
}
