import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RugWall API",
  description: "X-first community report backend for RugWall"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
