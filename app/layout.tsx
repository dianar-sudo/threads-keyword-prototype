import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  icons: { icon: "/threadscout-icon.svg", apple: "/threadscout-icon.svg" },
  title: "ThreadScout | Threads keyword search",
  description: "Search public Threads conversations by keyword with ThreadScout."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
