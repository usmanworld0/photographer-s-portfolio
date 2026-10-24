import { Metadata } from "next";
import { LightTable } from "@/components/gallery/LightTable";
import { Navbar } from "@/components/layout/Navbar";
import { galleryData } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Gallery — Qalakari",
  description: "Out-takes and the frames in between, laid out on the table. Drag to move it, hover to lift a print, click to look closer.",
};

export default function GalleryPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <LightTable items={galleryData} />
    </main>
  );
}
