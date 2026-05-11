import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import "./globals.css";

const Providers = dynamic(() => import("@/components/Providers"), { ssr: false });

export const metadata = {
  title: "Seesaw — Tilt the Internet",
  description: "Vote with micro-payments. Every opinion has weight.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-bg text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
