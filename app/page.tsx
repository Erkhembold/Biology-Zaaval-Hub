import Image from "next/image";
import Link from "next/link";
import VideoEmbed from "@/components/VideoEmbed";

function Textbook() {
  return (
    <Image
      src="/images/biology-book.png"
      alt="Биологи XI textbook cover"
      width={199}
      height={301}
      priority
      className="h-80 w-auto rounded-md shadow-2xl ring-1 ring-black/10"
    />
  );
}

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4">
      <section className="grid items-center gap-10 py-12 md:grid-cols-2">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-green-700">11 Biology Zaaval</h1>
          <p className="mt-3 text-xl font-medium text-orange-600">Udirdsan bagsh: Ariunzul</p>
          <p className="mt-8 text-slate-700">
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
          <Image
            src="/images/developer.jpg"
            alt="N.Erkhembold (ebo)"
            width={112}
            height={112}
            className="h-28 w-28 shrink-0 rounded-full object-cover object-top ring-4 ring-green-100"
          />
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
