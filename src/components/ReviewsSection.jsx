import React from "react";

// YCC brand tokens
const NAVY = "#0d1b3e";
const GOLD = "#c8a030";

const blueprintReviews = [
  {
    quote:
      "Wow, I've just been able to go through the PDF. I'm halfway now and it is eye opening, encouraging and a literal blueprint.",
    tag: "Blueprint",
  },
  {
    quote:
      "I love it — gives me a full insight on what to do and how to go about it.",
    tag: "Blueprint",
  },
];

const summaryReviews = [
  {
    quote: "It was a thorough and smooth experience.",
    tag: "Free Summary",
  },
  {
    quote: "The platform is nicely created. It's really nice.",
    tag: "Free Summary",
  },
  {
    quote:
      "Thank you, you are doing a commendable job. I'm convinced I will come for the blueprint some day.",
    tag: "Free Summary",
  },
];

function ReviewCard({ quote, tag }) {
  return (
    <div className="relative flex-1 min-w-[260px] bg-white rounded-lg pl-5 pr-6 py-6 shadow-sm border border-slate-100">
      {/* signature: vital-sign pulse tick, ties clinical + financial motif */}
      <span
        className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full"
        style={{ backgroundColor: GOLD }}
        aria-hidden="true"
      />
      <span
        className="inline-block text-[11px] font-semibold tracking-wide uppercase mb-3 px-2 py-1 rounded"
        style={{ color: NAVY, backgroundColor: "#f4efe1" }}
      >
        {tag}
      </span>
      <p className="text-slate-700 leading-relaxed text-[15px]">
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  );
}

export default function ReviewsSection() {
  return (
    <section className="w-full py-16 px-6" style={{ backgroundColor: "#f7f5f0" }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <p
            className="text-xs font-semibold tracking-[0.2em] uppercase mb-2"
            style={{ color: GOLD }}
          >
            From the community
          </p>
          <h2
            className="text-2xl sm:text-3xl font-serif font-semibold"
            style={{ color: NAVY }}
          >
            What clinicians are saying
          </h2>
        </div>

        <div className="mb-10">
          <h3
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: NAVY }}
          >
            The Blueprint
          </h3>
          <div className="flex flex-col sm:flex-row gap-5">
            {blueprintReviews.map((r, i) => (
              <ReviewCard key={i} {...r} />
            ))}
          </div>
        </div>

        <div>
          <h3
            className="text-sm font-semibold uppercase tracking-wide mb-4"
            style={{ color: NAVY }}
          >
            The Free Assessment
          </h3>
          <div className="flex flex-col sm:flex-row gap-5">
            {summaryReviews.map((r, i) => (
              <ReviewCard key={i} {...r} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
