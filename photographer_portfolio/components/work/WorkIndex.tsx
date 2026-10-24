"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProjectItem } from "@/types";

interface WorkIndexProps {
  projects: ProjectItem[];
}

export function WorkIndex({ projects }: WorkIndexProps) {
  const [previewProject, setPreviewProject] = useState(projects[0]);

  return (
    <div
      className="min-h-screen bg-[#FDFDFD] text-[#14130E] pt-24 md:pt-8 pb-28 md:pb-24 px-5 md:px-8 selection:bg-[#14130E] selection:text-white"
    >
      <div className="work-layout mx-auto max-w-[1440px]">
        <section className="work-feature" aria-label="Featured print">
          <header className="work-intro">
            <h1 className="font-anton text-[72px] sm:text-[88px] md:text-[104px] tracking-[-0.01em] uppercase leading-[0.88]">
              Work
            </h1>
            <span className="block w-11 h-[1px] bg-[#E4E4E4] my-6" />
            <p className="max-w-[390px] font-sans text-[13px] md:text-[14px] text-[#969696] leading-relaxed">
              Eleven prints from 2022 — 2025, in five series. Hover a line to lift a print; click it to see the plate.
            </p>
          </header>

          {previewProject && (
            <Link
              href={`/work/${previewProject.slug}`}
              className="work-feature-link group"
              aria-label={`View ${previewProject.title}`}
              tabIndex={-1}
            >
              <div className="work-feature-image-wrap">
                <img
                  key={previewProject.slug}
                  src={previewProject.heroImage}
                  alt={previewProject.title}
                  className="work-feature-image"
                  draggable={false}
                />
              </div>
              <p className="work-feature-caption">
                {previewProject.number} — {previewProject.title} · {previewProject.place} · {previewProject.year}
              </p>
            </Link>
          )}
        </section>

        <section className="work-index" aria-label="Project index">
          <div className="work-index-grid work-index-head" aria-hidden="true">
            <span />
            <span>No.</span>
            <span>Title</span>
            <span>Series</span>
            <span>Place</span>
            <span className="text-right">Year</span>
          </div>

          {projects.map((item, idx) => (
            <Link
              key={item.slug}
              href={`/work/${item.slug}`}
              aria-label={`${item.number} — ${item.title}, ${item.series}, ${item.place}, ${item.year}`}
              aria-current={previewProject?.slug === item.slug ? "true" : undefined}
              className="work-row group relative block"
              onMouseEnter={() => setPreviewProject(item)}
              onFocus={() => setPreviewProject(item)}
              style={{ ["--work-row-index" as string]: idx }}
            >
              <div className="work-index-grid work-index-row">
                <div className="work-thumbnail">
                  <img
                    src={item.heroImage}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading={idx < 4 ? "eager" : "lazy"}
                    draggable={false}
                  />
                </div>
                <span className="work-index-number">{item.number}</span>
                <span className="work-index-title">{item.title}</span>
                <span className="work-index-series">{item.series}</span>
                <span className="work-index-place">{item.place}</span>
                <span className="work-index-year">{item.year}</span>
              </div>
            </Link>
          ))}
        </section>
      </div>

    </div>
  );
}
