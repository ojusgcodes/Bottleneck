import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bottleneck — Decision simulator",
  description:
    "Where does the next hire go? Bottleneck models your company as a chain of stages, finds where work actually waits, and shows what moving or hiring one person does everywhere else — computed, never guessed.",
};

export const viewport: Viewport = {
  themeColor: "#ecebe8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Fonts load from Google at runtime; the CSS fallback stack keeps the
            page presentable if the demo machine is offline. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Instrument+Serif:ital@0;1&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
