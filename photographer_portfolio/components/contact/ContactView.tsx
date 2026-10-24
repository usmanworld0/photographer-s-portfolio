"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";

export function ContactView() {
  const searchParams = useSearchParams();
  const prefillSubject = searchParams.get("subject") || "";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: prefillSubject,
    message: "",
    projectType: "Editorial",
  });
  const [step, setStep] = useState(1);
  const [status, setStatus] = useState<"idle" | "prepared" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (!formData.name.trim() || !formData.email.trim()) {
        setStatus("error");
        setErrorMessage("Please add your name and email address.");
        return;
      }
      setErrorMessage("");
      setStatus("idle");
      setStep(2);
      return;
    }

    if (!formData.message.trim()) {
      setStatus("error");
      setErrorMessage("Please add a message before continuing.");
      return;
    }

    const subject = formData.subject.trim() || `${formData.projectType} enquiry`;
    const body = [
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Project type: ${formData.projectType}`,
      formData.subject.trim() ? `Print / project: ${formData.subject.trim()}` : "",
      "",
      formData.message,
    ].filter(Boolean).join("\n");
    setStatus("prepared");
    window.location.href = `mailto:hello@marahalden.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#14130E] pt-28 md:pt-36 pb-36 px-6 md:px-14 selection:bg-[#14130E] selection:text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-14 md:mb-20">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <h1 className="font-anton text-[56px] sm:text-[72px] md:text-[96px] tracking-[-0.01em] uppercase leading-none text-[#14130E]">
              Contact
            </h1>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E4E4E4] bg-white/80 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#6A6863]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#758B62]" />
              Available for commissions
            </div>
          </div>
          <span className="block w-11 h-[1px] bg-[#E4E4E4] my-6" />
        </div>

        {/* Layout Grid: Direct Contact Details & Enquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Direct Inquiries */}
          <div className="lg:col-span-5 space-y-10">
            <div>
              <a
                href="mailto:hello@marahalden.com"
                className="group inline-flex max-w-full items-center gap-2 font-sans text-[20px] min-[400px]:text-[26px] sm:text-[34px] font-medium tracking-tight text-[#14130E] hover:opacity-75 transition-opacity"
              >
                <span className="break-all">hello@marahalden.com</span>
                <ArrowUpRight
                  size={26}
                  className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </a>
              <p className="mt-3 font-sans text-[15px] text-[#6A6863] leading-relaxed max-w-sm">
                Commissions, licensing and print sales. I read everything, and reply
                within two days.
              </p>
            </div>

            <div className="space-y-6 pt-6 border-t border-[#E4E4E4]">
              {/* Phone */}
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#969696] block mb-1">
                  Phone
                </span>
                <a
                  href="tel:+351912000000"
                  className="font-mono text-[15px] text-[#14130E] hover:underline"
                >
                  +351 912 000 000
                </a>
              </div>

              {/* Studio */}
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#969696] block mb-1">
                  Studio
                </span>
                <p className="font-sans text-[15px] text-[#14130E]">
                  Rua da Boavista 42, Lisbon
                </p>
                <span className="font-mono text-[11px] text-[#969696]">
                  Lisbon · GMT+0
                </span>
              </div>

              {/* Elsewhere */}
              <div>
                <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#969696] block mb-2">
                  Elsewhere
                </span>
                <div className="flex flex-wrap gap-4 font-mono text-[12px] uppercase tracking-[0.06em]">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#14130E] hover:opacity-60 transition-opacity"
                  >
                    Instagram ↗
                  </a>
                  <a
                    href="https://vimeo.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#14130E] hover:opacity-60 transition-opacity"
                  >
                    Vimeo ↗
                  </a>
                  <a
                    href="https://are.na"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[#14130E] hover:opacity-60 transition-opacity"
                  >
                    Are.na ↗
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-white/70 backdrop-blur-md border border-[#E4E4E4] rounded-sm p-6 sm:p-10 shadow-[0_20px_45px_-15px_rgba(20,19,14,0.08)]">
              {status === "prepared" ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-black/5 flex items-center justify-center text-[#14130E]">
                    <CheckCircle2 size={28} />
                  </div>
                  <h3 className="font-sans text-[22px] font-medium text-[#14130E]">
                    Your email draft is ready
                  </h3>
                  <p className="font-sans text-[14px] text-[#6A6863] max-w-sm mx-auto">
                    Your mail app should open with the enquiry filled in. Send the message there to complete your enquiry.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      setStep(1);
                      setFormData({ name: "", email: "", subject: "", message: "", projectType: "Editorial" });
                    }}
                    className="mt-4 px-6 py-2.5 rounded-full border border-[#E4E4E4] font-mono text-[12px] uppercase tracking-[0.06em] hover:border-[#14130E] transition-colors"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center justify-between border-b border-[#E4E4E4] pb-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#14130E]">
                      New enquiry
                    </p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#969696]">
                      0{step} / 02
                    </p>
                  </div>
                  {step === 1 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label htmlFor="contact-name" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#969696] block">
                            Your name *
                          </label>
                          <input
                            id="contact-name"
                            type="text"
                            autoComplete="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Your name"
                            className="w-full px-4 py-3 bg-[#FDFDFD] border border-[#E4E4E4] rounded-sm font-sans text-[14px] text-[#14130E] placeholder:text-[#BBB] focus:outline-none focus:border-[#14130E] transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="contact-email" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#969696] block">
                            Email address *
                          </label>
                          <input
                            id="contact-email"
                            type="email"
                            autoComplete="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="you@example.com"
                            className="w-full px-4 py-3 bg-[#FDFDFD] border border-[#E4E4E4] rounded-sm font-sans text-[14px] text-[#14130E] placeholder:text-[#BBB] focus:outline-none focus:border-[#14130E] transition-colors"
                          />
                        </div>
                      </div>
                      <fieldset className="space-y-3">
                        <legend className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#969696]">
                          Project type
                        </legend>
                        <div className="flex flex-wrap gap-2">
                          {["Editorial", "Commercial", "Licensing", "Prints"].map((type) => (
                            <label
                              key={type}
                              className={`cursor-pointer rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors ${
                                formData.projectType === type
                                  ? "border-[#14130E] bg-[#14130E] text-white"
                                  : "border-[#E4E4E4] text-[#6A6863] hover:border-[#14130E]"
                              }`}
                            >
                              <input
                                type="radio"
                                name="project-type"
                                value={type}
                                checked={formData.projectType === type}
                                onChange={() => setFormData({ ...formData, projectType: type })}
                                className="sr-only"
                              />
                              {type}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                    </>
                  ) : (
                    <>
                      {formData.subject && (
                        <div className="space-y-2">
                          <label htmlFor="contact-subject" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#969696] block">
                            Print / project
                          </label>
                          <input
                            id="contact-subject"
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-4 py-3 bg-[#FDFDFD] border border-[#E4E4E4] rounded-sm font-sans text-[14px] text-[#14130E] focus:outline-none focus:border-[#14130E] transition-colors"
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <label htmlFor="contact-message" className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#969696] block">
                          Message *
                        </label>
                        <textarea
                          id="contact-message"
                          rows={6}
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          placeholder="Tell me a little about the project..."
                          className="w-full px-4 py-3 bg-[#FDFDFD] border border-[#E4E4E4] rounded-sm font-sans text-[14px] text-[#14130E] placeholder:text-[#BBB] focus:outline-none focus:border-[#14130E] transition-colors resize-none"
                        />
                      </div>
                    </>
                  )}

                  {errorMessage && (
                    <p className="font-mono text-[11px] text-red-600">
                      {errorMessage}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4">
                    {step === 2 && (
                      <button
                        type="button"
                        onClick={() => { setStep(1); setErrorMessage(""); setStatus("idle"); }}
                        className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.06em] text-[#6A6863] hover:text-[#14130E]"
                      >
                        <ArrowLeft size={14} /> Back
                      </button>
                    )}
                    <button
                      type="submit"
                      className="ml-auto w-full sm:w-auto px-8 py-4 rounded-full bg-[#14130E] text-white font-mono text-[12px] uppercase tracking-[0.08em] hover:bg-black/85 transition-colors"
                    >
                      {step === 1 ? "Continue →" : "Send enquiry →"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
