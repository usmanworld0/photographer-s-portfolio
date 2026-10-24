"use client";

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
                <Image
                  src="/muhammad-usman-founder.jpg"
                  alt="Muhammad Usman, photographer"
                  fill
                  loading="eager"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.06em] text-[#969696]">
              Muhammad Usman — Pakistan
            </p>
          </div>

          {/* Bio & Philosophy */}
          <div className="lg:col-span-5 space-y-8 pt-2">
            <h2 className="font-sans text-[24px] sm:text-[28px] md:text-[32px] font-normal leading-snug tracking-tight text-[#14130E]">
              Muhammad Usman
            </h2>

            <p className="font-sans text-[15px] md:text-[16px] text-[#6A6863] leading-relaxed">
              Pakistan-based photographer working across landscape and aerial
              photography.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
