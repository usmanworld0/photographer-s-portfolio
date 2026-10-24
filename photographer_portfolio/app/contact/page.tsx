import { Suspense } from "react";
import { Metadata } from "next";
import { ContactView } from "@/components/contact/ContactView";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Contact — Farline",
  description: "Commissions, licensing and print sales. I read everything, and reply within two days.",
};

export default function ContactPage() {
  return (
    <main className="relative min-h-screen">
      <Navbar />
      <Suspense fallback={<div className="min-h-screen bg-[#FDFDFD]" />}>
        <ContactView />
      </Suspense>
    </main>
  );
}
