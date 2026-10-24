import { FarlineHang } from "@/components/hero/FarlineHang";
import { Navbar } from "@/components/layout/Navbar";
import { projectsData } from "@/data/projects";

export default function HomePage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <FarlineHang projects={projectsData} />
    </main>
  );
}
