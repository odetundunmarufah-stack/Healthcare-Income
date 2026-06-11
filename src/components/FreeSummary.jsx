import { useMemo, useState } from "react";

// ─── SCORE ───────────────────────────────────────────────────────────────────
const getScore = (answers) => {
  let score = 40;
  const skills = answers.non_clinical_skills || "";
  const tech = parseInt(answers.tech_comfort) || 0;
  const consistency = parseInt(answers.consistency) || 0;
  const venture = answers.venture_background || "";
  const energy = answers.energy_type || "";
  const visibility = answers.visibility_preference || "";
  if (skills.length > 30) score += 10;
  if (tech >= 7) score += 8; else if (tech >= 4) score += 4;
  if (consistency >= 7) score += 8; else if (consistency >= 4) score += 4;
  if (venture.length > 20 && !venture.toLowerCase().includes("nothing") && !venture.toLowerCase().includes("none")) score += 10;
  if (energy.includes("teacher") || energy.includes("engaging")) score += 6;
  if (visibility.includes("Fully visible") || visibility.includes("Professionally")) score += 4;
  if (answers.income_type_preference?.includes("Remote")) score += 4;
  return Math.min(score, 97);
};

// ─── ARCHETYPE ────────────────────────────────────────────────────────────────
const getArchetype = (answers) => {
  const energy = answers.energy_type || "";
  const visibility = answers.visibility_preference || "";
  const skills = answers.non_clinical_skills || "";
  const content = answers.content_comfort || "";
  const incomeType = answers.income_type_preference || "";
  if (incomeType.includes("Remote") || incomeType.includes("dollar")) return {
    name: "The Global Clinical Asset",
    tagline: "Your expertise has a market far beyond Nigeria — and you have not tapped it yet.",
    description: "Your profile points strongly toward remote and international income. There are dollar-denominated roles built specifically for clinicians with your background that most Nigerian healthcare professionals have never heard of. You are closer to your first USD income than you think."
  };
  if (energy.includes("teacher") || content.includes("courses") || content.includes("Writing")) return {
    name: "The Knowledge Monetiser",
    tagline: "You are sitting on a curriculum that people will pay to access.",
    description: "You have the rare combination of clinical authority and the ability to communicate it clearly. Nigerian patients, students, and professionals are actively searching for what you know — but they cannot find it in a form they can access and afford. That gap is your business."
  };
  if (visibility.includes("faceless") || visibility.includes("brand")) return {
    name: "The Quiet Authority",
    tagline: "You do not need to be the face. You need to be the brain behind it.",
    description: "Your preference for staying behind the scenes is not a limitation — it is a strategy. Some of the most profitable healthcare income paths require zero personal visibility. Your profile shows exactly which ones fit your personality and your specialty."
  };
  if (energy.includes("connector") || energy.includes("community")) return {
    name: "The Clinical Community Builder",
    tagline: "Your network is an untapped asset. Your community is your business model.",
    description: "You have a natural ability to bring people together and create belonging. In the healthcare income space, this translates into some of the most scalable and sustainable business models — ones that grow without requiring more of your personal time."
  };
  if (skills.includes("consulting") || skills.includes("Sales")) return {
    name: "The Clinical Strategist",
    tagline: "Organisations will pay serious money for what you see in five minutes.",
    description: "Your combination of clinical knowledge and strategic thinking puts you in a rare category. Healthcare organisations, startups, and corporates need people who understand both medicine and business. Your profile shows several high-ticket paths that leverage exactly this."
  };
  return {
    name: "The Underutilised Specialist",
    tagline: "Your clinical depth is your greatest untapped asset.",
    description: "You have built expertise that most people spend years trying to acquire. The challenge is not your capability — it is that nobody has shown you the specific paths that translate your particular combination of skills, specialty, and personality into income. That changes now."
  };
};

// ─── BLOCKER ─────────────────────────────────────────────────────────────────
const getBlocker = (answers) => {
  const blocker = (answers.biggest_blocker || "").toLowerCase();
  const consistency = parseInt(answers.consistency) || 5;
  if (blocker.includes("judg") || blocker.includes("colleague")) return "The fear of professional judgment is quietly keeping more talented Nigerian clinicians stuck than any skills gap ever has. Your blueprint addresses this directly — including a practical, MDCN-aware framework for building income without professional exposure.";
  if (blocker.includes("pay") || blocker.includes("worth") || blocker.includes("confiden")) return "The doubt about whether people will pay you is imposter syndrome — almost universal among high-achieving clinicians. The painful irony: the more qualified you are, the more you question your right to charge. Your blueprint breaks this pattern specifically.";
  if (blocker.includes("time") || blocker.includes("busy") || blocker.includes("schedule")) return "The real issue is not time — it is the absence of a system that works within the time you actually have. Your blueprint is built around your specific schedule, not an idealised version of it.";
  if (consistency <= 4) return "You have started before and lost momentum. That is not a personality problem — it is a system problem. Your blueprint is designed around focused sprints and milestone-based progress, not daily habits that depend on willpower.";
  return "Something specific is standing between you and the income you know you are capable of earning. Your blueprint names it clearly, addresses it practically, and gives you a route around it — not through motivation, but through a plan that fits your actual situation.";
};

// ─── PATHS ───────────────────────────────────────────────────────────────────
const ALL_PATHS = [
  {
    id: "remote",
    icon: "🌍",
    label: "The Remote Income Path",
    teaser: (answers) => {
      const prof = answers.profession?.includes("Doctor") ? "doctors" : answers.profession?.includes("Nurse") ? "nurses" : answers.profession?.includes("Pharmacist") ? "pharmacists" : "healthcare professionals";
      return `There is a dollar-denominated role that Nigerian ${prof} with your background are being hired for remotely right now — no relocation required. Most people in your position have never heard of it. Your blueprint reveals exactly what it is, how to qualify, and how to land your first client within 90 days.`;
    },
    score: (a) => {
      let s = 0;
      if (a.income_type_preference?.includes("Remote") || a.income_type_preference?.includes("dollar")) s += 40;
      if (a.income_goal?.includes("dollar") || a.income_goal?.includes("USD")) s += 20;
      if (a.tech_comfort && parseInt(a.tech_comfort) >= 5) s += 10;
      if (a.non_clinical_skills?.includes("Virtual") || a.non_clinical_skills?.includes("Medical coding") || a.non_clinical_skills?.includes("Prior auth")) s += 20;
      if (a.target_audience?.includes("international") || a.target_audience?.includes("US, UK")) s += 10;
      return s;
    }
  },
  {
    id: "education",
    icon: "🎓",
    label: "The Clinical Educator Path",
    teaser: (answers) => `Your ${answers.specialty || "clinical"} knowledge is a curriculum that Nigerian patients, students, and professionals will pay to access — but only when packaged correctly. This path reveals the exact format, platform, and first offer that fits your personality. The first income from this path does not require an existing audience.`,
    score: (a) => {
      let s = 0;
      if (a.energy_type?.includes("teacher") || a.energy_type?.includes("explain")) s += 30;
      if (a.content_comfort?.includes("Writing") || a.content_comfort?.includes("courses") || a.content_comfort?.includes("Structured")) s += 20;
      if (a.non_clinical_skills?.includes("Teaching") || a.non_clinical_skills?.includes("Writing") || a.non_clinical_skills?.includes("content creation")) s += 20;
      if (a.income_type_preference?.includes("Passive") || a.income_type_preference?.includes("Portfolio")) s += 15;
      if (a.target_audience?.includes("students") || a.target_audience?.includes("professionals") || a.target_audience?.includes("patients")) s += 15;
      return s;
    }
  },
  {
    id: "consulting",
    icon: "💼",
    label: "The Private Consulting Path",
    teaser: (answers) => `There is a direct, no-audience-required path to earning ₦150,000–₦500,000 per month from your ${answers.specialty || "clinical"} expertise — through private consultations or advisory work. No platform needed. No content. It starts with one conversation. Your blueprint shows you exactly how to price it and get your first paying client.`,
    score: (a) => {
      let s = 0;
      if (a.energy_type?.includes("one-on-one") || a.energy_type?.includes("warm")) s += 25;
      if (a.visibility_preference?.includes("Fully visible") || a.visibility_preference?.includes("Professionally")) s += 20;
      if (a.income_type_preference?.includes("Active local")) s += 25;
      if (a.income_goal?.includes("150,000") || a.income_goal?.includes("500,000")) s += 15;
      if (a.non_clinical_skills?.includes("Sales") || a.non_clinical_skills?.includes("consulting")) s += 15;
      return s;
    }
  },
  {
    id: "content",
    icon: "📱",
    label: "The Health Content Creator Path",
    teaser: (answers) => `Your ${answers.specialty || "clinical"} background gives you the authority to build a health content brand that Nigerian audiences will follow, trust, and pay for. This path is for clinicians who want to turn their expertise into a platform — and their platform into income through brand deals, digital products, and paid communities.`,
    score: (a) => {
      let s = 0;
      if (a.visibility_preference?.includes("Fully visible") || a.visibility_preference?.includes("Professionally")) s += 25;
      if (a.content_comfort?.includes("Short video") || a.content_comfort?.includes("Live sessions") || a.content_comfort?.includes("Audio")) s += 25;
      if (a.energy_type?.includes("engaging") || a.energy_type?.includes("front of people")) s += 20;
      if (a.non_clinical_skills?.includes("Social media") || a.non_clinical_skills?.includes("Video editing")) s += 20;
      if (a.income_type_preference?.includes("Portfolio") || a.income_type_preference?.includes("Passive")) s += 10;
      return s;
    }
  },
  {
    id: "business",
    icon: "🏢",
    label: "The Healthcare Business Path",
    teaser: (answers) => `Your profile points toward building something that scales beyond your personal hours — a healthcare product, platform, clinic, or service business. This path is for clinicians who are not just looking for side income, but want to build an asset. Your blueprint maps out the most realistic first step for someone with your specific background.`,
    score: (a) => {
      let s = 0;
      if (a.income_type_preference?.includes("Business") || a.income_type_preference?.includes("scalable")) s += 40;
      if (a.income_goal?.includes("1,000,000") || a.income_goal?.includes("serious")) s += 20;
      if (a.non_clinical_skills?.includes("Project management") || a.non_clinical_skills?.includes("Sales") || a.non_clinical_skills?.includes("consulting")) s += 20;
      if (a.energy_type?.includes("builder") || a.energy_type?.includes("systems")) s += 20;
      return s;
    }
  },
  {
    id: "writing",
    icon: "✍️",
    label: "The Medical Writing Path",
    teaser: (answers) => `There is a well-paying, completely remote income stream for clinicians who can write — medical writing for pharmaceutical companies, health NGOs, and clinical publications. Your ${answers.specialty || "clinical"} background qualifies you immediately. Most Nigerian clinicians have never considered it. Your blueprint shows you exactly how to enter this market.`,
    score: (a) => {
      let s = 0;
      if (a.non_clinical_skills?.includes("Writing") || a.non_clinical_skills?.includes("Copywriting") || a.non_clinical_skills?.includes("content creation")) s += 35;
      if (a.content_comfort?.includes("Writing") || a.content_comfort?.includes("Downloadable")) s += 20;
      if (a.visibility_preference?.includes("faceless") || a.visibility_preference?.includes("brand")) s += 15;
      if (a.income_type_preference?.includes("Remote") || a.income_type_preference?.includes("Portfolio")) s += 20;
      if (a.energy_type?.includes("precise") || a.energy_type?.includes("analytical")) s += 10;
      return s;
    }
  },
  {
    id: "transition",
    icon: "🔄",
    label: "The Non-Clinical Career Path",
    teaser: (answers) => `Your clinical training opens doors in healthcare technology, pharmaceutical companies, health insurance, medical affairs, and corporate wellness — roles that pay significantly more than hospital medicine and require zero patient contact. This path maps your fastest route from clinical work into these higher-paying non-clinical roles.`,
    score: (a) => {
      let s = 0;
      if (a.income_type_preference?.includes("transition") || a.income_type_preference?.includes("non-clinical")) s += 50;
      if (a.work_status?.includes("stepped back") || a.work_status?.includes("between")) s += 20;
      if (a.income_goal?.includes("dollar") || a.income_goal?.includes("USD")) s += 15;
      if (a.non_clinical_skills?.includes("Project management") || a.non_clinical_skills?.includes("Data analysis") || a.non_clinical_skills?.includes("Medical coding")) s += 15;
      return s;
    }
  },
  {
    id: "aesthetics",
    icon: "💉",
    label: "The Clinical Aesthetics & Wellness Path",
    teaser: (answers) => `The Nigerian aesthetics and wellness market is growing rapidly — and clinicians with your training have a significant credibility advantage over non-medical practitioners. This path maps the business model, certifications, and starting offer for a ${answers.specialty || "clinical"} professional who wants to build income in aesthetics, wellness, or preventive health.`,
    score: (a) => {
      let s = 0;
      if (a.non_clinical_skills?.includes("Beauty") || a.non_clinical_skills?.includes("Hairdressing") || a.non_clinical_skills?.includes("aesthetics")) s += 50;
      if (a.target_audience?.includes("aesthetics") || a.target_audience?.includes("wellness") || a.target_audience?.includes("Women")) s += 25;
      if (a.income_type_preference?.includes("Active local") || a.income_type_preference?.includes("Business")) s += 15;
      if (a.profession?.includes("Doctor") || a.profession?.includes("Nurse") || a.profession?.includes("Pharmacist")) s += 10;
      return s;
    }
  },
];

const getPaths = (answers) => {
  // Score every path against answers
  const scored = ALL_PATHS.map(path => ({
    ...path,
    teaser: path.teaser(answers),
    computedScore: path.score(answers),
  }));

  // Sort by score descending, take top 3
  scored.sort((a, b) => b.computedScore - a.computedScore);
  const top3 = scored.slice(0, 3);

  // Mark the highest scoring one as "best fit"
  top3[0].fit = "high";
  top3[1].fit = "medium";
  top3[2].fit = "medium";

  return top3;
};

const TOTAL_SCREENS = 3;

export default function FreeSummary({ answers, userName, onPay, onReset }) {
  const [screen, setScreen] = useState(0);
  const [selectedPaths, setSelectedPaths] = useState([]);

  const score = useMemo(() => getScore(answers), [answers]);
  const archetype = useMemo(() => getArchetype(answers), [answers]);
  const blocker = useMemo(() => getBlocker(answers), [answers]);
  const paths = useMemo(() => getPaths(answers), [answers]);

  const scoreColor = score >= 75 ? "#16a34a" : score >= 55 ? "#c8a030" : "#dc2626";
  const scoreLabel = score >= 75 ? "High Readiness" : score >= 55 ? "Moderate Readiness" : "Building Phase";
  const firstName = userName ? userName.split(" ")[0] : null;

  const togglePath = (id) => {
    setSelectedPaths(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="fs-wrap">

      {/* ── HEADER ── */}
      <div className="fs-header">
        <div className="fs-logo">Your<span>Clinical</span>Currency</div>
        <div className="fs-dots">
          {Array.from({ length: TOTAL_SCREENS }).map((_, i) => (
            <div key={i} className={`fs-dot${i === screen ? " fs-dot-active" : i < screen ? " fs-dot-done" : ""}`} />
          ))}
        </div>
      </div>

      {/* ══ SCREEN 0 — SCORE + ARCHETYPE + BLOCKER ══ */}
      {screen === 0 && (
        <div className="fs-screen">
          <div className="fs-screen-inner">
            <div className="fs-badge">Your Free Profile Summary</div>
            <h1 className="fs-screen-title">
              {firstName ? `${firstName}, here is what we found.` : "Here is what we found."}
            </h1>

            {/* Score */}
            <div className="fs-block">
              <div className="fs-block-label">INCOME READINESS SCORE</div>
              <div className="fs-score-row">
                <div className="fs-score-ring" style={{ borderColor: scoreColor }}>
                  <span className="fs-score-num" style={{ color: scoreColor }}>{score}</span>
                  <span className="fs-score-denom">/100</span>
                </div>
                <div className="fs-score-right">
                  <div className="fs-score-label" style={{ color: scoreColor }}>{scoreLabel}</div>
                  <p className="fs-score-meaning">
                    {score >= 75
                      ? "Strong readiness — the skills and goals are there. What is missing is a specific, personalised plan."
                      : score >= 55
                      ? "Solid foundations to build from. A few targeted moves will unlock momentum faster than you expect."
                      : "You are earlier in the journey. Your blueprint is designed for exactly this stage."
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Archetype */}
            <div className="fs-block">
              <div className="fs-block-label">YOUR CLINICAL CURRENCY ARCHETYPE</div>
              <div className="fs-archetype-card">
                <div className="fs-archetype-name">"{archetype.name}"</div>
                <div className="fs-archetype-tagline">{archetype.tagline}</div>
                <p className="fs-archetype-desc">{archetype.description}</p>
              </div>
            </div>

            {/* Blocker */}
            <div className="fs-block">
              <div className="fs-block-label">YOUR KEY BLOCKER</div>
              <div className="fs-blocker-card">
                <p className="fs-blocker-text">{blocker}</p>
              </div>
            </div>

            <button className="fs-next-btn" onClick={() => setScreen(1)}>
              Choose Your Income Path →
            </button>
          </div>
        </div>
      )}

      {/* ══ SCREEN 1 — PATH SELECTION ══ */}
      {screen === 1 && (
        <div className="fs-screen">
          <div className="fs-screen-inner">
            <div className="fs-badge">Your Income Paths</div>
            <h1 className="fs-screen-title">Which direction calls to you?</h1>
            <p className="fs-screen-sub">
              Select up to 2 paths. Your full blueprint focuses on your chosen direction — with specific opportunities, certifications, and a 30-day plan built around it.
            </p>

            <div className="fs-paths">
              {paths.map(path => {
                const isSelected = selectedPaths.includes(path.id);
                const maxReached = selectedPaths.length >= 2 && !isSelected;
                return (
                  <div
                    key={path.id}
                    className={`fs-path-card${isSelected ? " fs-path-sel" : ""}${maxReached ? " fs-path-dim" : ""}`}
                    onClick={() => !maxReached && togglePath(path.id)}
                  >
                    <div className="fs-path-row">
                      <span className="fs-path-icon">{path.icon}</span>
                      <span className="fs-path-name">{path.label}</span>
                      {path.fit === "high" && <span className="fs-path-fit">Best fit</span>}
                      {isSelected && <span className="fs-path-tick">✓</span>}
                    </div>
                    <p className="fs-path-desc">{path.teaser}</p>
                  </div>
                );
              })}
            </div>

            {selectedPaths.length > 0 && (
              <p className="fs-sel-note">
                {selectedPaths.length === 1 ? "1 path selected — you can add 1 more" : "2 paths selected"}
              </p>
            )}

            <button
              className="fs-next-btn"
              onClick={() => selectedPaths.length && setScreen(2)}
              style={{ opacity: selectedPaths.length ? 1 : 0.35, cursor: selectedPaths.length ? "pointer" : "not-allowed" }}
            >
              See My Blueprint →
            </button>
            <button className="fs-back-btn" onClick={() => setScreen(0)}>← Back</button>
          </div>
        </div>
      )}

      {/* ══ SCREEN 2 — PAYWALL ══ */}
      {screen === 2 && (
        <div className="fs-screen">
          <div className="fs-screen-inner">

            {/* White card */}
            <div className="fs-paywall-card">
              <div className="fs-lock-icon">🔒</div>
              <h2 className="fs-paywall-h">Your Full Clinical Currency Blueprint</h2>
              <p className="fs-paywall-sub">
                Your free summary shows you the what. Your full blueprint shows you the how — step by step, specific to your specialty and chosen path.
              </p>

              <div className="fs-what-list">
                {[
                  "🔬 Your Clinical Edge — what makes your background monetisable right now",
                  "🗺️ Full Opportunity Map — every income path ranked by fit and speed",
                  "🎯 Your Signature Offer — one thing to sell first with exact pricing",
                  "🎓 Skills & Certifications Roadmap — what to learn and what it unlocks",
                  "📅 30-Day Roadmap — week by week around your actual schedule",
                  "📈 Income Trajectory — honest projections at 3, 6, and 12 months",
                  "🧠 Mindset Audit — your blockers named and dismantled",
                ].map((item, i) => (
                  <div key={i} className="fs-what-item">{item}</div>
                ))}
              </div>

              <div className="fs-bonus-strip">
                <div className="fs-bonus-label">🎁 Free bonuses included:</div>
                <div className="fs-bonus-row">✓ First ₦100k Checklist</div>
                <div className="fs-bonus-row">✓ 30 Content Ideas for your specialty</div>
                <div className="fs-bonus-row">✓ Access to the YCC Community</div>
              </div>

              {/* WhatsApp CTA */}
              <div className="fs-wa-strip">
                <span className="fs-wa-strip-icon">💬</span>
                <div>
                  <div className="fs-wa-strip-title">The YCC Community — free with your blueprint</div>
                  <p className="fs-wa-strip-body">Weekly check-ins, live Q&As, accountability partners, and a growing group of Nigerian healthcare professionals building income alongside you. Your report tells you what to do. The community makes sure you actually do it.</p>
                </div>
              </div>

              <div className="fs-price-line">
                <span className="fs-price-cross">Regular: ₦15,000</span>
                <span className="fs-price-now">Launch price: ₦5,000</span>
              </div>

              <button className="fs-pay-btn" onClick={() => onPay(selectedPaths)}>
                Unlock My Full Blueprint — ₦5,000 →
              </button>

              <p className="fs-secure-note">🔒 Secured by Paystack · Card, bank transfer & USSD</p>
              <p className="fs-restart-note">
                Not you? <button className="fs-restart-link" onClick={onReset}>Start over</button>
              </p>
            </div>

            <button className="fs-back-btn" style={{ marginTop: 16 }} onClick={() => setScreen(1)}>← Change path selection</button>
          </div>
        </div>
      )}

    </div>
  );
}
