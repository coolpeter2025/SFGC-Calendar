import "./globals.css";
import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: "SFGC Calendar",
  description: "Upcoming services, ministries, and gatherings at SFGC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-brand-50 font-sans text-slate-900 antialiased">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
            <a href="/" className="group flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-800 text-white shadow-sm ring-1 ring-brand-900/10 sm:h-10 sm:w-10">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="h-4 w-4 sm:h-5 sm:w-5"
                  aria-hidden="true"
                >
                  <path d="M12 4v16M5 12h14" />
                </svg>
              </span>
              <div className="leading-tight">
                <div className="font-serif text-lg font-semibold tracking-tight sm:text-xl">
                  SFGC
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 sm:text-[11px]">
                  Calendar
                </div>
              </div>
            </a>
            <a
              href="/submit"
              className="rounded-full bg-brand-800 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-brand-900/10 transition hover:bg-brand-700 active:bg-brand-900 sm:px-5"
            >
              Submit
            </a>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-3 py-6 sm:px-6 sm:py-10">{children}</main>

        <footer className="mx-auto max-w-5xl px-4 pb-10 pt-6 text-center text-xs text-slate-400 sm:px-6">
          <p>SFGC · All events auto-sync to our Google Calendar</p>
        </footer>
      </body>
    </html>
  );
}
