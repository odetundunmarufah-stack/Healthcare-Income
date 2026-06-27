import { useState, useEffect, useMemo, useRef } from "react";
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

// ─── DIAGNOSTIC LOGGER ───────────────────────────────────────────────────────
// Prefixed logs make it easy to filter in DevTools: filter by "[YCC]"
const log = (step, data) => {
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`[YCC ${ts}] ${step}`, data !== undefined ? data : "");
};

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
      subject: "Your Clinical Currency Blueprint is ready",
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
    const returnUrl = `${window.location.origin}?summary=${summaryKey}`;
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_name: name || "Healthcare Professional",
      to_email: email,
      from_name: "Your Clinical Currency",
      subject: "Your Clinical Currency results are ready",
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

// ─── CLEAR ALL PAYMENT SESSION FLAGS ─────────────────────────────────────────
// Called after a successful report delivery AND on reset.
// Prevents post_payment_reload triggering on future visits.
const clearPaymentSession = () => {
  log("clearPaymentSession", "removing paid/paid_ref/paid_email/ycc_selected_paths");
  localStorage.removeItem("paid");
  localStorage.removeItem("paid_ref");
  localStorage.removeItem("paid_email");
  localStorage.removeItem("ycc_selected_paths");
};

export default function App() {
  const [userName, setUserName] = useState(() => localStorage.getItem("lead_name") || "");

  const [phase, setPhase] = useState(() => {
    const params = new URLSearchParams(window.location.search);

    // Return from report email link
    const reportKey = params.get("report");
    if (reportKey) {
      const stored = localStorage.getItem(reportKey);
      if (stored) {
        log("INIT phase", "results (report email return)");
        return "results";
      }
    }

    // Return from free summary email link
    const summaryKey = params.get("summary");
    if (summaryKey) {
      log("INIT phase", "free_summary_return (summary email return)");
      return "free_summary_return";
    }

    // Paystack mobile redirect: page reloaded after payment.
    // Require paid=true + paid_ref + selected paths + quiz answers all present.
    const hasPaid = localStorage.getItem("paid") === "true";
    const hasPaidRef = !!localStorage.getItem("paid_ref");
    const hasPaths = !!localStorage.getItem("ycc_selected_paths");
    const latestSummaryKey = localStorage.getItem("ycc_latest_summary");

    if (hasPaid && hasPaidRef && hasPaths && latestSummaryKey) {
      try {
        const summaryData = JSON.parse(localStorage.getItem(latestSummaryKey));
        if (summaryData?.answers && Object.keys(summaryData.answers).length > 0) {
          log("INIT phase", "post_payment_reload detected", {
            paid_ref: localStorage.getItem("paid_ref"),
            paths: localStorage.getItem("ycc_selected_paths"),
            answerCount: Object.keys(summaryData.answers).length,
          });
          return "post_payment_reload";
        }
      } catch (e) {
        log("INIT phase", "post_payment_reload parse error — falling to landing", e);
      }
    }

    log("INIT phase", "landing");
    return "landing";
  });

  const [returnReportKey] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("report") || null;
  });

  const [step, setStep] = useState(0);

  const [answers, setAnswers] = useState(() => {
    const params = new URLSearchParams(window.location.search);

    // Restore from summary email link
    const summaryKey = params.get("summary");
    if (summaryKey) {
      try {
        const stored = JSON.parse(localStorage.getItem(summaryKey));
        if (stored?.answers) {
          log("INIT answers", "restored from summary email link", { count: Object.keys(stored.answers).length });
          return stored.answers;
        }
      } catch {}
    }

    // Restore from post-payment page reload
    const latestKey = localStorage.getItem("ycc_latest_summary");
    if (latestKey && localStorage.getItem("paid") === "true") {
      try {
        const stored = JSON.parse(localStorage.getItem(latestKey));
        if (stored?.answers) {
          log("INIT answers", "restored from post-payment localStorage", { count: Object.keys(stored.answers).length });
          return stored.answers;
        }
      } catch {}
    }

    log("INIT answers", "empty — fresh session");
    return {};
  });

  const [selectedPath, setSelectedPath] = useState(() => {
    // Only pre-restore if we are in a post-payment or email-return context
    const hasPaid = localStorage.getItem("paid") === "true";
    const params = new URLSearchParams(window.location.search);
    const hasSummaryParam = !!params.get("summary");

    if (hasPaid || hasSummaryParam) {
      const stored = localStorage.getItem("ycc_selected_paths");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          log("INIT selectedPath", "restored", parsed);
          return parsed;
        } catch {}
      }
    }
    return null;
  });

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

  // ─── BUG 1 FIX: derive sections from streamed text ───────────────────────
  // parseSections was imported but never called. sections was undefined,
  // crashing ResultsPage on sections.length.
  const sections = useMemo(() => parseSections(streamed), [streamed]);

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
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      // Store quiz answers for return link
      const safeKey = "ycc_" + Date.now();
      const email = localStorage.getItem("lead_email");
      const name = localStorage.getItem("lead_name") || userName;
      localStorage.setItem(safeKey, JSON.stringify({
        answers: updated,
        name,
        email,
        timestamp: new Date().toISOString(),
      }));
      localStorage.setItem("ycc_latest_summary", safeKey);
      log("QUIZ complete", { safeKey, answerCount: Object.keys(updated).length });
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

  // ─── GUARD: prevent runAI from firing twice in the same session ───────────
  // On mobile, Paystack may fire the callback AND reload the page.
  // useRef persists across renders; a plain object would reset on every render.
  const aiRunning = useRef(false);

  const runAI = async (final, path) => {
    // ── Checkpoint 1: entry guard ──
    if (aiRunning.current) {
      log("runAI SKIPPED", "already running — duplicate call blocked");
      return;
    }
    aiRunning.current = true;

    log("runAI ENTERED", {
      phase,
      answerCount: final ? Object.keys(final).length : 0,
      path,
      paid_ref: localStorage.getItem("paid_ref"),
    });

    if (!final || Object.keys(final).length === 0) {
      log("runAI ABORT", "no answers");
      setError("Your assessment answers were not found. Please complete the quiz again.");
      setPhase("landing");
      aiRunning.current = false;
      return;
    }

    log("runAI → setPhase(loading)");
    setPhase("loading");
    setStreamed(""); setReport(""); setError("");

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (!apiKey) {
      log("runAI ABORT", "no API key in environment");
      setError("Configuration error. Please contact support.");
      setPhase("payment");
      aiRunning.current = false;
      return;
    }

    log("runAI → Anthropic request starting", { model: "claude-sonnet-4-20250514", path });

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
          system: [
            {
              type: "text",
              text: SYSTEM_PROMPT,
              cache_control: { type: "ephemeral" },
            }
          ],
          messages: [
            {
              role: "user",
              content: buildUserMessage(final, path),
            }
          ],
        }),
      });

      log("runAI → Anthropic response received", { status: res.status, ok: res.ok });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errType = errData?.error?.type || "";
        const errMsg = errData?.error?.message || "";
        log("runAI ERROR", { status: res.status, errType, errMsg });

        if (res.status === 401) {
          setError("API authentication failed. The API key may be invalid. Error: " + errMsg);
          setPhase("payment");
          aiRunning.current = false;
          return;
        }
        if (errType === "insufficient_quota" || res.status === 529 || errMsg.includes("credit")) {
          setError("Your report could not be generated — API credits are empty. Please try again shortly.");
          setPhase("payment");
          aiRunning.current = false;
          return;
        }
        setError("Report generation failed (status " + res.status + "): " + errMsg);
        setPhase("payment");
        aiRunning.current = false;
        return;
      }

      log("runAI → setPhase(results) — stream starting");
      setPhase("results");

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let full = "";
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of dec.decode(value).split("\n").filter(l => l.startsWith("data: "))) {
          try {
            const j = JSON.parse(line.slice(6));
            if (j.type === "content_block_delta" && j.delta?.text) {
              full += j.delta.text;
              chunkCount++;
              setStreamed(full);
            }
          } catch {}
        }
      }

      log("runAI → stream complete", {
        totalChars: full.length,
        totalChunks: chunkCount,
        sectionCount: (full.match(/^## /gm) || []).length,
      });

      setReport(full);

      // ── BUG 2 FIX: clear ALL payment session flags after successful delivery ──
      // Previously only paid_ref was removed. paid=true stayed, causing the next
      // visit to re-enter post_payment_reload and fire a duplicate AI call.
      clearPaymentSession();

      const email = localStorage.getItem("paid_email") || localStorage.getItem("lead_email");
      const name = localStorage.getItem("lead_name") || userName;
      const reportKey = "ycc_report_" + Date.now();
      localStorage.setItem(reportKey, JSON.stringify({
        report: full, name, email,
        paths: Array.isArray(path) ? path : [path],
        timestamp: new Date().toISOString(),
      }));
      log("runAI → report saved", { reportKey, email: email || "(none)" });
      if (email) sendReportEmail(name, email, reportKey);

    } catch (e) {
      log("runAI EXCEPTION", e.message);
      setError("Network error: " + (e.message || "Unknown error. Check your internet connection."));
      setPhase("payment");
    } finally {
      aiRunning.current = false;
    }
  };

  // ─── Mobile reload recovery: fire runAI once on mount if post_payment_reload ─
  useEffect(() => {
    if (phase === "post_payment_reload") {
      log("useEffect post_payment_reload", {
        answerCount: Object.keys(answers).length,
        paths: localStorage.getItem("ycc_selected_paths"),
      });
      const storedPaths = localStorage.getItem("ycc_selected_paths");
      let paths = null;
      try { paths = storedPaths ? JSON.parse(storedPaths) : null; } catch {}

      if (answers && Object.keys(answers).length > 0) {
        runAI(answers, paths);
      } else {
        log("useEffect post_payment_reload", "no answers — falling to payment");
        setPhase("payment");
      }
    }
  }, []); // intentionally empty — runs once on mount only

  const done = report && streamed === report;

  const reset = () => {
    log("reset", "clearing all session state");
    // ── BUG 4 FIX: clear payment flags on reset so next session starts clean ──
    clearPaymentSession();
    localStorage.removeItem("ycc_latest_summary");
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
    log("lead submitted", { name, email });
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
              log("FreeSummary → onPay", { paths });
              localStorage.setItem("ycc_selected_paths", JSON.stringify(paths));
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
            log("PaymentGate → onSuccess called", {
              paid_ref: localStorage.getItem("paid_ref"),
              paid_email: localStorage.getItem("paid_email"),
            });

            // Always read from localStorage — React state may be lost on mobile page reload
            const latestKey = localStorage.getItem("ycc_latest_summary");
            const storedAnswers = latestKey
              ? (() => { try { return JSON.parse(localStorage.getItem(latestKey))?.answers || {}; } catch { return {}; } })()
              : {};
            const storedPaths = (() => { try { return JSON.parse(localStorage.getItem("ycc_selected_paths")); } catch { return null; } })();
            const finalAnswers = Object.keys(storedAnswers).length > 0 ? storedAnswers : answers;
            const finalPaths = storedPaths || selectedPath;

            log("PaymentGate → onSuccess resolved", {
              answerCount: Object.keys(finalAnswers).length,
              paths: finalPaths,
              fromLocalStorage: Object.keys(storedAnswers).length > 0,
            });

            runAI(finalAnswers, finalPaths);
          }}
        />
      )}

      {phase === "loading" && <LoadingScreen />}
      {phase === "post_payment_reload" && <LoadingScreen />}

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
