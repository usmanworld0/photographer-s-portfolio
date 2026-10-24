import { Metadata } from "next";
import { WorkIndex } from "@/components/work/WorkIndex";
import { Navbar } from "@/components/layout/Navbar";
import { projectsData } from "@/data/projects";

export const metadata: Metadata = {
  title: "Work — Qalakari",
  description: "Eleven prints from 2022 — 2025, in five series. Hover a line to lift the print; click it to see the plate.",
};

export default function WorkPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <WorkIndex projects={projectsData} />
    </main>
  );
}
