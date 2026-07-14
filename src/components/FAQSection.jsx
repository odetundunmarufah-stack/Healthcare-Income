import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const NAVY = "#0d1b3e";
const GOLD = "#c8a030";

const faqs = [
  {
    q: "Is the assessment really free?",
    a: "Yes. The 15-question assessment and your full summary — Income Readiness Score, Clinical Currency Archetype, and top income paths — are completely free. You only pay ₦5,000 if you want the full personalised blueprint.",
  },
  {
    q: "What exactly do I get in the ₦5,000 blueprint?",
    a: "A personalised 14-section PDF with specific income diversification strategies based on your assessment answers, plus access to the YCC WhatsApp Community.",
  },
  {
    q: "How long does delivery take?",
    a: "Your blueprint is delivered within 24 hours of payment.",
  },
  {
    q: "Is this asking me to leave clinical practice?",
    a: "No. YCC is about adding income streams alongside your clinical work, not replacing it.",
  },
  {
    q: "Will this guarantee me a certain income?",
    a: "No. The blueprint gives you realistic strategies and pathways based on your profile — outcomes depend on your effort and circumstances, not a guarantee.",
  },
  {
    q: "Can I get a refund?",
    a: "Yes. If you don't feel the blueprint gave you value, message us on WhatsApp within 48 hours of delivery for a full refund — no long forms, just a quick conversation.",
  },
  {
    q: "How do I contact support if I have questions?",
    a: (
      <>
        WhatsApp us directly:{" "}
        <a
          href="https://wa.me/2348147119371"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium"
          style={{ color: NAVY }}
        >
          +234 814 711 9371
        </a>
      </>
    ),
  },
];

function FAQItem({ index, q, a, isOpen, onToggle }) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <div className="border-b border-slate-200">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-4 py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span
          className="text-xs font-mono mt-1 shrink-0"
          style={{ color: GOLD }}
        >
          {num}
        </span>
        <span
          className="flex-1 font-medium text-[15px] sm:text-base"
          style={{ color: NAVY }}
        >
          {q}
        </span>
        <ChevronDown
          size={18}
          className="shrink-0 mt-1 transition-transform duration-200"
          style={{
            color: GOLD,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      <div
        className="grid transition-all duration-200 ease-in-out"
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <p className="text-slate-600 text-[14px] sm:text-[15px] leading-relaxed pb-5 pl-9 pr-6">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="w-full py-16 px-6 bg-white">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10 text-center">
          <p
            className="text-xs font-semibold tracking-[0.2em] uppercase mb-2"
            style={{ color: GOLD }}
          >
            Before you begin
          </p>
          <h2
            className="text-2xl sm:text-3xl font-serif font-semibold"
            style={{ color: NAVY }}
          >
            Frequently asked questions
          </h2>
        </div>

        <div>
          {faqs.map((item, i) => (
            <FAQItem
              key={i}
              index={i}
              q={item.q}
              a={item.a}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}