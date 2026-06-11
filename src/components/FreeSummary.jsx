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
const getPaths = (answers) => {
  const profession = answers.profession || "";
  const specialty = answers.specialty || "your specialty";
  const incomeType = answers.income_type_preference || "";
  const visibility = answers.visibility_preference || "";
  const content = answers.content_comfort || "";
  const energy = answers.energy_type || "";
  const prof = profession.includes("Doctor") ? "doctors" : profession.includes("Nurse") ? "nurses" : profession.includes("Pharmacist") ? "pharmacists" : "healthcare professionals";

  return [
    {
      id: "remote", icon: "🌍", label: "The Remote Income Path",
      teaser: `There is a dollar-denominated role that Nigerian ${prof} with your background are being hired for remotely right now — no relocation required. Most people in your position have never heard of it. Your blueprint reveals exactly what it is, how to qualify, and how to land your first client within 90 days.`,
      fit: incomeType.includes("Remote") || incomeType.includes("dollar") ? "high" : "medium"
    },
    {
      id: "education", icon: "🎓", label: "The Clinical Educator Path",
      teaser: `Your ${specialty} knowledge is a curriculum that Nigerian patients, students, and professionals will pay to access — but only when packaged correctly. This path reveals the exact format, platform, and first offer that fits your personality. The first income from this path does not require an existing audience.`,
      fit: content.includes("Writing") || content.includes("courses") || energy.includes("teacher") ? "high" : "medium"
    },
    {
      id: "consulting", icon: "💼", label: "The Private Consulting Path",
      teaser: `There is a direct, no-audience-required path to earning ₦150,000–₦500,000 per month from your ${specialty} expertise — through private consultations or advisory work. No platform needed. No content. It starts with one conversation. Your blueprint shows you exactly how to price it and get your first paying client.`,
      fit: visibility.includes("visible") || energy.includes("one-on-one") ? "high" : "medium"
    },
  ].sort((a, b) => a.fit === "high" ? -1 : 1);
};

// ─── STEP SCREENS ─────────────────────────────────────────────────────────────
const TOTAL_STEPS = 5;

export default function FreeSummary({ answers, userName, onPay, onReset }) {
  const [screen, setScreen] = useState(0);
  const [selectedPaths, setSelectedPaths] = useState([]);

  const score = useMemo(() => getScore(answers), [answers]);
  const archetype = useMemo(() => getArchetype(answers), [answers]);
  const blocker = useMemo(() => getBlocker(answers), [answers]);
  const paths = useMemo(() => getPaths(answers), [answers]);

  const scoreColor = score >= 75 ? "#1a6b3a" : score >= 55 ? "#c8a030" : "#8b3a3a";
  const scoreLabel = score >= 75 ? "High Readiness" : score >= 55 ? "Moderate Readiness" : "Building Phase";

  const togglePath = (id) => {
    setSelectedPaths(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const firstName = userName ? userName.split(" ")[0] : null;

  return (
    <div className="fs-wrap">

      {/* ── HEADER ── */}
      <div className="fs-header">
        <div className="fs-logo">Your<span>Clinical</span>Currency</div>
        <div className="fs-dots">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div key={i} className={`fs-dot${i === screen ? " fs-dot-active" : i < screen ? " fs-dot-done" : ""}`} />
          ))}
        </div>
      </div>

      {/* ══ SCREEN 0 — SCORE ══ */}
      {screen === 0 && (
        <div className="fs-screen">
          <div className="fs-screen-inner">
            <div className="fs-badge">Your Free Profile Summary</div>
            <h1 className="fs-screen-title">
              {firstName ? `${firstName}, here is your score.` : "Here is your score."}
            </h1>
            <p className="fs-screen-sub">
              Based on your answers, we have calculated your Income Readiness Score — a snapshot of how positioned you are to build income outside your clinical salary right now.
            </p>

            <div className="fs-score-display">
              <div className="fs-score-ring" style={{ borderColor: scoreColor }}>
                <span className="fs-score-num" style={{ color: scoreColor }}>{score}</span>
                <span className="fs-score-denom">/100</span>
              </div>
              <div className="fs-score-label" style={{ color: scoreColor }}>{scoreLabel}</div>
              <p className="fs-score-meaning">
                {score >= 75
                  ? "Your profile shows strong readiness — the skills, the mindset, and the goals are there. What is missing is a specific, personalised plan. That is exactly what your blueprint delivers."
                  : score >= 55
                  ? "You have solid foundations. A few targeted moves — matched specifically to your profile — will unlock momentum faster than you expect."
                  : "You are earlier in the journey, and that is completely fine. Your blueprint is designed for exactly this stage — clear, low-cost, and calibrated to where you actually are."
                }
              </p>
            </div>

            <button className="fs-next-btn" onClick={() => setScreen(1)}>
              See Your Archetype →
            </button>
          </div>
        </div>
      )}

      {/* ══ SCREEN 1 — ARCHETYPE ══ */}
      {screen === 1 && (
        <div className="fs-screen">
          <div className="fs-screen-inner">
            <div className="fs-badge">Your Clinical Currency Archetype</div>
            <h1 className="fs-screen-title">You are...</h1>

            <div className="fs-archetype-card">
              <div className="fs-archetype-name">"{archetype.name}"</div>
              <div className="fs-archetype-tagline">{archetype.tagline}</div>
              <p className="fs-archetype-desc">{archetype.description}</p>
            </div>

            <p className="fs-screen-note">
              Your archetype shapes your income model — what will feel natural, what will drain you, and which paths are likely to work without burning you out.
            </p>

            <button className="fs-next-btn" onClick={() => setScreen(2)}>
              See What Is Holding You Back →
            </button>
            <button className="fs-back-btn" onClick={() => setScreen(0)}>← Back</button>
          </div>
        </div>
      )}

      {/* ══ SCREEN 2 — BLOCKER ══ */}
      {screen === 2 && (
        <div className="fs-screen">
          <div className="fs-screen-inner">
            <div className="fs-badge">Your Key Blocker</div>
            <h1 className="fs-screen-title">Here is what is actually stopping you.</h1>

            <div className="fs-blocker-card">
              <p className="fs-blocker-text">{blocker}</p>
            </div>

            <p className="fs-screen-note">
              Your full blueprint does not just name this blocker — it gives you a specific, practical route around it. Not motivation. A plan.
            </p>

            <button className="fs-next-btn" onClick={() => setScreen(3)}>
              Choose Your Income Path →
            </button>
            <button className="fs-back-btn" onClick={() => setScreen(1)}>← Back</button>
          </div>
        </div>
      )}

      {/* ══ SCREEN 3 — PATH SELECTION ══ */}
      {screen === 3 && (
        <div className="fs-screen">
          <div className="fs-screen-inner">
            <div className="fs-badge">Your Income Paths</div>
            <h1 className="fs-screen-title">Select up to 2 paths.</h1>
            <p className="fs-screen-sub">
              Your full blueprint focuses on your chosen path(s). Each reveals a different set of opportunities, certifications, and a 30-day plan specific to that direction.
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
              onClick={() => selectedPaths.length && setScreen(4)}
              style={{ opacity: selectedPaths.length ? 1 : 0.35, cursor: selectedPaths.length ? "pointer" : "not-allowed" }}
            >
              Unlock My Blueprint →
            </button>
            <button className="fs-back-btn" onClick={() => setScreen(2)}>← Back</button>
          </div>
        </div>
      )}

      {/* ══ SCREEN 4 — PAYWALL ══ */}
      {screen === 4 && (
        <div className="fs-screen">
          <div className="fs-screen-inner fs-paywall-screen">

            <div className="fs-lock-icon">🔒</div>
            <h1 className="fs-paywall-h">Your Full Clinical Currency Blueprint</h1>
            <p className="fs-paywall-sub">
              Your free summary shows you the what. Your full blueprint shows you the how — specific to your specialty, your personality, and the path you just chose.
            </p>

            <div className="fs-what-list">
              {[
                "🔬 Your Clinical Edge — what makes your background monetisable right now",
                "🗺️ Full Opportunity Map — every income path ranked by fit and speed",
                "🎯 Your Signature Offer — one specific thing to sell first with exact pricing",
                "🎓 Skills & Certifications Roadmap — what to learn and what income it unlocks",
                "📅 30-Day Roadmap — week by week, around your actual schedule",
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
            <div className="fs-wa-cta">
              <div className="fs-wa-cta-top">
                <span className="fs-wa-cta-icon">💬</span>
                <div>
                  <div className="fs-wa-cta-title">The YCC Community</div>
                  <div className="fs-wa-cta-sub">Included free with your blueprint</div>
                </div>
              </div>
              <p className="fs-wa-cta-body">
                Your blueprint tells you what to do. The YCC Community makes sure you actually do it — weekly check-ins, live Q&As, accountability partners, and a growing group of Nigerian healthcare professionals building income alongside you.
              </p>
            </div>

            <div className="fs-price-line">
              <span className="fs-price-cross">Regular: ₦15,000</span>
              <span className="fs-price-now">Launch: ₦5,000</span>
            </div>

            <button className="fs-pay-btn" onClick={() => onPay(selectedPaths)}>
              Unlock My Full Blueprint — ₦5,000 →
            </button>

            <p className="fs-secure-note">🔒 Secured by Paystack · Card, bank transfer & USSD</p>
            <p className="fs-restart-note">
              Not you?{" "}
              <button className="fs-restart-link" onClick={onReset}>Start over</button>
            </p>

            <button className="fs-back-btn" onClick={() => setScreen(3)}>← Change my path selection</button>
          </div>
        </div>
      )}

    </div>
  );
}
