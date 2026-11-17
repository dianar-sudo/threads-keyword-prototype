import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Threads Keyword Search Demo",
  description: "A small review prototype for Threads OAuth and keyword search."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
