"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProjectItem } from "@/types";
import { ArrowLeft, ArrowRight, X } from "lucide-react";

const Ie = (e: number) => String(e).padStart(2, "0");

interface ProjectDetailProps {
  project: ProjectItem;
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const frameImages = [project.heroImage, ...project.additionalFrames];
  const [activeFrameIdx, setActiveFrameIdx] = useState(0);
  const [selectedFrameIdx, setSelectedFrameIdx] = useState<number | null>(null);

  useEffect(() => {
    if (selectedFrameIdx === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedFrameIdx(null);
      } else if (event.key === "ArrowLeft") {
        setSelectedFrameIdx((index) => index === null ? null : (index - 1 + frameImages.length) % frameImages.length);
      } else if (event.key === "ArrowRight") {
        setSelectedFrameIdx((index) => index === null ? null : (index + 1) % frameImages.length);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [frameImages.length, selectedFrameIdx]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#14130E] pt-24 md:pt-32 pb-36 px-6 md:px-14 selection:bg-[#14130E] selection:text-white">
      <div className="max-w-6xl mx-auto">
        {/* Top Bar: Back Link and Series Counter */}
        <div className="flex items-center justify-between py-6 border-b border-[#E4E4E4] mb-12">
          <Link
            href="/work"
            className="group inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-[#6A6863] hover:text-[#14130E] transition-colors"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
            <span>All work</span>
          </Link>

          <div className="font-mono text-[12px] tracking-[0.08em] uppercase text-[#969696]">
            <span className="text-[#14130E] font-medium">{project.number}</span>
            <span className="mx-2 text-[#E4E4E4]">—</span>
            <span>{project.total}</span>
          </div>
        </div>

        {/* Main Exhibition Plate */}
        <section className="mb-14 md:mb-20" aria-label="Plate viewer">
          <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-[#969696]">
            <span>Plate {project.number} — {project.title} · {project.place}</span>
            <span>{String(activeFrameIdx + 1).padStart(2, "0")} / {String(frameImages.length).padStart(2, "0")}</span>
          </div>
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[16/11] bg-[#F5F5F3] p-3 sm:p-5 md:p-8 rounded-sm shadow-[0_30px_70px_-20px_rgba(20,19,14,0.14)] overflow-hidden border border-[#E4E4E4]/60">
            <button
              type="button"
              className="relative block h-full w-full overflow-hidden bg-[#EFEFEF] text-left"
              aria-label={`Open plate image ${activeFrameIdx + 1} of ${frameImages.length}`}
              onClick={() => setSelectedFrameIdx(activeFrameIdx)}
            >
            <img
              key={frameImages[activeFrameIdx]}
              src={frameImages[activeFrameIdx]}
              alt={`${project.title}, plate ${activeFrameIdx + 1}`}
              className="w-full h-full object-cover select-none"
              loading={activeFrameIdx === 0 ? "eager" : "lazy"}
            />
            </button>
            {frameImages.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous plate image"
                  className="project-plate-control left-5"
                  onClick={() => setActiveFrameIdx((activeFrameIdx - 1 + frameImages.length) % frameImages.length)}
                >
                  <ArrowLeft size={18} />
                </button>
                <button
                  type="button"
                  aria-label="Next plate image"
                  className="project-plate-control right-5"
                  onClick={() => setActiveFrameIdx((activeFrameIdx + 1) % frameImages.length)}
                >
                  <ArrowRight size={18} />
                </button>
              </>
            )}
          </div>
        </section>

        {/* Project Description & Metadata Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-6 border-t border-[#E4E4E4]">
          {/* Left Column: Title & Editorial Description */}
          <div className="lg:col-span-6 space-y-6">
            <h1 className="font-anton text-[44px] sm:text-[60px] md:text-[76px] tracking-tight uppercase leading-[0.92] text-[#14130E]">
              {project.title}
            </h1>

            <span className="block w-11 h-[1px] bg-[#E4E4E4]" />

            <p className="font-sans text-[16px] sm:text-[18px] text-[#4A4843] leading-relaxed max-w-lg">
              {project.description}
            </p>

            {/* Actions */}
            <div className="pt-6 flex flex-wrap items-center gap-4">
              <Link
                href={`/contact?subject=Print+Enquiry+-+${encodeURIComponent(project.title)}`}
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-full bg-[#14130E] text-white font-mono text-[12px] uppercase tracking-[0.06em] hover:bg-black/85 transition-colors"
              >
                <span>Enquire about this print</span>
                <span>→</span>
              </Link>

              {project.nextSlug && (
                <Link
                  href={`/work/${project.nextSlug}`}
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-[#E4E4E4] bg-white text-[#14130E] font-mono text-[12px] uppercase tracking-[0.06em] hover:border-[#14130E] transition-colors"
                >
                  <span className="text-[#969696]">Next —</span>
                  <span>{project.nextTitle} ›</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: Photography Technical Metadata Table */}
          <div className="lg:col-span-6">
            <div className="border border-[#E4E4E4] bg-[#FDFDFD] rounded-sm divide-y divide-[#E4E4E4]">
              <div className="grid grid-cols-3 py-3 px-5 text-[12px]">
                <span className="font-mono uppercase tracking-[0.06em] text-[#969696]">
                  Place
                </span>
                <span className="col-span-2 font-sans font-medium text-[#14130E]">
                  {project.place}
                </span>
              </div>

              <div className="grid grid-cols-3 py-3 px-5 text-[12px]">
                <span className="font-mono uppercase tracking-[0.06em] text-[#969696]">
                  Country
                </span>
                <span className="col-span-2 font-sans font-medium text-[#14130E]">
                  {project.country}
                </span>
              </div>

              <div className="grid grid-cols-3 py-3 px-5 text-[12px]">
                <span className="font-mono uppercase tracking-[0.06em] text-[#969696]">
                  Year
                </span>
                <span className="col-span-2 font-mono text-[#14130E]">
                  {project.year}
                </span>
              </div>

              <div className="grid grid-cols-3 py-3 px-5 text-[12px]">
                <span className="font-mono uppercase tracking-[0.06em] text-[#969696]">
                  Camera
                </span>
                <span className="col-span-2 font-mono text-[#14130E]">
                  {project.camera}
                </span>
              </div>

              <div className="grid grid-cols-3 py-3 px-5 text-[12px]">
                <span className="font-mono uppercase tracking-[0.06em] text-[#969696]">
                  Settings
                </span>
                <span className="col-span-2 font-mono text-[#14130E]">
                  {project.settings}
                </span>
              </div>

              <div className="grid grid-cols-3 py-3 px-5 text-[12px]">
                <span className="font-mono uppercase tracking-[0.06em] text-[#969696]">
                  Series
                </span>
                <span className="col-span-2 font-mono text-[#14130E]">
                  {project.series}
                </span>
              </div>

              <div className="grid grid-cols-3 py-3 px-5 text-[12px]">
                <span className="font-mono uppercase tracking-[0.06em] text-[#969696]">
                  Edition
                </span>
                <span className="col-span-2 font-mono text-[#14130E]">
                  {project.edition}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Frames Section */}
        {project.additionalFrames && project.additionalFrames.length > 0 && (
          <div className="mt-24 pt-14 border-t border-[#E4E4E4]">
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-anton text-[32px] sm:text-[40px] uppercase tracking-tight text-[#14130E]">
                Series Frames
              </h2>
              <span className="font-mono text-[12px] uppercase tracking-[0.06em] text-[#969696]">
                {project.additionalFrames.length} additional frames
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {project.additionalFrames.map((frameUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedFrameIdx(idx + 1)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedFrameIdx(idx + 1);
                    }
                  }}
                  className="group relative cursor-pointer aspect-[4/3] bg-[#F5F5F3] p-3 rounded-sm border border-[#E4E4E4]/60 hover:border-[#14130E] shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="relative w-full h-full overflow-hidden">
                    <img
                      src={frameUrl}
                      alt={`${project.title} - Frame ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white font-mono text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Frame {Ie(idx + 1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Frame Fullscreen Lightbox Modal */}
      {selectedFrameIdx !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 backdrop-blur-md p-4 md:p-12 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label={`${project.title} plate ${selectedFrameIdx + 1}`}
          onClick={() => setSelectedFrameIdx(null)}
        >
          <button
            type="button"
            onClick={() => setSelectedFrameIdx(null)}
            className="absolute top-6 right-6 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close plate viewer"
          >
            <X size={24} />
          </button>
          {frameImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedFrameIdx((selectedFrameIdx - 1 + frameImages.length) % frameImages.length);
                }}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Previous plate image"
              >
                <ArrowLeft size={22} />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedFrameIdx((selectedFrameIdx + 1) % frameImages.length);
                }}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Next plate image"
              >
                <ArrowRight size={22} />
              </button>
            </>
          )}
          <div
            className="relative max-w-5xl max-h-[85vh] bg-[#14130E] p-2 rounded shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={frameImages[selectedFrameIdx]}
              alt={`${project.title}, plate ${selectedFrameIdx + 1}`}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <p className="px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-white/65">
              Plate {String(selectedFrameIdx + 1).padStart(2, "0")} / {String(frameImages.length).padStart(2, "0")} · {project.title}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
