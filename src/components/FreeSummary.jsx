// FreeSummary — generated instantly from quiz answers, NO API call needed

import { useMemo } from "react";

const getIncomeCategories = (answers) => {
  const cats = [];
  const skills = answers.non_clinical_skills || "";
  const type = answers.income_type_preference || "";
  const visibility = answers.visibility_preference || "";
  const content = answers.content_comfort || "";
  const profession = answers.profession || "";
  const specialty = answers.specialty || "";

  if (type.includes("Remote") || type.includes("foreign currency")) {
    cats.push({ icon: "🟢", label: "Remote & Dollar Income", reason: `Your ${specialty || profession} background qualifies you for remote clinical roles paying in USD or GBP — medical writing, virtual assistance, utilisation review, and prior authorisation.` });
  }
  if (skills.includes("Teaching") || skills.includes("writing") || content.includes("Writing")) {
    cats.push({ icon: "🟢", label: "Health Content & Education", reason: `Your ability to explain complex clinical concepts clearly is a rare and monetisable skill. Nigerian audiences are actively paying for trusted health education from credentialed professionals.` });
  }
  if (type.includes("passive") || type.includes("Passive")) {
    cats.push({ icon: "🟢", label: "Digital Products & Passive Income", reason: `Based on your goals, digital products — e-books, templates, recorded courses — can generate income from your clinical knowledge without adding to your workload.` });
  }
  if (visibility.includes("Fully visible") || visibility.includes("Professionally visible")) {
    cats.push({ icon: "🟢", label: "Consulting & Private Practice", reason: `Your comfort with visibility means you can build a recognisable personal brand that converts directly into premium consultation income.` });
  }
  if (type.includes("Business") || type.includes("scalable")) {
    cats.push({ icon: "🟢", label: "Healthcare Business & Platforms", reason: `Your interest in ownership positions you to build something that scales beyond your personal hours — a clinic, platform, or healthcare product business.` });
  }
  if (skills.includes("Social media") || skills.includes("Graphic design")) {
    cats.push({ icon: "🟢", label: "Digital Marketing & Brand Consulting", reason: `Your non-clinical digital skills open income paths that most healthcare professionals overlook entirely — including working with health brands, pharma, and wellness businesses.` });
  }

  // Always ensure at least 3
  if (cats.length < 3) {
    cats.push({ icon: "🟢", label: "Private Consultations & Advisory", reason: `Your clinical training gives you the authority to offer paid one-on-one advisory services to patients and organisations who cannot access specialist care affordably.` });
  }
  if (cats.length < 3) {
    cats.push({ icon: "🟢", label: "Clinical Training & Workshops", reason: `Healthcare professionals and students are actively seeking practical clinical education. Your experience qualifies you to teach and earn from it.` });
  }

  return cats.slice(0, 3);
};

const getStrength = (answers) => {
  const specialty = answers.specialty || "your specialty";
  const experience = answers.experience_years || "";
  const skills = answers.non_clinical_skills || "";
  const writing = parseInt(answers.writing_strength) || 5;
  const speaking = parseInt(answers.speaking_confidence) || 5;

  if (writing >= 7) return `Your strongest asset is your ability to communicate clinical knowledge in writing. Very few healthcare professionals in Nigeria combine ${specialty} expertise with genuine writing fluency — this is the intersection where premium income lives. Content, medical writing, and digital education are paths you can enter faster than most.`;
  if (speaking >= 7) return `Your strongest asset is your ability to speak and present with confidence. In a market where most clinicians stay silent, your willingness to be visible and vocal with ${specialty} expertise creates immediate authority. Workshops, consulting, and high-ticket advisory are your fastest paths.`;
  if (skills.includes("Teaching")) return `Your strongest asset is your teaching instinct. The ability to simplify complex ${specialty} concepts for non-clinical audiences is rare and valuable. Nigerian patients, students, and corporate professionals are willing to pay for exactly this kind of accessible expert guidance.`;
  return `Your strongest asset is your clinical credibility. With ${experience ? experience.split("—")[0].trim() : "significant"} years of ${specialty} experience, you carry a level of authority that no amount of marketing can manufacture. In a market flooded with unqualified health voices, your credentials are your greatest competitive advantage.`;
};

const getBlocker = (answers) => {
  const blocker = answers.biggest_blocker || "";
  const judgment = answers.colleague_judgment || "";
  const selfBelief = parseInt(answers.self_belief) || 5;
  const consistency = parseInt(answers.consistency) || 5;

  if (judgment.includes("Significantly")) return `Your biggest blocker is the weight of what your colleagues might think. This is the single most reported barrier among Nigerian healthcare professionals, and it is keeping more talented clinicians stuck than any skills gap or time constraint ever could. The full blueprint addresses this directly with a practical, MDCN-aware framework for building income without professional exposure.`;
  if (selfBelief <= 4) return `Your biggest blocker is self-doubt — specifically, the fear that your knowledge is not worth paying for. This is imposter syndrome, and it is almost universal among high-achieving clinicians. The painful irony is that the more qualified you are, the more you question your right to charge. Your full blueprint reframes this completely with specific pricing psychology built for the Nigerian healthcare market.`;
  if (consistency <= 4) return `Your biggest blocker is momentum — you start strong but struggle to sustain the effort long enough to see results. This is not a character flaw. It is a system problem. Your full blueprint is specifically designed around sprint-based milestones rather than daily habits, so your progress does not depend on willpower alone.`;
  if (blocker.toLowerCase().includes("time") || blocker.toLowerCase().includes("schedule")) return `Your biggest blocker is time — or more precisely, the belief that you do not have enough of it. Your full blueprint is built around your exact available hours and shows you precisely which income paths require the least time to generate the most income for your specific profile.`;
  return `Your biggest blocker is not knowing where to start — a paralysis that comes not from lack of ability but from having too many options and no clear, personalised direction. Your full blueprint solves this with a single recommended starting point and a week-by-week plan built specifically around your specialty, schedule, and personality.`;
};

export default function FreeSummary({ answers, userName, onPay, onReset }) {
  const categories = useMemo(() => getIncomeCategories(answers), [answers]);
  const strength = useMemo(() => getStrength(answers), [answers]);
  const blocker = useMemo(() => getBlocker(answers), [answers]);

  const profession = answers.profession || "Healthcare Professional";
  const specialty = answers.specialty || "";
  const location = answers.location || "";
  const experience = answers.experience_years || "";

  const profileSummary = `You are a ${specialty ? specialty + " " : ""}${profession}${location ? " based in " + location : ""}${experience ? " with " + experience.split("—")[0].trim() + " of clinical experience" : ""}. Based on your 25 answers, our assessment engine has built a detailed picture of your income readiness — your skills, your personality, your goals, and what is genuinely holding you back. What follows is your free profile summary. Your full blueprint is one step away.`;

  return (
    <div className="fs-wrap">
      <div className="fs-top">
        <div className="fs-logo">Your<span>Clinical</span>Currency</div>
        <div className="fs-badge">Your Free Profile Summary</div>
        <h1 className="fs-title">
          {userName ? `${userName}, here is what we found.` : "Here is what we found."}
        </h1>
        <p className="fs-subtitle">
          Based on your 25 answers, our assessment engine has identified your clinical income profile. This is your free summary — your full blueprint is one step away.
        </p>
      </div>

      <div className="fs-card">
        <div className="fs-content">

          <div className="fs-section">
            <div className="fs-section-title">YOUR CAREER PROFILE SUMMARY</div>
            <div className="fs-section-body">
              <p className="fs-para">{profileSummary}</p>
            </div>
          </div>

          <div className="fs-section">
            <div className="fs-section-title">YOUR TOP 3 INCOME CATEGORIES</div>
            <div className="fs-section-body">
              {categories.map((cat, i) => (
                <div key={i} className="fs-bullet">
                  <span className="fs-bullet-dot">🟢</span>
                  <span><strong>{cat.label}</strong> — {cat.reason}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="fs-section">
            <div className="fs-section-title">YOUR KEY STRENGTH</div>
            <div className="fs-section-body">
              <p className="fs-para">{strength}</p>
            </div>
          </div>

          <div className="fs-section">
            <div className="fs-section-title">YOUR KEY BLOCKER</div>
            <div className="fs-section-body">
              <p className="fs-para">{blocker}</p>
            </div>
          </div>

        </div>
      </div>

      <div className="fs-paywall">
        <div className="fs-paywall-inner">
          <div className="fs-lock">🔒</div>
          <h2 className="fs-paywall-title">Your Full Clinical Currency Blueprint</h2>
          <p className="fs-paywall-body">
            Your free summary shows you the categories. Your full blueprint shows you exactly what to do, how to start, how much to charge, and your precise 30-day action plan.
          </p>

          <div className="fs-what-you-get">
            <div className="fs-wg-title">What unlocks for ₦5,000:</div>
            {[
              "🔬 Your Clinical Edge — exactly what makes your background uniquely monetisable",
              "🗺️ Full Opportunity Map — all income paths ranked by fit and speed to income",
              "🎯 Your Signature Offer — the one thing to start with and exactly how to price it",
              "🎓 Skills & Certifications Roadmap — exactly what to learn and where to get certified",
              "📅 30-Day Roadmap — week-by-week tasks built around your clinical schedule",
              "📈 Income Trajectory — projections at 3, 6, and 12 months",
              "🧠 Mindset Audit — your specific blockers named and addressed with practical fixes",
            ].map((item, i) => (
              <div key={i} className="fs-wg-item">{item}</div>
            ))}
          </div>

          <div className="fs-bonuses">
            <div className="fs-bonus-title">🎁 Bonuses included at no extra cost:</div>
            <div className="fs-bonus-item">✓ The First ₦100k Checklist — exactly what to do in 30 days</div>
            <div className="fs-bonus-item">✓ 30 Content Ideas tailored to your specialty</div>
            <div className="fs-bonus-item">✓ Access to the Private Your Clinical Currency Community</div>
          </div>

          <div className="fs-price-row">
            <span className="fs-price-old">Regular price: ₦15,000</span>
            <span className="fs-price-now">Launch price: ₦5,000</span>
          </div>

          <button className="fs-pay-btn" onClick={onPay}>
            Unlock My Full Blueprint — ₦5,000 →
          </button>

          <p className="fs-secure">🔒 Secured by Paystack · Card, bank transfer & USSD accepted</p>
          <p className="fs-restart">Not you? <button className="fs-link" onClick={onReset}>Start over</button></p>
        </div>
      </div>
    </div>
  );
}
