import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Oyunlag Biology Zaaval",
  description: "Biology Zaaval Hub for 11th grade: lessons, quizzes, games and a leaderboard.",
  icons: { icon: "/images/logo.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Navbar />
        <main>{children}</main>
        <footer className="mt-16 border-t border-slate-200 py-6 text-center text-sm text-slate-500">
          Oyunlag Biology zaaval · 11th grade
        </footer>
      </body>
    </html>
  );
}
