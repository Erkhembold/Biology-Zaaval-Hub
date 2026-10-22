"use client";
import { useEffect, useState } from "react";

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

  useEffect(() => setCards(build()), []);

  function flip(c: Card) {
    if (flipped.length === 2 || flipped.includes(c.id) || matched.includes(c.pair)) return;
    const next = [...flipped, c.id];
    setFlipped(next);
    if (next.length === 2) {
      const [a, b] = next.map((id) => cards.find((x) => x.id === id)!);
      if (a.pair === b.pair) {
        setMatched((m) => [...m, a.pair]);
        setFlipped([]);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  }

  function reset() {
    setCards(build());
    setFlipped([]);
    setMatched([]);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <span className="text-lg font-bold text-orange-600">{matched.length}/8 matches found</span>
        <button onClick={reset} className="rounded-full border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100">Restart</button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((c) => {
          const up = flipped.includes(c.id) || matched.includes(c.pair);
          return (
            <button key={c.id} onClick={() => flip(c)} className="flip h-20 sm:h-24" aria-label="card">
              <div className={`flip-inner ${up ? "is-flipped" : ""}`}>
                <div className="flip-face flex items-center justify-center rounded-xl bg-green-600 text-2xl text-white">?</div>
                <div
                  className={`flip-face flip-back flex items-center justify-center rounded-xl p-1 text-center text-xs font-semibold sm:text-sm ${
                    matched.includes(c.pair) ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {c.label}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {matched.length === 8 && <p className="mt-4 font-semibold text-green-700">You found all the pairs!</p>}
    </div>
  );
}
