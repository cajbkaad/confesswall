import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ConfessWall",
  description: "X-first community report backend for RugWall"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
