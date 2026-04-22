import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SFGC Calendar",
  description: "Church events",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
            <a href="/" className="text-xl font-semibold">
              SFGC Calendar
            </a>
            <a href="/submit" className="text-sm text-blue-600 hover:underline">
              Submit event
            </a>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
