import Link from "next/link";
import VideoEmbed from "@/components/VideoEmbed";

function Textbook() {
  return (
    <svg viewBox="0 0 220 260" className="h-64 w-56 drop-shadow-2xl" aria-label="Biology textbook">
      <rect x="20" y="20" width="170" height="220" rx="10" fill="#15803d" />
      <rect x="30" y="20" width="160" height="220" rx="8" fill="#16a34a" />
      <rect x="20" y="20" width="14" height="220" rx="4" fill="#166534" />
      <circle cx="110" cy="95" r="34" fill="#fff" opacity=".95" />
      <path d="M110 70c-12 10-12 40 0 50 12-10 12-40 0-50z" fill="#ea580c" />
      <path d="M90 95h40" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" />
      <text x="110" y="170" textAnchor="middle" fontSize="18" fontWeight="700" fill="#fff">BIOLOGY</text>
      <text x="110" y="194" textAnchor="middle" fontSize="14" fill="#fed7aa">11 Zaaval</text>
    </svg>
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="grid items-center gap-10 py-12 md:grid-cols-2">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-green-700">11 Biology Zaaval</h1>
          <p className="mt-3 text-xl font-medium text-orange-600">Udirdsan bagsh: Ariunzul</p>
          <h2 className="mt-8 text-2xl font-bold">Biology gej yu ve?</h2>
          <p className="mt-3 text-slate-700">
            This hub is designed for 11th-grade students to review the biology topics covered in class. Each lesson topic
            has a short review and a quiz so you can see what you remember and what needs another look.
          </p>
          <p className="mt-3 text-slate-700">
            Complete quizzes, earn XP for every correct answer, play games, and compete with your classmates on the
            weekly leaderboard.
          </p>
          <div className="mt-6 flex gap-3">
            <Link href="/lessons" className="rounded-full bg-green-600 px-6 py-2.5 font-semibold text-white hover:bg-green-700">
              Start learning
            </Link>
            <Link href="/leaderboard" className="rounded-full border border-orange-600 px-6 py-2.5 font-semibold text-orange-700 hover:bg-orange-50">
              Leaderboard
            </Link>
          </div>
        </div>

        <div className="scene flex justify-center">
          <div className="tilt rounded-3xl border border-white/60 bg-gradient-to-br from-green-100/80 to-orange-100/80 p-10 shadow-2xl backdrop-blur">
            <div className="rounded-2xl bg-white/50 p-6 shadow-inner ring-1 ring-white">
              <Textbook />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <h2 className="text-2xl font-bold">What does this website do?</h2>
        <div className="mt-4 rounded-2xl border-l-4 border-green-600 bg-white p-6 shadow">
          <p className="text-slate-700">
            Lets the &lsquo;biology zaaval&rsquo; students of 11th grade practise and revise their biology lessons in a fun and
            an interactive way. Spans multiple lessons topics, quizzes, and mini games. Students can compete with each other
            on the leaderboard too-
          </p>
        </div>
      </section>

      <section className="py-8">
        <VideoEmbed id="kmKUNlii1us" />
      </section>

      <section className="py-8">
        <div className="flex flex-col items-center gap-6 rounded-2xl bg-white p-6 shadow sm:flex-row">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-orange-400 bg-orange-50 text-xs text-orange-600">
            my image here
          </div>
          <div>
            <h3 className="text-lg font-bold text-green-700">Web Developed by: N.Erkhembold(ebo), 11b</h3>
            <p className="mt-2 text-slate-700">
              I built this website for our class so we can learn biology together in a more fun, interactive way and keep
              each other motivated.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
