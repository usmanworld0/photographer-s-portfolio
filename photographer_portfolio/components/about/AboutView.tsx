"use client";

import React from "react";
import Image from "next/image";

export function AboutView() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#14130E] pt-28 md:pt-36 pb-36 px-6 md:px-14 selection:bg-[#14130E] selection:text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-14 md:mb-20">
          <h1 className="font-anton text-[56px] sm:text-[72px] md:text-[96px] tracking-[-0.01em] uppercase leading-none text-[#14130E]">
            About
          </h1>
          <span className="block w-11 h-[1px] bg-[#E4E4E4] my-6" />
        </div>

        {/* Hero Grid: Portrait + Bio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24 md:mb-32">
          {/* Portrait with Editorial Frame */}
          <div className="lg:col-span-7">
            <div className="relative w-full aspect-[4/5] bg-[#F5F5F3] p-4 md:p-6 rounded-sm border border-[#E4E4E4] shadow-[0_24px_50px_-16px_rgba(20,19,14,0.12)] overflow-hidden">
              <div className="relative w-full h-full overflow-hidden bg-[#E8E8E6]">
                <img
                  src="https://framerusercontent.com/images/EApvdAIV563r8MloBma21MhsA.png?width=1600"
                  alt="Mara Halden"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.06em] text-[#969696]">
              Mara Halden — Alentejo, 2025
            </p>
          </div>

          {/* Bio & Philosophy */}
          <div className="lg:col-span-5 space-y-8 pt-2">
            <h2 className="font-sans text-[24px] sm:text-[28px] md:text-[32px] font-normal leading-snug tracking-tight text-[#14130E]">
              Landscape and aerial photographer working between Lisbon and the south
              coast of Iceland.
            </h2>

            <p className="font-sans text-[15px] md:text-[16px] text-[#6A6863] leading-relaxed">
              Shooting medium format and aerial platforms on salt, sand and open
              water. The work focuses on transitional landscapes — places where
              tide, wind, and geothermal activity constantly reshape the surface
              of the earth.
            </p>

            <div className="pt-4 border-t border-[#E4E4E4]">
              <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#969696] block mb-2">
                Representation
              </span>
              <p className="font-sans text-[15px] text-[#14130E] font-medium">
                Working worldwide
              </p>
            </div>
          </div>
        </div>

        {/* Editorial Credits Grid (Clients, Awards, Exhibitions) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 pt-14 border-t border-[#E4E4E4]">
          {/* Selected Clients */}
          <div className="space-y-4">
            <h3 className="font-mono text-[12px] uppercase tracking-[0.08em] text-[#969696]">
              Selected clients
            </h3>
            <ul className="space-y-2.5 font-sans text-[15px] text-[#14130E]">
              <li>Northwind Quarterly</li>
              <li>Saltworks &amp; Co.</li>
              <li>Atlas &amp; Oak</li>
              <li>Fieldnote Journal</li>
              <li>Meridian Press</li>
            </ul>
          </div>

          {/* Recognition */}
          <div className="space-y-4">
            <h3 className="font-mono text-[12px] uppercase tracking-[0.08em] text-[#969696]">
              Recognition
            </h3>
            <ul className="space-y-2.5 font-sans text-[15px] text-[#14130E]">
              <li>Open Ground Prize — 2024</li>
              <li>Aerial Folio Award — 2023</li>
              <li>Weather Book — 2022</li>
            </ul>
          </div>

          {/* Exhibited */}
          <div className="space-y-4">
            <h3 className="font-mono text-[12px] uppercase tracking-[0.08em] text-[#969696]">
              Exhibited
            </h3>
            <ul className="space-y-2.5 font-sans text-[15px] text-[#14130E]">
              <li>Galeria Lume, Lisbon</li>
              <li>Haus der Luft, Berlin</li>
              <li>Tidewater, Copenhagen</li>
            </ul>
          </div>
        </div>

        {/* Footer Signature */}
        <div className="mt-28 pt-10 border-t border-[#E4E4E4] flex items-center justify-between text-[#969696] font-mono text-[12px] uppercase tracking-[0.06em]">
          <span>FARLINE</span>
          <span>Est. 2016</span>
        </div>
      </div>
    </div>
  );
}
