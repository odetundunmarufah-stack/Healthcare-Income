import { useMemo, useState } from "react";

// ─── INCOME READINESS SCORE ───────────────────────────────────────────────────
const getScore = (answers) => {
  let score = 40; // base
  const skills = answers.non_clinical_skills || "";
  const tech = parseInt(answers.tech_comfort) || 0;
  const consistency = parseInt(answers.consistency) || 0;
  const venture = answers.venture_background || "";
  const energy = answers.energy_type || "";
  const visibility = answers.visibility_preference || "";

  if (skills.length > 30) score += 10;
  if (tech >= 7) score += 8;
  else if (tech >= 4) score += 4;
  if (consistency >= 7) score += 8;
  else if (consistency >= 4) score += 4;
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

  if (incomeType.includes("Remote") || incomeType.includes("dollar")) {
    return {
      name: "The Global Clinical Asset",
      tagline: "Your expertise has a market far beyond Nigeria — and you have not tapped it yet.",
      description: "Your profile points strongly toward remote and international income. There are dollar-denominated roles built specifically for clinicians with your background that most Nigerian healthcare professionals have never heard of. You are closer to your first USD income than you think."
    };
  }
  if (energy.includes("teacher") || content.includes("courses") || content.includes("Writing")) {
    return {
      name: "The Knowledge Monetiser",
      tagline: "You are sitting on a curriculum that people will pay to access.",
      description: "You have the rare combination of clinical authority and the ability to communicate it clearly. Nigerian patients, students, and professionals are actively searching for what you know — but they cannot find it in a form they can access and afford. That gap is your business."
    };
  }
  if (visibility.includes("faceless") || visibility.includes("brand")) {
    return {
      name: "The Quiet Authority",
      tagline: "You do not need to be the face. You need to be the brain behind it.",
      description: "Your preference for staying behind the scenes is not a limitation — it is a strategy. Some of the most profitable healthcare income paths require zero personal visibility. Your profile shows exactly which ones fit your personality and your specialty."
    };
  }
  if (energy.includes("connector") || energy.includes("community")) {
    return {
      name: "The Clinical Community Builder",
      tagline: "Your network is an untapped asset. Your community is your business model.",
      description: "You have a natural ability to bring people together and create belonging. In the healthcare income space, this translates into some of the most scalable and sustainable business models available — ones that grow without requiring more of your personal time."
    };
  }
  if (skills.includes("consulting") || skills.includes("Sales")) {
    return {
      name: "The Clinical Strategist",
      tagline: "Organisations will pay serious money for what you see in five minutes.",
      description: "Your combination of clinical knowledge and strategic thinking puts you in a rare category. Healthcare organisations, startups, and corporates need people who understand both medicine and business. Your profile shows several high-ticket paths that leverage exactly this."
    };
  }
  return {
    name: "The Underutilised Specialist",
    tagline: "Your clinical depth is your greatest untapped asset.",
    description: "You have built expertise that most people spend years trying to acquire. The challenge is not your capability — it is that nobody has shown you the specific paths that translate your particular combination of skills, specialty, and personality into income. That changes now."
  };
};

// ─── THREE PATHS ──────────────────────────────────────────────────────────────
const getPaths = (answers) => {
  const profession = answers.profession || "";
  const specialty = answers.specialty || "your specialty";
  const incomeType = answers.income_type_preference || "";
  const visibility = answers.visibility_preference || "";
  const content = answers.content_comfort || "";
  const energy = answers.energy_type || "";

  const allPaths = [
    {
      id: "remote",
      icon: "🌍",
      label: "The Remote Income Path",
      teaser: `There is a specific dollar-denominated role that Nigerian ${profession.includes("Doctor") ? "doctors" : profession.includes("Nurse") ? "nurses" : profession.includes("Pharmacist") ? "pharmacists" : "healthcare professionals"} with your background are being hired for remotely right now — no relocation required. Most people in your position have never heard of it. Your full blueprint reveals exactly what it is, how to qualify, and how to land your first client within 90 days.`,
      fit: incomeType.includes("Remote") || incomeType.includes("dollar") ? "high" : "medium"
    },
    {
      id: "education",
      icon: "🎓",
      label: "The Clinical Educator Path",
      teaser: `Your ${specialty} knowledge is a curriculum that Nigerian patients, students, and professionals will pay to access — but only when it is packaged correctly. This path reveals the exact format, platform, and first offer that fits your personality and schedule. The first income from this path does not require an existing audience.`,
      fit: content.includes("Writing") || content.includes("courses") || energy.includes("teacher") ? "high" : "medium"
    },
    {
      id: "consulting",
      icon: "💼",
      label: "The Private Consulting Path",
      teaser: `There is a direct, no-audience-required path to earning ₦150,000–₦500,000 per month from your ${specialty} expertise — through private consultations, advisory work, or specialist services. This path requires no platform, no content, and no existing followers. It starts with one conversation. Your full blueprint shows you exactly how to price it, position it, and get your first paying client.`,
      fit: visibility.includes("visible") || energy.includes("one-on-one") ? "high" : "medium"
    }
  ];

  // Sort by fit
  return allPaths.sort((a, b) => (a.fit === "high" ? -1 : 1));
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function FreeSummary({ answers, userName, onPay, onReset }) {
  const [selectedPaths, setSelectedPaths] = useState([]);
  const score = useMemo(() => getScore(answers), [answers]);
  const archetype = useMemo(() => getArchetype(answers), [answers]);
  const paths = useMemo(() => getPaths(answers), [answers]);

  const scoreColor = score >= 75 ? "#1a6b3a" : score >= 55 ? "#c8a030" : "#8b3a3a";
  const scoreLabel = score >= 75 ? "High Readiness" : score >= 55 ? "Moderate Readiness" : "Building Phase";

  const handlePathSelect = (pathId) => {
    setSelectedPaths(prev => {
      if (prev.includes(pathId)) return prev.filter(p => p !== pathId);
      if (prev.length >= 2) return prev; // max 2
      return [...prev, pathId];
    });
  };

  return (
    <div className="fs-wrap">
      {/* ── TOP ── */}
      <div className="fs-top">
        <div className="fs-logo">Your<span>Clinical</span>Currency</div>
        <div className="fs-badge">Your Free Profile Summary</div>
        <h1 className="fs-title">
          {userName ? `${userName.split(" ")[0]}, here is what your profile reveals.` : "Here is what your profile reveals."}
        </h1>
        <p className="fs-subtitle">
          Based on your answers, our assessment engine has built a picture of your income readiness, your natural strengths, and the paths most likely to work for you specifically.
        </p>
      </div>

      <div className="fs-card">
        <div className="fs-content">

          {/* ── SCORE ── */}
          <div className="fs-section">
            <div className="fs-section-title">YOUR INCOME READINESS SCORE</div>
            <div className="fs-score-row">
              <div className="fs-score-circle" style={{ borderColor: scoreColor }}>
                <span className="fs-score-num" style={{ color: scoreColor }}>{score}</span>
                <span className="fs-score-max">/100</span>
              </div>
              <div className="fs-score-info">
                <div className="fs-score-label" style={{ color: scoreColor }}>{scoreLabel}</div>
                <p className="fs-score-desc">
                  {score >= 75
                    ? "Your profile shows strong readiness — existing skills, the right mindset, and clear goals. The main thing missing is a specific, personalised plan. That is what your blueprint delivers."
                    : score >= 55
                    ? "You have solid foundations to build from. A few targeted moves — matched to your specific profile — will unlock momentum faster than you expect."
                    : "You are earlier in the journey, and that is completely fine. Your blueprint is designed specifically for this stage — clear, low-cost, and calibrated to where you actually are."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* ── ARCHETYPE ── */}
          <div className="fs-section">
            <div className="fs-section-title">YOUR CLINICAL CURRENCY ARCHETYPE</div>
            <div className="fs-archetype">
              <div className="fs-archetype-name">"{archetype.name}"</div>
              <div className="fs-archetype-tagline">{archetype.tagline}</div>
              <p className="fs-para">{archetype.description}</p>
            </div>
          </div>

          {/* ── BLOCKER ── */}
          <div className="fs-section">
            <div className="fs-section-title">WHAT IS ACTUALLY HOLDING YOU BACK</div>
            <div className="fs-blocker-box">
              <p className="fs-para" style={{ color: "rgba(255,255,255,0.75)" }}>
                {(() => {
                  const blocker = answers.biggest_blocker || "";
                  const consistency = parseInt(answers.consistency) || 5;
                  if (blocker.toLowerCase().includes("time")) return "The real issue is not time — it is the absence of a system that works within the time you actually have. Your blueprint is built around your specific schedule, not an idealised version of it.";
                  if (blocker.toLowerCase().includes("judg") || blocker.toLowerCase().includes("colleague")) return "The fear of professional judgment is quietly keeping more talented Nigerian clinicians stuck than any skills gap ever has. Your blueprint addresses this directly — including a specific MDCN-aware framework for building income without professional exposure.";
                  if (blocker.toLowerCase().includes("start") || blocker.toLowerCase().includes("overwhelm")) return "The paralysis you feel is not a character flaw — it is what happens when you have too many options and no personalised direction. Your blueprint gives you one starting point, one first offer, and one 30-day plan. Nothing more.";
                  if (blocker.toLowerCase().includes("pay") || blocker.toLowerCase().includes("worth") || blocker.toLowerCase().includes("confiden")) return "The doubt you feel about whether people will pay you is imposter syndrome — and it is almost universal among high-achieving clinicians. The painful irony is that the more qualified you are, the more you question your right to charge. Your blueprint breaks this pattern specifically.";
                  if (consistency <= 4) return "You have started before and lost momentum. That is not a personality problem — it is a system problem. Your blueprint is designed around focused sprints and milestone-based progress, not daily habits that depend on willpower you may not always have.";
                  return "Something specific is standing between you and the income you know you are capable of earning. Your blueprint names it clearly, addresses it practically, and gives you a route around it — not through motivation, but through a plan that fits your actual situation.";
                })()}
              </p>
            </div>
          </div>

        </div>

        {/* ── PATH SELECTION ── */}
        <div className="fs-paths-section">
          <div className="fs-paths-header">
            <div className="fs-section-title" style={{ color: "#fff", marginBottom: 6 }}>CHOOSE YOUR PRIMARY INCOME PATH(S)</div>
            <p className="fs-paths-sub">Select up to 2 paths. Your full blueprint will focus on your chosen path(s) — with specific opportunities, certifications, and a 30-day action plan tailored to your direction.</p>
          </div>

          <div className="fs-paths">
            {paths.map((path) => {
              const isSelected = selectedPaths.includes(path.id);
              const maxReached = selectedPaths.length >= 2 && !isSelected;
              return (
                <div
                  key={path.id}
                  className={`fs-path${isSelected ? " fs-path-sel" : ""}${maxReached ? " fs-path-dim" : ""}`}
                  onClick={() => !maxReached && handlePathSelect(path.id)}
                  style={{ opacity: maxReached ? 0.5 : 1, cursor: maxReached ? "not-allowed" : "pointer" }}
                >
                  <div className="fs-path-top">
                    <span className="fs-path-icon">{path.icon}</span>
                    <span className="fs-path-label">{path.label}</span>
                    {path.fit === "high" && <span className="fs-path-badge">Best fit</span>}
                    <span className="fs-path-check">{isSelected ? "✓" : ""}</span>
                  </div>
                  <p className="fs-path-teaser">{path.teaser}</p>
                </div>
              );
            })}
          </div>
          {selectedPaths.length > 0 && (
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, color: "rgba(200,160,48,0.8)", marginTop: 12, textAlign: "center" }}>
              {selectedPaths.length === 1 ? "1 path selected · You can select 1 more" : "2 paths selected"}
            </p>
          )}
        </div>

        {/* ── PAYWALL ── */}
        <div className="fs-paywall-inner">
          <div className="fs-lock">🔒</div>
          <h2 className="fs-paywall-title">Your Full Clinical Currency Blueprint</h2>
          <p className="fs-paywall-body">
            Your free summary shows you who you are and what is possible. Your full blueprint shows you exactly what to do, step by step, starting this week.
          </p>

          <div className="fs-what-you-get">
            <div className="fs-wg-title">What unlocks for ₦5,000:</div>
            {[
              "🔬 Your Clinical Edge — what makes your background uniquely monetisable right now",
              "🗺️ Full Opportunity Map — every income path ranked by fit, speed, and income potential",
              "🎯 Your Signature Offer — the one thing to sell first and exactly how to price it",
              "🎓 Skills & Certifications Roadmap — what to learn, where to get certified, and what income it unlocks",
              "📅 30-Day Roadmap — week by week tasks built around your actual schedule",
              "📈 Income Trajectory — conservative and ambitious projections at 3, 6, and 12 months",
              "🧠 Mindset Audit — your specific blockers named and dismantled with practical fixes",
            ].map((item, i) => (
              <div key={i} className="fs-wg-item">{item}</div>
            ))}
          </div>

          <div className="fs-bonuses">
            <div className="fs-bonus-title">🎁 Included at no extra cost:</div>
            <div className="fs-bonus-item">✓ The First ₦100k Checklist — exactly what to do in 30 days</div>
            <div className="fs-bonus-item">✓ 30 Content Ideas tailored to your specialty</div>
            <div className="fs-bonus-item">✓ Access to the YCC Community</div>
          </div>

          {/* ── WHATSAPP COMMUNITY — just before pay button ── */}
          <div className="fs-wa-banner">
            <div className="fs-wa-banner-top">
              <span className="fs-wa-banner-icon">💬</span>
              <div>
                <div className="fs-wa-banner-title">The YCC Community</div>
                <div className="fs-wa-banner-sub">Included free with your blueprint</div>
              </div>
            </div>
            <p className="fs-wa-banner-body">
              Your blueprint tells you what to do. The hardest part of building income outside the hospital is not knowing — it is doing, consistently, while managing a clinical career.
            </p>
            <p className="fs-wa-banner-body" style={{ marginTop: 8 }}>
              The YCC Community is where implementation happens. Weekly check-ins, live Q&As, accountability partners, income milestone support, and a growing group of Nigerian healthcare professionals building real income together.
            </p>
            <div className="fs-wa-banner-features">
              {[
                "📌 Weekly implementation check-ins",
                "🎙️ Live Q&A sessions",
                "🤝 Accountability partners who understand clinical life",
                "📈 Income milestone tracking and celebration",
                "💡 Platform growth and online presence tips",
                "📂 Templates, resources, and opportunities shared weekly",
              ].map((f, i) => (
                <div key={i} className="fs-wa-banner-feature">{f}</div>
              ))}
            </div>
            <div className="fs-wa-banner-cta">
              Your report tells you what to do. The community makes sure you actually do it.
            </div>
          </div>

          <div className="fs-price-row">
            <span className="fs-price-old">Regular: ₦15,000</span>
            <span className="fs-price-now">Launch price: ₦5,000</span>
          </div>

          {!selectedPaths.length && (
            <p className="fs-path-warning">⬆️ Select at least one income path above to unlock your blueprint</p>
          )}

          <button
            className="fs-pay-btn"
            onClick={() => selectedPaths.length && onPay(selectedPaths)}
            disabled={!selectedPaths.length}
            style={{ opacity: selectedPaths.length ? 1 : 0.4, cursor: selectedPaths.length ? "pointer" : "not-allowed" }}
          >
            Unlock My Full Blueprint — ₦5,000 →
          </button>

          <p className="fs-secure">🔒 Secured by Paystack · Card, bank transfer & USSD accepted</p>
          <p className="fs-restart">Not you? <button className="fs-link" onClick={onReset}>Start over</button></p>
        </div>
      </div>
    </div>
  );
}
