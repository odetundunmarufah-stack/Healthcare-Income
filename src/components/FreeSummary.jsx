import { useMemo, useState } from "react";
import { getPaths } from "../utils/getPaths";

// ─── SCORE ────────────────────────────────────────────────────────────────────
const getScore = (answers) => {
  let score = 40;
  const skills = answers.non_clinical_skills || "";
  const tech = parseInt(answers.tech_comfort) || 0;
  const consistency = parseInt(answers.consistency) || 0;
  const freeText = (answers.biggest_blocker || "").toLowerCase();
  const energy = answers.energy_type || "";
  const visibility = answers.visibility_preference || "";
  if (skills.length > 30) score += 10;
  if (tech >= 7) score += 8; else if (tech >= 4) score += 4;
  if (consistency >= 7) score += 8; else if (consistency >= 4) score += 4;
  if (freeText.length > 30 && !freeText.includes("no idea") && !freeText.includes("nothing") && !freeText.includes("never tried")) score += 8;
  if (freeText.includes("already") || freeText.includes("currently") || freeText.includes("started")) score += 4;
  if (energy.includes("teacher") || energy.includes("engaging")) score += 6;
  if (visibility.includes("Fully visible") || visibility.includes("Professionally")) score += 4;
  if (answers.income_type_preference?.includes("Remote")) score += 4;
  return Math.min(score, 97);
};

// ─── ARCHETYPE (with strengths + mistakes) ────────────────────────────────────
const getArchetype = (answers) => {
  const energy = answers.energy_type || "";
  const visibility = answers.visibility_preference || "";
  const skills = answers.non_clinical_skills || "";
  const content = answers.content_comfort || "";
  const incomeType = answers.income_type_preference || "";
  const specialty = answers.specialty || "your specialty";
  const freeText = ((answers.biggest_blocker || "") + " " + (answers.specialty || "")).toLowerCase();

  if (freeText.includes("medva") || freeText.includes("medical va") || freeText.includes("virtual assistant") || freeText.includes("medical virtual")) return {
    name: "The Global Clinical Asset",
    tagline: "Your expertise has a market far beyond Nigeria — and you have not tapped it yet.",
    description: `Your answers point clearly toward remote and international income. Medical Virtual Assistant roles are actively hiring Nigerian ${specialty} professionals right now — no relocation, dollar pay, and your clinical background is the entry ticket.`,
    strengths: [
      "Strong technical grasp of clinical systems and documentation that international employers specifically seek",
      "Natural adaptability to asynchronous, remote workflows — already a habit in most Nigerian clinical environments",
      "High credibility with foreign employers precisely because of your clinical training, not despite it",
    ],
    mistakes: [
      "Underpricing their services by comparing rates to Nigerian hospital salaries instead of the international market",
      "Waiting to be fully ready before applying — most MedVA roles train on the job and hire for clinical thinking",
      "Applying to generic remote jobs instead of roles that specifically value clinical backgrounds",
    ],
  };
  if (freeText.includes("medical writ") || freeText.includes("med writing") || freeText.includes("clinical writ") || freeText.includes("pharma writ")) return {
    name: "The Clinical Knowledge Broker",
    tagline: "Your clinical authority is publishable — and pharmaceutical companies know it.",
    description: `Medical writing is one of the most overlooked remote income paths for Nigerian ${specialty} professionals. Your specialty gives you an edge that no English graduate can replicate. No camera, no social media, no audience needed.`,
    strengths: [
      "Deep scientific literacy that allows you to write accurately where generalist writers cannot",
      "Ability to translate complex clinical concepts into clear, compelling content — a rare and well-paid skill",
      "Built-in credibility with medical publishers, pharma companies, and health NGOs who prefer clinician writers",
    ],
    mistakes: [
      "Starting with the lowest-paying content mills instead of targeting medical communications agencies directly",
      "Writing without a niche — the highest-paid medical writers are known for one therapy area, not everything",
      "Waiting for a portfolio before pitching — one strong sample piece is enough to land a first client",
    ],
  };
  if (freeText.includes("aesthet") || freeText.includes("botox") || freeText.includes("filler") || freeText.includes("skincare clinic")) return {
    name: "The Clinical Aesthetics Expert",
    tagline: "Your medical training gives you an edge most aestheticians will never have.",
    description: `Medical aesthetics is one of the fastest-growing extensions of clinical practice in Nigeria — and your ${specialty} training puts you ahead of the competition before you even start.`,
    strengths: [
      "Medical credibility that allows you to command premium pricing non-clinical practitioners cannot justify",
      "Sound knowledge of anatomy and pharmacology that makes procedures safer and results more predictable",
      "Professional trust that converts easily into high-value, repeat clients in a relationship-driven market",
    ],
    mistakes: [
      "Over-investing in equipment before building a client base — the first 10 clients need minimal setup",
      "Undercharging to compete with non-medical practitioners instead of charging a premium for the medical-grade difference",
      "Skipping the regulatory groundwork — a clear MDCN-compliant structure protects you and signals professionalism",
    ],
  };
  if (freeText.includes("relocat") || freeText.includes("japa") || freeText.includes("abroad") || incomeType.includes("Remote") || incomeType.includes("dollar")) return {
    name: "The Global Clinical Asset",
    tagline: "Your expertise has a market far beyond Nigeria — and you have not tapped it yet.",
    description: `Your profile points strongly toward remote and international income. There are dollar-denominated roles built specifically for ${specialty} professionals that most Nigerian healthcare professionals have never heard of.`,
    strengths: [
      "International readiness — your profile signals the mindset and adaptability global employers screen for",
      "Cross-border clinical credibility that makes you competitive in markets where your specialty knowledge is scarcer",
      "Strong drive and self-motivation — the qualities remote employers weight most heavily in hiring decisions",
    ],
    mistakes: [
      "Treating relocation as the income strategy, when a remote income stream started now significantly de-risks the move",
      "Applying abroad without building a digital presence first — global employers verify credibility online before interviews",
      "Underestimating the value of Nigerian clinical experience to foreign employers who prize high-volume, resource-constrained settings",
    ],
  };
  if (energy.includes("teacher") || content.includes("courses") || content.includes("Writing")) return {
    name: "The Knowledge Monetiser",
    tagline: "You are sitting on a curriculum that people will pay to access.",
    description: `You have the rare combination of ${specialty} authority and the ability to communicate it clearly. Nigerian patients, students, and professionals are actively searching for what you know.`,
    strengths: [
      "Natural ability to break down complex clinical knowledge into digestible content that audiences trust",
      "Teacher energy that builds loyal audiences quickly — people return to educators who genuinely help them understand",
      "Ability to create content once and sell it repeatedly — one of the most scalable income models available",
    ],
    mistakes: [
      "Creating content before validating demand — the best-selling courses solve a problem the buyer already knows they have",
      "Trying to build everything at once rather than launching one focused product, gathering feedback, then expanding",
      "Pricing too low out of fear, when real competition in their specific niche is far thinner than it appears",
    ],
  };
  if (visibility.includes("faceless") || visibility.includes("brand")) return {
    name: "The Quiet Authority",
    tagline: "You do not need to be the face. You need to be the brain behind it.",
    description: "Your preference for staying behind the scenes is not a limitation — it is a strategy. Some of the most profitable healthcare income paths require zero personal visibility.",
    strengths: [
      "Disciplined focus on substance over performance — a genuine advantage in paths that reward depth over visibility",
      "Ability to build assets and written work that generate income without requiring daily personal presence",
      "Consistency under the radar — no burnout from public-facing demands means more sustainable long-term output",
    ],
    mistakes: [
      "Choosing faceless paths and under-investing in the quality of the product itself — the only thing that sells without a personal brand",
      "Avoiding any form of credibility signal — even behind-the-scenes professionals need one visible proof of expertise",
      "Mistaking low visibility for low effort — the most profitable faceless paths require focused, high-quality work",
    ],
  };
  if (energy.includes("connector") || energy.includes("community")) return {
    name: "The Clinical Community Builder",
    tagline: "Your network is an untapped asset. Your community is your business model.",
    description: "You have a natural ability to bring people together. In the healthcare income space, this translates into some of the most scalable and sustainable business models.",
    strengths: [
      "Natural relationship capital that converts into community trust faster than any paid marketing strategy",
      "Ability to identify common pain points across a group and build solutions that serve many people at once",
      "Long-term loyalty from communities built on genuine value — members stay, refer others, and buy more",
    ],
    mistakes: [
      "Building an audience before clarifying the income model — community building without a monetisation plan creates work without revenue",
      "Making the community too broad to charge for — the most profitable communities serve a very specific group",
      "Undervaluing their facilitation role — the ability to hold a room and create connection commands real pricing",
    ],
  };
  if (skills.includes("consulting") || skills.includes("Sales")) return {
    name: "The Clinical Strategist",
    tagline: "Organisations will pay serious money for what you see in five minutes.",
    description: `Your combination of ${specialty} knowledge and strategic thinking puts you in a rare category. Healthcare organisations, startups, and corporates need people who understand both medicine and business.`,
    strengths: [
      "Ability to diagnose problems and recommend solutions with the authority only clinical training provides",
      "Business-adjacent skills that allow you to operate in both clinical and commercial environments with equal fluency",
      "High-ticket positioning — consulting and advisory roles command fees volume-based income paths cannot match",
    ],
    mistakes: [
      "Selling time rather than outcomes — consultants who price by the hour leave most of their value on the table",
      "Failing to productise their expertise — the highest-earning consultants turn frameworks into packages, not just conversations",
      "Waiting for referrals instead of building a clear positioning statement that attracts the right organisations directly",
    ],
  };
  return {
    name: "The Underutilised Specialist",
    tagline: "Your clinical depth is your greatest untapped asset.",
    description: `You have built ${specialty} expertise that most people spend years trying to acquire. The challenge is not your capability — it is that nobody has shown you the specific paths that translate your skills into income.`,
    strengths: [
      "Deep clinical credibility that immediately separates you from non-clinical competitors across almost every income path",
      "Specialist knowledge narrow enough to command premium positioning in a market that rewards expertise",
      "A profile that is genuinely uncommon — the right opportunity, clearly communicated, faces very little real competition",
    ],
    mistakes: [
      "Treating their specialty as a limitation rather than the core asset it is — generalists cannot compete with genuine depth",
      "Looking for income paths that do not require their clinical knowledge, when the paths that do pay significantly more",
      "Starting too broadly instead of committing to one path long enough to generate real traction",
    ],
  };
};

// ─── BLOCKER (core + teaser) ──────────────────────────────────────────────────
const getBlocker = (answers) => {
  const blocker = (answers.biggest_blocker || "").toLowerCase();
  const consistency = parseInt(answers.consistency) || 5;
  const specialty = answers.specialty || "your specialty";

  if (blocker.includes("medva") || blocker.includes("medical va") || blocker.includes("virtual assistant") || blocker.includes("client")) return {
    core: "You already know the direction. The gap is not awareness — it is the specific knowledge of how to land your first client, what platforms to use, and how to position yourself for the exact roles that pay.",
    teaser: "There are also two less obvious blockers underneath this one that your blueprint identifies — one related to how you are presenting your experience, and one related to where you are looking for clients.",
  };
  if (blocker.includes("judg") || blocker.includes("colleague")) return {
    core: "The fear of professional judgment is quietly keeping more talented Nigerian clinicians stuck than any skills gap ever has.",
    teaser: "Underneath this, your blueprint identifies two additional layers — one structural and one psychological — that most people in your position are not aware of. Both have practical, MDCN-aware solutions.",
  };
  if (blocker.includes("pay") || blocker.includes("worth") || blocker.includes("confiden")) return {
    core: "The doubt about whether people will pay you is imposter syndrome — almost universal among high-achieving clinicians. The more qualified you are, the more you question your right to charge.",
    teaser: "There are also specific pricing and positioning mistakes that reinforce this doubt in ways that feel like evidence but are not. Your blueprint names them and addresses each one directly.",
  };
  if (blocker.includes("time") || blocker.includes("busy") || blocker.includes("schedule")) return {
    core: "The real issue is not time — it is the absence of a system that works within the time you actually have. Most income-building advice assumes availability you do not have.",
    teaser: "Your blueprint also identifies two additional reasons why time-constrained professionals in your position stall — one about path choice and one about the order of actions — and gives a specific sequence built around your actual hours.",
  };
  if (blocker.includes("start") || blocker.includes("begin") || blocker.includes("overwhelm") || blocker.includes("where")) return {
    core: "The paralysis of not knowing where to start is the most common barrier we see — and it has nothing to do with capability. It is almost always a clarity problem, not a readiness problem.",
    teaser: "There are also two specific decision points that most people in your position get stuck at after they begin. Your blueprint names both and tells you exactly what to do at each one.",
  };
  if (blocker.includes("tried") || blocker.includes("before") || blocker.includes("stopped") || blocker.includes("failed")) return {
    core: "You have started before and lost momentum. That is not a character flaw — it is a system problem. The approach did not fit your actual situation.",
    teaser: "Your blueprint also identifies what specifically caused the momentum loss — and it is usually one of three predictable patterns. Knowing which one applies to you changes the entire strategy going forward.",
  };
  if (blocker.includes("relocat") || blocker.includes("japa") || blocker.includes("abroad")) return {
    core: "Planning to relocate actually makes your income path more urgent, not less. Building a remote income stream before you leave is one of the most strategically sound decisions you can make right now.",
    teaser: "There are also two timing mistakes that professionals in your position commonly make that your blueprint addresses specifically — one about what to build first, and one about how to sequence the transition.",
  };
  if (consistency <= 4) return {
    core: "You have started before and lost momentum. That is not a personality problem — it is a system problem. Willpower-based approaches fail almost everyone with your schedule.",
    teaser: "Your blueprint also identifies which type of momentum loss is most likely for your profile — and gives a sprint-based structure designed specifically around inconsistent availability.",
  };
  return {
    core: `Something specific is standing between you and the income your ${specialty} background should be generating. Your blueprint names it clearly and gives you a route around it — not through motivation, but through a plan built for your actual situation.`,
    teaser: "There are also usually one or two less visible blockers underneath the main one. Your blueprint surfaces both and addresses all three with a specific, ordered action plan.",
  };
};

// ─── CLIENT-SIDE PERSONALISED PREVIEWS ───────────────────────────────────────
const getSignatureOfferSnippet = (answers, primaryPathId) => {
  const specialty = answers.specialty || "your specialty";
  const profession = answers.profession || "healthcare professional";
  const availability = answers.availability || "";
  const incomeGoal = answers.income_goal || "";
  const isLowHours = availability.includes("1 to 3") || availability.includes("4 to 7");
  const wantsDollar = incomeGoal.includes("Dollar") || (answers.income_type_preference || "").toLowerCase().includes("remote");

  const map = {
    remote_medva: wantsDollar
      ? `The ${specialty} Remote Clinical Support Package — offered to US-based clinics at $15 to $25/hour, positioned specifically around your ${specialty} background`
      : `The ${specialty} Clinical Remote Assistant Service — packaged as a monthly retainer for healthcare practices needing part-time clinical administrative support`,
    prior_auth: `The ${specialty} Prior Authorisation Review Service — offered to US insurance platforms as a specialist reviewer at $18 to $28/hour, with your clinical training as the primary differentiator`,
    med_writing: `The ${specialty} Clinical Content Package — a retainer service for pharma companies, health NGOs, and medical publishers needing a credentialled clinician to write and fact-check health content`,
    private_consult: isLowHours
      ? `The ${specialty} Private Consultation Session — a 45-minute session offered via WhatsApp or Zoom at ₦15,000 to ₦30,000, with a simple 3-session starter package`
      : `The ${specialty} Monthly Wellness Advisory Retainer — two consultations, one written summary, and direct WhatsApp access at ₦40,000 to ₦80,000/month`,
    health_content: `The Trusted ${specialty} — a personal brand content series positioning you as the go-to ${specialty} voice for Nigerian audiences on one specific condition`,
    digital_products: `The ${specialty} Professional's Guide — a focused digital product sold on Selar for ₦3,500 to ₦8,000, targeting a specific recurring problem patients or junior clinicians face`,
    online_courses: `The ${specialty} Masterclass — a structured 4-module online course hosted on Selar or WhatsApp, targeting ${profession === "Doctor" ? "medical students or housemen" : "nursing students or junior clinicians"}`,
    corporate_wellness: `The Workplace Health Talk — a 60-minute in-person or virtual session offered to Nigerian companies at ₦50,000 to ₦120,000 per engagement`,
    health_coaching: `The ${specialty} 90-Day Health Advisory Programme — delivered via weekly WhatsApp check-ins and monthly video calls at ₦45,000 to ₦90,000 per programme`,
    tech_clinical: `The ${specialty} Digital Health Advisor — a consulting offer to Nigerian health tech startups who need a credentialled ${specialty} professional to advise on clinical accuracy and workflow`,
    health_tech: `The ${specialty} Clinical Co-Founder Profile — a positioning package for health tech ventures, with one signature advisory offer at ₦150,000 to ₦300,000 per engagement`,
    aesthetics: `The ${specialty} Aesthetics Clinic Starter — one primary service offered to 5 clients at ₦25,000 to ₦50,000, designed to generate first testimonials and referrals within 30 days`,
    community_building: `The ${specialty} Professional Circle — a paid WhatsApp or Telegram community offered at ₦3,000 to ₦5,000/month, starting with 20 founding members from your existing network`,
  };
  return map[primaryPathId] || `A signature offer built around your ${specialty} expertise, priced and packaged for the Nigerian market — with your first client strategy mapped out in Week 1.`;
};

const getWeekOneAction = (answers, primaryPathId) => {
  const specialty = answers.specialty || "your specialty";
  const availability = answers.availability || "";
  const isVeryLow = availability.includes("1 to 3");

  const map = {
    remote_medva: isVeryLow
      ? `Update your LinkedIn headline to read: "${specialty} Clinician | Open to Remote Clinical Support Roles" — this takes 10 minutes and begins signalling your availability to international platforms`
      : `Create a 1-page clinical background summary formatted for remote MedVA applications — your blueprint gives you the exact template and the three platforms where ${specialty} professionals are currently being hired`,
    prior_auth: `Complete your free ACMA certification self-assessment — your blueprint tells you exactly which modules a ${specialty} professional can skip and which are mandatory for the first application`,
    med_writing: `Write one 400-word clinical explainer on a topic from your ${specialty} practice — this becomes your portfolio piece, and your blueprint tells you exactly where to submit it for your first paid project`,
    private_consult: `Send one message to 10 people in your existing network announcing a limited private consultation service — your blueprint gives you the exact WhatsApp message template`,
    health_content: `Post one piece of content that answers a question you were asked in clinic this week — your blueprint identifies the three content formats that drive fastest audience growth for ${specialty} professionals`,
    digital_products: `Write down the top 3 questions patients or junior clinicians ask you most often — your blueprint turns the most common one into your first product outline within Week 1`,
    online_courses: `Create a 5-point outline for one course module on a clinical topic you could teach in your sleep — your blueprint builds your full course structure from this starting point`,
    corporate_wellness: `Identify 3 companies within your existing network and draft one outreach message — your blueprint gives you the exact pitch template`,
    health_coaching: `Draft a 3-sentence description of exactly who you help, what you help them with, and what outcome they get — this becomes your positioning statement`,
    tech_clinical: `Identify one Nigerian health tech company whose product touches your ${specialty} area and find their contact email — your blueprint gives you the exact advisory pitch structure`,
    health_tech: `Map out one specific clinical problem in ${specialty} practice that a digital tool could solve — your blueprint turns this into your first health tech positioning piece`,
    aesthetics: `Research the 3 most in-demand aesthetic procedures in your city this month — your blueprint identifies which one a ${specialty} professional can enter fastest`,
    community_building: `List 20 people in your existing network who would benefit from a focused community around your ${specialty} — your blueprint turns this into your founding member outreach sequence`,
  };
  return map[primaryPathId] || `Take one specific, concrete action related to your chosen path — your blueprint tells you exactly what it is based on your available hours this week.`;
};

const getTier1Opportunity = (answers, primaryPathId) => {
  const specialty = answers.specialty || "your specialty";
  const wantsDollar = (answers.income_type_preference || "").toLowerCase().includes("remote") || (answers.income_goal || "").includes("Dollar");

  const map = {
    remote_medva: wantsDollar
      ? `Dollar-Paying Remote Documentation Role — ${specialty} professionals are being hired right now at $15 to $25/hour by US telehealth platforms that do not require prior VA experience`
      : `Remote Clinical Administrative Role — Nigerian healthcare platforms are actively hiring clinicians with ${specialty} backgrounds for remote support at ₦150,000 to ₦300,000/month`,
    prior_auth: `Prior Authorisation Reviewer — US insurance companies are currently hiring ${specialty}-background clinicians for remote case review at $18 to $30/hour`,
    med_writing: `Health NGO Content Brief — international and Nigerian health organisations commission clinicians for 800 to 1,200 word health explainers at $50 to $150 per piece`,
    private_consult: `WhatsApp Private Consultation — your first paying client can be booked this week through your existing network at ₦15,000 to ₦30,000 per session`,
    health_content: `Sponsored Health Post — brands in the maternal health, nutrition, and pharmaceutical space pay ${specialty} professionals ₦20,000 to ₦80,000 per sponsored post`,
    digital_products: `Selar Digital Product — a focused ${specialty} guide priced at ₦3,500 to ₦7,000 can reach profitability within 30 days launched into your existing WhatsApp network`,
    online_courses: `WhatsApp Cohort Programme — a 4-week guided programme on a specific ${specialty} topic at ₦10,000 to ₦25,000 per participant, run entirely within WhatsApp`,
    corporate_wellness: `Company Health Talk — Nigerian companies in banking and FMCG are booking ${specialty} professionals for 60-minute wellness sessions at ₦50,000 to ₦150,000`,
    health_coaching: `Chronic Condition Advisory Package — patients managing conditions within your ${specialty} area are paying ₦30,000 to ₦80,000 for structured 8-week guidance`,
    tech_clinical: `Health Tech Advisory Session — Nigerian telemedicine companies pay ₦50,000 to ₦150,000 for a structured clinical advisory session with a ${specialty} professional`,
    health_tech: `Clinical Co-Founder Positioning — your ${specialty} background qualifies you for equity and advisory fee arrangements with health tech startups that need medical credibility`,
    aesthetics: `First Aesthetics Client — a single botox or filler session at ₦40,000 to ₦80,000 in your city can be booked within your first two weeks through your professional network`,
    community_building: `Founding Member Launch — 20 founding members at ₦3,000/month generates ₦60,000 in recurring monthly income from your first month`,
  };
  return map[primaryPathId] || `A high-fit, zero-cost-to-enter opportunity specific to ${specialty} professionals on your chosen path — detailed in your Opportunity Map with naira projections.`;
};

const getTransitionRationale = (answers, selectedPaths, paths) => {
  const primaryLabel = paths.find(p => p.id === selectedPaths[0])?.label || selectedPaths[0] || "";
  const secondaryLabel = selectedPaths[1] ? (paths.find(p => p.id === selectedPaths[1])?.label || selectedPaths[1]) : null;
  const energy = (answers.energy_type || "").toLowerCase();
  const skills = (answers.non_clinical_skills || "").toLowerCase();
  const incomeType = (answers.income_type_preference || "").toLowerCase();
  const availability = answers.availability || "";

  const reasons = [];
  if (incomeType.includes("remote") || (answers.biggest_blocker || "").toLowerCase().includes("remote")) reasons.push("your strong preference for remote and flexible income");
  if (skills.length > 20) reasons.push("the additional skills you bring beyond your clinical training");
  if (energy.includes("teacher") || energy.includes("engaging")) reasons.push("your natural ability to communicate and simplify complex information");
  if (energy.includes("analytical") || energy.includes("systems")) reasons.push("your analytical approach and comfort with structured work");
  if (energy.includes("connector") || energy.includes("community")) reasons.push("your ability to build relationships and bring people together");
  if (availability.includes("1 to 3") || availability.includes("4 to 7")) reasons.push("your current schedule, which called for a path with a lower initial time demand");
  if (reasons.length === 0) reasons.push(`your ${answers.specialty || "clinical"} background and the specific goals you described`);

  const rationale = reasons.length === 1 ? reasons[0]
    : reasons.length === 2 ? `${reasons[0]} and ${reasons[1]}`
    : `${reasons.slice(0, -1).join(", ")}, and ${reasons[reasons.length - 1]}`;

  return { primaryLabel, secondaryLabel, rationale };
};

const TOTAL_SCREENS = 3;

export default function FreeSummary({ answers, userName, onPay, onScoreReady, onReset, onSummaryReady }) {
  const [screen, setScreen] = useState(0);
  const [selectedPaths, setSelectedPaths] = useState([]);
  const [emailSent, setEmailSent] = useState(false);

  const score    = useMemo(() => getScore(answers), [answers]);
  const archetype = useMemo(() => getArchetype(answers), [answers]);
  const blocker  = useMemo(() => getBlocker(answers), [answers]);
  const paths    = useMemo(() => getPaths(answers), [answers]);

  useMemo(() => { if (onScoreReady) onScoreReady(score, archetype); }, [score, archetype]);

  const scoreColor = score >= 75 ? "#16a34a" : score >= 55 ? "#c8a030" : "#dc2626";
  const scoreLabel = score >= 75 ? "High Readiness" : score >= 55 ? "Moderate Readiness" : "Building Phase";
  const firstName = userName ? userName.split(" ")[0] : null;

  const handleContinueToPath = () => {
    if (!emailSent && onSummaryReady) {
      onSummaryReady(score, archetype, paths[0]?.label || "");
      setEmailSent(true);
    }
    setScreen(1);
  };

  const togglePath = (id) => {
    setSelectedPaths(prev => {
      if (prev.includes(id)) return prev.filter(p => p !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const primaryPathId = selectedPaths[0] || null;
  const transition    = useMemo(() => selectedPaths.length ? getTransitionRationale(answers, selectedPaths, paths) : null, [answers, selectedPaths, paths]);
  const sigOffer      = useMemo(() => primaryPathId ? getSignatureOfferSnippet(answers, primaryPathId) : "", [answers, primaryPathId]);
  const week1Action   = useMemo(() => primaryPathId ? getWeekOneAction(answers, primaryPathId) : "", [answers, primaryPathId]);
  const tier1Opp      = useMemo(() => primaryPathId ? getTier1Opportunity(answers, primaryPathId) : "", [answers, primaryPathId]);

  return (
    <div className="fs-wrap">

      {/* HEADER */}
      <div className="fs-header">
        <div className="fs-logo">Your<span>Clinical</span>Currency</div>
        <div className="fs-dots">
          {Array.from({ length: TOTAL_SCREENS }).map((_, i) => (
            <div key={i} className={`fs-dot${i === screen ? " fs-dot-active" : i < screen ? " fs-dot-done" : ""}`} />
          ))}
        </div>
      </div>

      {/* ══ SCREEN 0 ══ */}
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
                      : "You are earlier in the journey. Your blueprint is designed for exactly this stage."}
                  </p>
                </div>
              </div>
            </div>

            {/* Archetype — enhanced */}
            <div className="fs-block">
              <div className="fs-block-label">YOUR CLINICAL CURRENCY ARCHETYPE</div>
              <div className="fs-archetype-card">
                <div className="fs-archetype-name">"{archetype.name}"</div>
                <div className="fs-archetype-tagline">{archetype.tagline}</div>
                <p className="fs-archetype-desc">{archetype.description}</p>

                <div className="fs-archetype-detail">
                  <div className="fs-archetype-section">
                    <div className="fs-archetype-section-label" style={{ marginTop: 18 }}>3 strengths this archetype typically has</div>
                    <ul className="fs-trait-list">
                      {archetype.strengths.map((s, i) => (
                        <li key={i} className="fs-trait-item fs-trait-strength">
                          <span className="fs-trait-icon">✓</span><span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="fs-archetype-section">
                    <div className="fs-archetype-section-label" style={{ marginTop: 18 }}>3 mistakes people with this archetype usually make</div>
                    <ul className="fs-trait-list">
                      {archetype.mistakes.map((m, i) => (
                        <li key={i} className="fs-trait-item fs-trait-mistake">
                          <span className="fs-trait-icon">→</span><span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="fs-archetype-blueprint-hook">
                    Your blueprint identifies which of these mistakes is most likely to apply to your specific situation — and gives you a practical way to avoid it.
                  </div>
                </div>
              </div>
            </div>

            {/* Blocker — enhanced */}
            <div className="fs-block">
              <div className="fs-block-label">YOUR KEY BLOCKER</div>
              <div className="fs-blocker-card">
                <p className="fs-blocker-text">{blocker.core}</p>
                <div className="fs-blocker-underneath">
                  <div className="fs-blocker-underneath-label">What sits underneath this</div>
                  <p className="fs-blocker-underneath-text">{blocker.teaser}</p>
                </div>
              </div>
            </div>

            <button className="fs-next-btn" onClick={handleContinueToPath}>
              See My Income Paths →
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
              See What We Found →
            </button>
            <button className="fs-back-btn" onClick={() => setScreen(0)}>← Back</button>
          </div>
        </div>
      )}

      {/* ══ SCREEN 2 — PERSONALISED TRANSITION + PAYMENT ══ */}
      {screen === 2 && transition && (
        <div className="fs-screen">
          <div className="fs-screen-inner">

            {/* Personalised header */}
            <div className="fs-badge">Your Blueprint Is Ready</div>
            <h1 className="fs-screen-title">
              {firstName ? `${firstName}, your strategy is prepared.` : "Your strategy is prepared."}
            </h1>
            <p className="fs-transition-intro">
              Based on your assessment, {transition.primaryLabel}{transition.secondaryLabel ? ` and ${transition.secondaryLabel}` : ""} {transition.secondaryLabel ? "complement" : "matches"} your {answers.specialty || "clinical"} background well — specifically because of {transition.rationale}.
            </p>

            {/* What the blueprint covers */}
            <div className="fs-transition-coverage">
              <div className="fs-transition-coverage-label">Your blueprint explains:</div>
              <ul className="fs-transition-list">
                {transition.secondaryLabel ? (
                  <>
                    <li>Which of your two paths to start with first — and why it ranks higher for your profile</li>
                    <li>How to run both paths in parallel once you have traction on the first</li>
                  </>
                ) : (
                  <li>Why {transition.primaryLabel} is the strongest immediate fit for your specific background</li>
                )}
                <li>Your first offer — what to sell, how to price it, and who to sell it to in Week 1</li>
                <li>Your recommended certifications — what to get, in what order, and why each one matters</li>
                <li>Your personalised 30-day roadmap — built around your actual schedule</li>
                <li>Your realistic income trajectory at 3, 6, and 12 months</li>
              </ul>
            </div>

            {/* Personalised preview cards */}
            <div className="fs-previews-section">
              <div className="fs-previews-label">A glimpse inside your blueprint</div>

              <div className="fs-preview-card">
                <div className="fs-preview-card-tag">YOUR SIGNATURE OFFER</div>
                <div className="fs-preview-card-title">What you will be selling first</div>
                <p className="fs-preview-card-body">{sigOffer}</p>
                <div className="fs-preview-card-fade">Your blueprint includes the exact pricing, platform, and the message you send to your first client...</div>
              </div>

              <div className="fs-preview-card">
                <div className="fs-preview-card-tag">WEEK 1 — FIRST ACTION</div>
                <div className="fs-preview-card-title">Where you start</div>
                <p className="fs-preview-card-body">{week1Action}</p>
                <div className="fs-preview-card-fade">Your full 30-day roadmap continues from here, week by week...</div>
              </div>

              <div className="fs-preview-card">
                <div className="fs-preview-card-tag">TIER 1 OPPORTUNITY</div>
                <div className="fs-preview-card-title">Your highest-ranked immediate opportunity</div>
                <p className="fs-preview-card-body">{tier1Opp}</p>
                <div className="fs-preview-card-fade">Your blueprint maps three more Tier 1 opportunities ranked by speed and income potential...</div>
              </div>
            </div>

            {/* Payment card */}
            <div className="fs-paywall-card">
              <div className="fs-pw-ready-badge">
                <span className="fs-pw-ready-dot" />
                Your personalised blueprint is ready
              </div>
              <h2 className="fs-paywall-h">Unlock Your Full Clinical Currency Blueprint</h2>
              <p className="fs-paywall-sub">
                We have finished analysing your assessment. Everything above is already built for you — 17 sections of specific, actionable strategy based on your {answers.profession || "healthcare"} background in {answers.specialty || "your specialty"}.
              </p>

              <div className="fs-what-list">
                {[
                  "🔬 Your Clinical Edge — what makes your background monetisable right now",
                  "🗺️ Full Opportunity Map — every income path ranked by fit and speed",
                  `🎯 Your Signature Offer — ${transition.primaryLabel} specific, priced for your market`,
                  "🎓 Skills and Certifications Roadmap — what to learn and what it unlocks",
                  "📅 30-Day Roadmap — week by week around your actual schedule",
                  "📈 Income Trajectory — honest projections at 3, 6, and 12 months",
                  "🧠 Mindset Audit — your specific blockers named and dismantled",
                ].map((item, i) => (
                  <div key={i} className="fs-what-item">{item}</div>
                ))}
              </div>

              <div className="fs-bonus-strip">
                <div className="fs-bonus-label">🎁 Free bonuses included:</div>
                <div className="fs-bonus-row">✓ First ₦100k Checklist — specific to {transition.primaryLabel}</div>
                <div className="fs-bonus-row">✓ 30 Content Ideas for {answers.specialty || "your specialty"} professionals</div>
                <div className="fs-bonus-row">✓ Access to the YCC Community</div>
              </div>

              <div className="fs-wa-strip">
                <span className="fs-wa-strip-icon">💬</span>
                <div>
                  <div className="fs-wa-strip-title">The YCC Community — free with your blueprint</div>
                  <p className="fs-wa-strip-body">Weekly check-ins, live Q&As, accountability partners, and a growing group of Nigerian healthcare professionals building income alongside you. Your report tells you what to do. The community makes sure you actually do it.</p>
                </div>
              </div>

              <div className="fs-price-line">
                <span className="fs-price-cross">Regular: ₦5,000</span>
                <span className="fs-price-now">Launch price: ₦3,500</span>
              </div>

              <button className="fs-pay-btn" onClick={() => onPay(selectedPaths)}>
                Unlock My Full Blueprint — ₦3,500 →
              </button>

              <p className="fs-secure-note">🔒 Secured by Paystack · Card, bank transfer and USSD</p>
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
