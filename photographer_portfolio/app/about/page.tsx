import { Metadata } from "next";
import { AboutView } from "@/components/about/AboutView";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "About — Qalakari",
  description: "Meet Muhammad Usman, a Pakistan-based photographer working across landscape and aerial photography.",
};

export default function AboutPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <AboutView />
    </main>
  );
}
