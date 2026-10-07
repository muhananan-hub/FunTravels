import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FunTravel - Explore Lombok",
  description:
    "FunTravel adalah layanan perjalanan, driver, guide, dan paket wisata terbaik untuk menjelajahi Lombok.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}