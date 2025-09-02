import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Anton,
  Bangers,
  Press_Start_2P,
} from "next/font/google";
import "./globals.css";
import { SocketProvider } from "@/lib/providers/socket-provider";

// Load fonts via next/font (auto-optimized, no FOUT, no extra <link> tags)
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});
const bangers = Bangers({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bangers",
});
const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-press-start-2p",
});

export const metadata: Metadata = {
  title: "Ravengers",
  description: "Gamified App",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${geistMono.variable} ${anton.variable} ${bangers.variable} ${pressStart2P.variable} antialiased`}
      >
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}
