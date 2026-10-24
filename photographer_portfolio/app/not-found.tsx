import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#FDFDFD] text-[#14130E] flex flex-col items-center justify-center px-6 selection:bg-[#14130E] selection:text-white">
      <Navbar />
      <div className="text-center space-y-6 max-w-md">
        <h1 className="font-anton text-[72px] sm:text-[96px] uppercase tracking-tight leading-none text-[#14130E]">
          404
        </h1>
        <span className="block w-11 h-[1px] bg-[#E4E4E4] mx-auto" />
        <p className="font-sans text-[15px] text-[#6A6863]">
          This frame could not be found or has moved from the exhibition line.
        </p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-3 rounded-full bg-[#14130E] text-white font-mono text-[12px] uppercase tracking-[0.06em] hover:bg-black/85 transition-colors"
        >
          Return to exhibition
        </Link>
      </div>
    </main>
  );
}
