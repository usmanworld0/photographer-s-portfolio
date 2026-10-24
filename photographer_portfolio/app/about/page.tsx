import { Metadata } from "next";
import { AboutView } from "@/components/about/AboutView";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "About — Farline",
  description: "Landscape and aerial photographer working between Lisbon and the south coast of Iceland. Shooting medium format and aerial platforms on salt, sand and open water.",
};

export default function AboutPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <AboutView />
    </main>
  );
}
