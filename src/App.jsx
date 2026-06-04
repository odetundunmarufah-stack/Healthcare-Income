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
import { buildPrompt } from "./utils/buildPrompt";
import "./styles/app.css";

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

// ─── EMAILJS PDF DELIVERY ─────────────────────────────────────────────────────
const sendReportEmail = async (name, email, reportText) => {
  try {
    // Load EmailJS dynamically
    if (!window.emailjs) {
      await new Promise((res, rej) => {
        const s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
        s.onload = res; s.onerror = rej;
        document.head.appendChild(s);
      });
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
    }
    // Send email with report as text (PDF generation via EmailJS template)
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_name: name || "Healthcare Professional",
      to_email: email,
      report_preview: reportText.slice(0, 3000),
      from_name: "Your Clinical Currency",
    });
  } catch (e) {
    console.log("Email send failed:", e);
  }
};

const OTHER_OPTION = "Other — please describe below";

export default function App() {
  const [userName, setUserName] = useState(() => localStorage.getItem("lead_name") || "");
  const [phase, setPhase] = useState("landing");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedPath, setSelectedPath] = useState(null);
  const [multiSel, setMultiSel] = useState([]);
  const [textVal, setTextVal] = useState("");
  const [otherText, setOtherText] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [streamed, setStreamed] = useState("");
  const [report, setReport] = useState("");
  const [error, setError] = useState("");

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
    else setPhase("free_summary");
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
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000, stream: true,
          messages: [{ role: "user", content: buildPrompt(final, path) }],
        }),
      });
      if (!res.ok) throw new Error();
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
      // Send report email
      const email = localStorage.getItem("paid_email") || localStorage.getItem("lead_email");
      const name = localStorage.getItem("lead_name") || userName;
      if (email) sendReportEmail(name, email, full);
    } catch {
      setError("Something went wrong generating your report. Please try again.");
      setPhase("free_summary");
    }
  };

  const sections = parseSections(streamed);
  const done = report && streamed === report;

  const reset = () => {
    setPhase("landing"); setStep(0); setAnswers({});
    setSelectedPath(null);
    setMultiSel([]); setTextVal(""); setRating(0); setOtherText("");
    setStreamed(""); setReport(""); setError("");
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

      {phase === "free_summary" && (
        <FreeSummary
          answers={answers}
          userName={userName}
          onPay={(path) => {
            setSelectedPath(path);
            setPhase("payment");
          }}
          onReset={reset}
        />
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
          selectedPath={selectedPath}
          onReset={reset}
        />
      )}
    </div>
  );
}
