"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isWork = pathname.startsWith("/work");
  const isGallery = pathname === "/gallery";
  const isAbout = pathname === "/about";
  const isContact = pathname === "/contact";

  return (
    <>
      {!isWork && (
        <div className="fixed top-4 left-5 z-40">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-full border border-[#E4E4E4] bg-white/90 px-3 font-mono text-[15px] font-semibold tracking-tight text-[#14130E] shadow-sm backdrop-blur-sm transition-colors hover:border-[#14130E]"
          >
            FARLINE
          </Link>
        </div>
      )}

      {/* Floating Bottom Navigation Pill */}
      <nav
        aria-label="Main"
        className="fixed bottom-7 left-1/2 -translate-x-1/2 z-50 flex items-center gap-[2px] p-[5px] rounded-full bg-white/70 backdrop-blur-md border border-[#E4E4E4] shadow-[0_18px_40px_-18px_rgba(20,19,14,0.12)] transition-all duration-300 max-w-[95vw] overflow-x-auto no-scrollbar"
      >
        <Link
          href="/"
          className={`flex items-center justify-center px-4 md:px-[18px] py-[11px] rounded-full text-[12px] leading-none font-mono font-medium tracking-[0.06em] uppercase whitespace-nowrap transition-colors duration-300 ${
            isHome
              ? "bg-[#14130E] text-white"
              : "bg-transparent text-[#14130E] hover:bg-black/[0.04]"
          }`}
        >
          Main
        </Link>

        <Link
          href="/work"
          className={`flex items-center justify-center px-4 md:px-[18px] py-[11px] rounded-full text-[12px] leading-none font-mono font-medium tracking-[0.06em] uppercase whitespace-nowrap transition-colors duration-300 ${
            isWork
              ? "bg-[#14130E] text-white"
              : "bg-transparent text-[#14130E] hover:bg-black/[0.04]"
          }`}
        >
          Work
        </Link>

        <Link
          href="/gallery"
          className={`flex items-center justify-center px-4 md:px-[18px] py-[11px] rounded-full text-[12px] leading-none font-mono font-medium tracking-[0.06em] uppercase whitespace-nowrap transition-colors duration-300 ${
            isGallery
              ? "bg-[#14130E] text-white"
              : "bg-transparent text-[#14130E] hover:bg-black/[0.04]"
          }`}
        >
          Gallery
        </Link>

        <Link
          href="/about"
          className={`flex items-center justify-center px-4 md:px-[18px] py-[11px] rounded-full text-[12px] leading-none font-mono font-medium tracking-[0.06em] uppercase whitespace-nowrap transition-colors duration-300 ${
            isAbout
              ? "bg-[#14130E] text-white"
              : "bg-transparent text-[#14130E] hover:bg-black/[0.04]"
          }`}
        >
          About
        </Link>

        <Link
          href="/contact"
          className={`flex items-center justify-center px-4 md:px-[18px] py-[11px] rounded-full text-[12px] leading-none font-mono font-medium tracking-[0.06em] uppercase whitespace-nowrap transition-colors duration-300 ${
            isContact
              ? "bg-[#14130E] text-white"
              : "bg-transparent text-[#14130E] hover:bg-black/[0.04]"
          }`}
        >
          Contact
        </Link>
      </nav>
    </>
  );
}
