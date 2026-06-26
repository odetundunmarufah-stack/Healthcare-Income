import { useState } from "react";
import { STEPS } from "./data/steps";
import { parseSections } from "./utils/parseSections";
import LandingPage from "./components/LandingPage";
import LeadGate from "./components/LeadGate";
import QuizStep from "./components/QuizStep";
import FreeSummary from "./components/FreeSummary";
import LoadingScreen from "./components/LoadingScreen";
import ResultsPage from "./components/ResultsPage";
import PaymentGate from "./components/PaymentGate";
import { buildUserMessage, SYSTEM_PROMPT } from "./utils/buildPrompt";
import "./styles/app.css";

const OTHER_OPTION = "Other — please describe below";

// ─── EMAILJS CONFIG ───────────────────────────────────────────────────────────
const EMAILJS_SERVICE_ID = "service_skrb4zu";
const EMAILJS_TEMPLATE_ID = "template_cp2v8ja";
const EMAILJS_PUBLIC_KEY = "E5Ak4CU7HZlplLiGP";

// ─── FORMSPREE LEAD CAPTURE ───────────────────────────────────────────────────
const captureLead = async (name, email) => {
  try {
    await fetch("https://formspree.io/f/mrevgoyw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, source: "quiz_start", timestamp: new Date().toISOString() }),
    });
  } catch {}
};

// ─── EMAILJS REPORT LINK DELIVERY ────────────────────────────────────────────
const sendReportEmail = async (name, email, reportKey) => {
  try {
    if (!window.emailjs) {
      await new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
    }
    const reportUrl = `${window.location.origin}?report=${reportKey}`;
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_name: name || "Healthcare Professional",
      to_email: email,
      report_link: reportUrl,
      from_name: "Your Clinical Currency",
      message: `Thank you for purchasing your Clinical Currency Blueprint. This means a lot, and we do not take it lightly.

Your full personalised report has been generated and is ready for you right now. It includes everything built specifically around your specialty, your personality, and the income path you chose — your 30-day action plan, your signature offer, your skills and certifications roadmap, income projections, and much more.

Your bonuses are inside your report:
- The First ₦100k Checklist — specific to your chosen path
- 30 Content Ideas tailored to your specialty
- Full access to the YCC Community

Speaking of the YCC Community — please join as soon as you can. This is where implementation actually happens. Your blueprint tells you what to do. The community makes sure you do it, with weekly check-ins, live Q&As, accountability partners, and a group of Nigerian healthcare professionals who are building income right alongside you.

Join the YCC Community here: https://chat.whatsapp.com/KqhTYdiG4LjF9IrxPRWnD2

Your report is one tap away. We are rooting for you.`,
    });
  } catch (e) {
    console.log("Email send failed:", e);
  }
};

// ─── EMAILJS FREE SUMMARY FOLLOW-UP ──────────────────────────────────────────
const sendFreeSummaryEmail = async (name, email, archetype, topPath, summaryKey) => {
  try {
    if (!window.emailjs) {
      await new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
    }
    const returnUrl = `${window.location.origin}?summary=${encodeURIComponent(summaryKey)}`;
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_name: name || "Healthcare Professional",
      to_email: email,
      from_name: "Your Clinical Currency",
      whatsapp_link: "",
      report_link: returnUrl,
      message: `Your Clinical Currency profile is ready, and what we found is genuinely exciting.

Your archetype: ${archetype || "Your Clinical Currency Archetype"}
Your top income path: ${topPath || "Matched to your background"}

This is just the beginning of what your assessment revealed. Your full personalised blueprint goes much deeper — it shows you exactly what to do first, how to price your expertise, which certifications will unlock new income doors, and a 30-day action plan built specifically around your clinical schedule.

When you unlock your full blueprint, you also get immediate access to the YCC Community — a private WhatsApp group of Nigerian healthcare professionals who are actively building income alongside each other. Weekly check-ins, live Q&As, accountability partners, and real support from people who understand what it means to build something while managing a clinical career.

Your blueprint and your community seat are waiting. Tap the link below to return to your results and unlock everything for ₦5,000.

This is the launch price. It goes up to ₦15,000 soon.`,
    });
  } catch (e) {
    console.log("Follow-up email failed:", e);
  }
};

export default function App() {
  const [userName, setUserName] = useState(() => localStorage.getItem("lead_name") || "");
  const [phase, setPhase] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    // Return from report email link
    const reportKey = params.get("report");
    if (reportKey) {
      const stored = localStorage.getItem(reportKey);
      if (stored) return "results";
    }
    // Return from free summary email link
    const summaryKey = params.get("summary");
    if (summaryKey) {
      const decoded = decodeURIComponent(summaryKey);
      const stored = localStorage.getItem(decoded);
      if (stored) return "free_summary_return";
      // If on different device, localStorage will be empty.
      // Still show free_summary_return screen with empty answers
      // so user sees a message to redo the quiz
      return "free_summary_return";
    }
    return "landing";
  });
  const [returnReportKey] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("report") || null;
  });
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const summaryKey = params.get("summary");
    if (summaryKey) {
      try {
        const decoded = decodeURIComponent(summaryKey);
        const stored = JSON.parse(localStorage.getItem(decoded));
        if (stored?.answers) return stored.answers;
      } catch {}
    }
    return {};
  });
  const [selectedPath, setSelectedPath] = useState(null);
  const [multiSel, setMultiSel] = useState([]);
  const [textVal, setTextVal] = useState("");
  const [otherText, setOtherText] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [streamed, setStreamed] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const reportKey = params.get("report");
    if (reportKey) {
      try { return JSON.parse(localStorage.getItem(reportKey))?.report || ""; } catch { return ""; }
    }
    return "";
  });
  const [report, setReport] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const reportKey = params.get("report");
    if (reportKey) {
      try { return JSON.parse(localStorage.getItem(reportKey))?.report || ""; } catch { return ""; }
    }
    return "";
  });
  const [error, setError] = useState("");
  const [freeScore, setFreeScore] = useState(null);
  const [freeArchetype, setFreeArchetype] = useState(null);

  const cur = STEPS[step];

  const singleOtherSelected = cur.type === "single" && answers[cur.id] === OTHER_OPTION;
  const multiOtherSelected = cur.type === "multi" && multiSel.includes(OTHER_OPTION);
  const otherRequired = (singleOtherSelected || multiOtherSelected) && cur.hasOther;

  const canProceed =
    cur.type === "multi"
      ? multiSel.length > 0 && (!otherRequired || otherText.trim().length > 0)
      : cur.type === "text"
      ? textVal.trim().length > 0
      : cur.type === "rating"
      ? rating > 0
      : !!answers[cur.id] && (!otherRequired || otherText.trim().length > 0);

  const getValue = () => {
    if (cur.type === "multi") {
      const base = multiSel.filter(o => o !== OTHER_OPTION);
      const parts = multiOtherSelected && otherText.trim()
        ? [...base, `Other: ${otherText.trim()}`]
        : base;
      return parts.length > 0 ? parts.join("; ") : "";
    }
    if (cur.type === "text") return textVal.trim();
    if (cur.type === "rating") return rating > 0 ? String(rating) : "";
    if (singleOtherSelected && otherText.trim()) return `Other: ${otherText.trim()}`;
    return answers[cur.id] || "";
  };

  const handleSingle = (o) => setAnswers(p => ({ ...p, [cur.id]: o }));
  const toggleMulti = (o) => setMultiSel(p => p.includes(o) ? p.filter(x => x !== o) : [...p, o]);

  const handleNext = () => {
    const val = getValue();
    if (!val) return;
    const updated = { ...answers, [cur.id]: val };
    setAnswers(updated);
    setMultiSel([]); setTextVal(""); setRating(0); setHover(0); setOtherText("");
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else {
      // Store quiz answers for return link
      const email = localStorage.getItem("lead_email");
      const name = localStorage.getItem("lead_name") || userName;
      const summaryKey = "ycc_summary_" + (email || Date.now());
      localStorage.setItem(summaryKey, JSON.stringify({
        answers: updated,
        name,
        email,
        timestamp: new Date().toISOString(),
      }));
      localStorage.setItem("ycc_latest_summary", summaryKey);
      setPhase("free_summary");
    }
  };

  const handleBack = () => {
    if (step === 0) return;
    const prev = STEPS[step - 1];
    const prevVal = answers[prev.id] || "";
    if (prev.type === "multi") setMultiSel(prevVal ? prevVal.split("; ").map(v => v.startsWith("Other: ") ? OTHER_OPTION : v) : []);
    else if (prev.type === "text") setTextVal(prevVal);
    else if (prev.type === "rating") setRating(prevVal ? parseInt(prevVal) : 0);
    setOtherText("");
    setStep(s => s - 1);
  };

  const runAI = async (final, path) => {
    setPhase("loading");
    setStreamed(""); setReport(""); setError("");
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-beta": "prompt-caching-2024-07-31",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          stream: true,
          // Static system prompt — cached after first request, reused for all subsequent users
          system: [
            {
              type: "text",
              text: SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" },
            }
          ],
          // Dynamic user message — unique per user, never cached
          messages: [
            {
              role: "user",
              content: buildUserMessage(final, path),
            }
          ],
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (errData?.error?.type === "insufficient_quota" || res.status === 529) {
          throw new Error("credits");
        }
        throw new Error("api");
      }
      setPhase("results");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value).split("\n").filter(l => l.startsWith("data: "))) {
          try {
            const j = JSON.parse(line.slice(6));
            if (j.type === "content_block_delta" && j.delta?.text) {
              full += j.delta.text;
              setStreamed(full);
            }
          } catch {}
        }
      }
      setReport(full);
      // Store report with unique key for email retrieval
      const email = localStorage.getItem("paid_email") || localStorage.getItem("lead_email");
      const name = localStorage.getItem("lead_name") || userName;
      const reportKey = "ycc_report_" + Date.now();
      localStorage.setItem(reportKey, JSON.stringify({
        report: full,
        name,
        email,
        paths: Array.isArray(path) ? path : [path],
        timestamp: new Date().toISOString(),
      }));
      if (email) sendReportEmail(name, email, reportKey);
    } catch (e) {
      if (e.message === "credits") {
        setError("Report generation is temporarily unavailable. Please try again in a few minutes.");
      } else {
        setError("Something went wrong generating your report. Please try again.");
      }
      setPhase("payment");
    }
  };

  const sections = parseSections(streamed);
  const done = report && streamed === report;

  const reset = () => {
    setPhase("landing"); setStep(0); setAnswers({});
    setSelectedPath(null);
    setMultiSel([]); setTextVal(""); setRating(0); setOtherText("");
    setStreamed(""); setReport(""); setError("");
    setFreeScore(null); setFreeArchetype(null);
  };

  const handleLeadSubmit = async ({ name, email }) => {
    setUserName(name);
    localStorage.setItem("lead_name", name);
    localStorage.setItem("lead_email", email);
    await captureLead(name, email);
    setPhase("quiz");
  };

  return (
    <div>
      {phase === "landing" && (
        <LandingPage onStart={() => {
          if (localStorage.getItem("lead_email")) {
            setPhase("quiz");
          } else {
            setPhase("lead");
          }
        }} />
      )}

      {phase === "lead" && (
        <LeadGate onSubmit={handleLeadSubmit} />
      )}

      {phase === "quiz" && (
        <QuizStep
          step={step}
          answers={answers}
          multiSel={multiSel}
          textVal={textVal}
          otherText={otherText}
          rating={rating}
          hover={hover}
          error={error}
          canProceed={canProceed}
          userName={userName}
          onSingle={handleSingle}
          onToggleMulti={toggleMulti}
          onTextChange={setTextVal}
          onOtherText={setOtherText}
          onRating={setRating}
          onHover={setHover}
          onHoverLeave={() => setHover(0)}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}

      {(phase === "free_summary" || phase === "free_summary_return") && (
        Object.keys(answers).length > 0 ? (
          <FreeSummary
            answers={answers}
            userName={userName}
            onPay={(paths) => {
              setSelectedPath(paths);
              setPhase("payment");
            }}
            onScoreReady={(s, a) => { setFreeScore(s); setFreeArchetype(a); }}
            onSummaryReady={(score, archetype, topPath) => {
              const email = localStorage.getItem("lead_email");
              const name = localStorage.getItem("lead_name") || userName;
              const summaryKey = localStorage.getItem("ycc_latest_summary");
              if (email && summaryKey) {
                sendFreeSummaryEmail(name, email, archetype.name, topPath, summaryKey);
              }
            }}
            onReset={reset}
          />
        ) : (
          // Different device — localStorage empty, ask them to redo quiz
          <div style={{ minHeight: "100vh", background: "#0a0f28", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, textAlign: "center", gap: 20 }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: "#fff" }}>Your<span style={{ color: "#c8a030" }}>Clinical</span>Currency</div>
            <h2 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", maxWidth: 400 }}>Welcome back</h2>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 300, color: "rgba(255,255,255,0.5)", maxWidth: 380, lineHeight: 1.7 }}>
              Your results were saved on your original device. To view them, open this link on the same phone or browser you used for the assessment.
            </p>
            <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 300, color: "rgba(255,255,255,0.5)", maxWidth: 380, lineHeight: 1.7 }}>
              Alternatively, the assessment only takes 10 minutes to redo and your new results will be just as personalised.
            </p>
            <button
              onClick={reset}
              style={{ background: "#c8a030", color: "#0d1b3e", fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 700, padding: "14px 32px", border: "none", borderRadius: 4, cursor: "pointer" }}
            >
              Redo My Assessment
            </button>
          </div>
        )
      )}

      {phase === "payment" && (
        <PaymentGate
          selectedPath={selectedPath}
          onSuccess={() => {
            runAI(answers, selectedPath);
          }}
        />
      )}

      {phase === "loading" && <LoadingScreen />}

      {phase === "results" && (
        <ResultsPage
          sections={sections}
          done={done}
          streamed={streamed}
          userName={userName}
          selectedPaths={selectedPath}
          score={freeScore}
          archetype={freeArchetype}
          onReset={reset}
        />
      )}
    </div>
  );
}
