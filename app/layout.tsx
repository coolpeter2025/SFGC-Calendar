import "./globals.css";
import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";

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

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SFGC · Community Calendar",
  description: "Services, ministries, and gatherings at SFGC",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <header
          className="sticky top-0 z-40 border-b backdrop-blur-md"
          style={{
            borderColor: "rgba(89,75,56,0.18)",
            background: "rgba(247, 241, 230, 0.85)",
          }}
        >
          <div className="mx-auto flex max-w-[1100px] items-center justify-between px-5 py-4 sm:px-9">
            <a href="/" className="flex items-center gap-3.5">
              <span
                className="grid h-11 w-11 place-items-center rounded-full"
                style={{
                  background: "#2a2418",
                  color: "#f0d9a8",
                  boxShadow:
                    "inset 0 0 0 1px rgba(240,217,168,0.25), 0 1px 0 rgba(0,0,0,0.05)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M12 3v18M5 9h14" strokeLinecap="round" />
                </svg>
              </span>
              <div className="leading-[1.05]">
                <div className="font-serif text-[20px] font-semibold tracking-tight text-ink-800 sm:text-[22px]">
                  SFGC
                </div>
                <div className="mt-[3px] text-[10px] uppercase tracking-[0.22em] text-ink-500 sm:text-[11px]">
                  Community Calendar
                </div>
              </div>
            </a>
            <nav className="flex items-center gap-5 sm:gap-7">
              <a
                href="/"
                className="hidden text-sm font-medium text-ink-700 hover:text-ink-900 sm:inline"
              >
                Calendar
              </a>
              <a
                href="/submit"
                className="rounded-full px-4 py-2.5 text-[13.5px] font-medium tracking-wide sm:px-5"
                style={{
                  background: "#2a2418",
                  color: "#f0d9a8",
                  boxShadow:
                    "0 1px 0 rgba(0,0,0,0.05), inset 0 0 0 1px rgba(240,217,168,0.2)",
                }}
              >
                + Submit event
              </a>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-[1100px] px-5 py-8 pb-16 sm:px-9 sm:py-10">
          {children}
        </main>

        <footer
          className="mx-auto max-w-[1100px] border-t px-5 py-8 text-center text-[12.5px] text-ink-500 sm:px-9"
          style={{ borderColor: "rgba(89,75,56,0.18)" }}
        >
          <div className="mb-1.5 font-serif text-[15px] italic text-ink-700">
            &ldquo;Let us consider how we may spur one another on toward love and good
            deeds.&rdquo;
          </div>
          <div>
            SFGC · Auto-syncs to Google Calendar
          </div>
        </footer>
      </body>
    </html>
  );
}
