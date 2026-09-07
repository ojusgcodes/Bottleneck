import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bottleneck",
  description: "Decision simulator — test the decision before you deploy resources.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
