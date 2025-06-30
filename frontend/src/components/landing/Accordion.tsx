"use client";
import React from "react";

export default function Accordion({
  faqs,
}: {
  faqs: Array<{ q: string; a: string }>;
}) {
  const [open, setOpen] = React.useState<number | null>(null);
  return (
    <div className="space-y-4">
      {faqs.map((faq, idx) => (
        <div key={idx} className="border border-white/10 rounded-lg bg-white/5">
          <button
            className="w-full flex justify-between items-center cursor-pointer px-6 py-4 text-left text-lg font-medium focus:outline-none focus:ring"
            onClick={() => setOpen(open === idx ? null : idx)}
            aria-expanded={open === idx}
          >
            <span>{faq.q}</span>
            <span className="ml-4 text-2xl">{open === idx ? "−" : "+"}</span>
          </button>
          {open === idx && (
            <div className="px-6 pb-4 text-blue-100 text-base animate-fade-in">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
