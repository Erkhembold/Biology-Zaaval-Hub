"use client";
import { useEffect, useRef, useState } from "react";

const PAIRS: [string, string][] = [
  ["Substrate", "Active Site"],
  ["Enzyme", "Catalyst"],
  ["Carbohydrate", "Energy"],
  ["Protein", "Amino Acid"],
  ["DNA", "Nucleotide"],
  ["Lipid", "Fatty Acid"],
  ["Denature", "Shape Loss"],
  ["Glucose", "Monosaccharide"],
];

type Card = { id: number; pair: number; label: string };

function build(): Card[] {
  const cards = PAIRS.flatMap(([a, b], p) => [
    { id: p * 2, pair: p, label: a },
    { id: p * 2 + 1, pair: p, label: b },
  ]);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

export default function MemoryMatch() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCards(build());
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function flip(c: Card) {
    if (flipped.length === 2 || flipped.includes(c.id) || matched.includes(c.pair)) return;
    const next = [...flipped, c.id];
    setFlipped(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((id) => cards.find((x) => x.id === id)!);
      if (a.pair === b.pair) {
        timer.current = setTimeout(() => {
          setMatched((m) => [...m, a.pair]);
          setFlipped([]);
        }, 350);
      } else {
        timer.current = setTimeout(() => setFlipped([]), 900);
      }
    }
  }

  function reset() {
    if (timer.current) clearTimeout(timer.current);
    setCards(build());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="text-base font-bold text-orange-600 sm:text-lg">{matched.length}/8 matches found</span>
        <span className="whitespace-nowrap text-sm text-slate-500">Moves: {moves}</span>
        <button onClick={reset} className="rounded-full border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100">Restart</button>
      </div>

      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {cards.map((c) => {
          const isMatched = matched.includes(c.pair);
          const up = flipped.includes(c.id) || isMatched;
          return (
            <div
              key={c.id}
              role="button"
              tabIndex={0}
              aria-label={up ? c.label : "Hidden card"}
              aria-pressed={up}
              onClick={() => flip(c)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  flip(c);
                }
              }}
              className="flip mm-card h-[4.5rem] cursor-pointer select-none sm:h-24"
            >
              <div className={`flip-inner ${up ? "is-flipped" : ""}`}>
                <div className="flip-face flex items-center justify-center rounded-xl bg-green-600 text-2xl text-white">?</div>
                <div
                  className={`flip-face flip-back flex items-center justify-center overflow-hidden rounded-xl px-0.5 text-center font-semibold leading-tight [overflow-wrap:anywhere] ${
                    c.label.length > 10 ? "text-[9px] sm:text-xs" : c.label.length > 7 ? "text-[10px] sm:text-sm" : "text-[11px] sm:text-sm"
                  } ${isMatched ? "bg-green-100 text-green-800 ring-2 ring-green-500" : "bg-orange-100 text-orange-800"}`}
                >
                  {c.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {matched.length === 8 && (
        <div className="mt-4 rounded-xl bg-green-50 p-4 text-center">
          <p className="font-bold text-green-700">You found all the pairs in {moves} moves!</p>
          <button onClick={reset} className="mt-2 rounded-full bg-orange-600 px-5 py-2 text-sm font-semibold text-white">Play again</button>
        </div>
      )}
    </div>
  );
}
