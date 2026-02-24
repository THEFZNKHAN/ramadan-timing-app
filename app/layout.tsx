import type { Metadata } from "next";
import "./globals.css";
import NightSky from "@/components/NightSky";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Ramadan Timing — Sehri & Iftar",
  description: "Ramadan prayer times: Sehri and Iftar for your location. View all Salah timings and full Ramadan month.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen text-[var(--text-primary)] relative bg-transparent">
        <NightSky />
        <ToastProvider>
        <div className="relative z-10 min-w-0 overflow-x-hidden">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--accent-gold)] focus:text-[var(--bg-deep)] focus:rounded-lg"
          >
            Skip to main content
          </a>
          {children}
        </div>
        </ToastProvider>
      </body>
    </html>
  );
}
