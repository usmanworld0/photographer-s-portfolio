import type { Metadata } from "next";
import { Anton, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Qalakari",
  description: "Qalakari is a portfolio where the hero is the work itself. Prints hang on one line running away from you in real 3D.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${anton.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FDFDFD] text-[#14130E] selection:bg-[#14130E] selection:text-white font-[family-name:var(--font-geist-sans)]">
        {children}
      </body>
    </html>
  );
}
