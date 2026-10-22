import Duel from "@/components/Duel";
import MemoryMatch from "@/components/MemoryMatch";

export default function GamesPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-4xl font-extrabold text-green-700">Games</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-4 text-2xl font-bold">1v1 a friend</h2>
          <Duel />
        </div>
        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="mb-1 text-2xl font-bold">Memory Match</h2>
          <p className="mb-4 text-sm text-slate-500">Casual mode: no XP.</p>
          <MemoryMatch />
        </div>
      </div>
      <p className="mt-8 text-center text-slate-500">More games in mind here</p>
    </section>
  );
}
