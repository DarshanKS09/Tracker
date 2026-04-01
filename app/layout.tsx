import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Routine Tracker",
  description: "Fast daily routine tracking with weekly analytics."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
