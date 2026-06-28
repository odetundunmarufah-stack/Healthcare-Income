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
const EMAILJS_SERVICE_ID  = "service_skrb4zu";
const EMAILJS_TEMPLATE_ID = "template_cp2v8ja";
const EMAILJS_PUBLIC_KEY  = "E5Ak4CU7HZlplLiGP";

// ─── DIAGNOSTIC LOGGER ───────────────────────────────────────────────────────
// Filter DevTools console by "[YCC FLOW]" to see the full payment → blueprint trace.
const log = (step, data) => {
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`[YCC FLOW ${ts}] ${step}`, data !== undefined ? data : "");
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

// ─── EMAILJS LOADER ──────────────────────────────────────────────────────────
// Extracted so both email functions share one loader without duplication.
const loadEmailJs = () => new Promise((res, rej) => {
  if (window.emailjs) { res(); return; }
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
  s.onload = () => { window.emailjs.init(EMAILJS_PUBLIC_KEY); res(); };
  s.onerror = rej;
  document.head.appendChild(s);
});

// ─── EMAILJS REPORT LINK DELIVERY ────────────────────────────────────────────
const sendReportEmail = async (name, email, reportKey) => {
  log("sendReportEmail → starting", { name, email, reportKey });
  try {
    await loadEmailJs();
    const reportUrl = `${window.location.origin}?report=${reportKey}`;
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_name:   name  || "Healthcare Professional",
      to_email:  email,
      subject:   "Your Clinical Currency Blueprint is ready",
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
    log("sendReportEmail → sent OK", { email });
  } catch (e) {
    // Email failure is never surfaced to the user — the report is already on screen.
    // Log the full error so you can diagnose EmailJS issues in the console.
    log("sendReportEmail → FAILED", { message: e?.message, status: e?.status, text: e?.text });
  }
};

// ─── EMAILJS FREE SUMMARY FOLLOW-UP ──────────────────────────────────────────
const sendFreeSummaryEmail = async (name, email, archetype, topPath, summaryKey) => {
  log("sendFreeSummaryEmail → starting", { name, email, summaryKey });
  try {
    await loadEmailJs();
    const returnUrl = `${window.location.origin}?summary=${summaryKey}`;
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_name:   name  || "Healthcare Professional",
      to_email:  email,
      from_name: "Your Clinical Currency",
      subject:   "Your Clinical Currency results are ready",
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
    log("sendFreeSummaryEmail → sent OK", { email });
  } catch (e) {
    log("sendFreeSummaryEmail → FAILED", { message: e?.message, status: e?.status, text: e?.text });
  }
};

// ─── CLEAR ALL PAYMENT SESSION FLAGS ─────────────────────────────────────────
// Called only after a confirmed successful report delivery, and on reset.
// Must NOT be called on generation failure — the paid state must survive retries.
const clearPaymentSession = () => {
  log("clearPaymentSession", "removing paid / paid_ref / paid_email / ycc_selected_paths");
  localStorage.removeItem("paid");
  localStorage.removeItem("paid_ref");
  localStorage.removeItem("paid_email");
  localStorage.removeItem("ycc_selected_paths");
};

// ─── GENERATION FAILED SCREEN ────────────────────────────────────────────────
// Shown instead of the payment page when blueprint generation fails after payment.
// Preserves paid state so the user can retry without paying again.
// errorCode is used to give the user context without showing raw API errors.
function GenerationFailedScreen({ errorCode, errorDetail, onRetry, onReset }) {
  const isCredits   = errorCode === "credits";
  const isAuth      = errorCode === "auth";
  const isNoAnswers = errorCode === "no_answers";

  const heading = isCredits
    ? "We hit a temporary limit"
    : isAuth
    ? "A configuration issue occurred"
    : isNoAnswers
    ? "Your assessment answers could not be found"
    : "Blueprint generation failed";

  const body = isCredits
    ? "Your payment was received. We hit a temporary API limit on our end — this is not a problem with your order. Please wait a few minutes and tap Retry below. Your blueprint will generate immediately."
    : isAuth
    ? "Your payment was received. There is a configuration issue on our end. Please contact support and reference your payment — we will generate your blueprint manually."
    : isNoAnswers
    ? "Your payment was received, but your quiz answers could not be restored. This can happen if you cleared your browser data. Please contact support — we will resolve this manually."
    : "Your payment was received. Blueprint generation stopped unexpectedly. Please tap Retry — if the problem continues, contact support and we will resolve it for you.";

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0f28",
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: 32, textAlign: "center", gap: 20,
    }}>
      <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: "#fff" }}>
        Your<span style={{ color: "#c8a030" }}>Clinical</span>Currency
      </div>

      <div style={{ fontSize: 36 }}>{isCredits ? "⏳" : isAuth ? "⚠️" : isNoAnswers ? "❓" : "⚠️"}</div>

      <h2 style={{
        fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 700,
        color: "#fff", maxWidth: 420, margin: 0,
      }}>
        {heading}
      </h2>

      <p style={{
        fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 300,
        color: "rgba(255,255,255,0.65)", maxWidth: 400, lineHeight: 1.8, margin: 0,
      }}>
        {body}
      </p>

      {/* Raw error detail — visible in case the user screenshots to send to support */}
      {errorDetail && (
        <div style={{
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 6, padding: "10px 16px", maxWidth: 420,
          fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.4)",
          wordBreak: "break-word", textAlign: "left",
        }}>
          {errorDetail}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 320 }}>
        {/* Only show Retry if the failure is retryable */}
        {!isAuth && !isNoAnswers && (
          <button
            onClick={onRetry}
            style={{
              background: "#c8a030", color: "#0d1b3e",
              fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700,
              padding: "14px 32px", border: "none", borderRadius: 4, cursor: "pointer",
            }}
          >
            Retry Blueprint Generation
          </button>
        )}

        <a
          href="mailto:hello@yourclinicalcurrency.com"
          style={{
            background: "transparent", color: "rgba(255,255,255,0.5)",
            fontFamily: "'DM Sans',sans-serif", fontSize: 13,
            padding: "10px", textDecoration: "underline", cursor: "pointer",
          }}
        >
          Contact support
        </a>
      </div>

      <p style={{
        fontFamily: "'DM Sans',sans-serif", fontSize: 11,
        color: "rgba(255,255,255,0.25)", margin: 0,
      }}>
        Your payment has been received and is safe. You will not be charged again.
      </p>
    </div>
  );
}

export default function App() {
  const [userName, setUserName] = useState(() => localStorage.getItem("lead_name") || "");

  const [phase, setPhase] = useState(() => {
    const params = new URLSearchParams(window.location.search);

    const reportKey = params.get("report");
    if (reportKey) {
      const stored = localStorage.getItem(reportKey);
      if (stored) {
        log("INIT phase", "results (report email return)");
        return "results";
      }
    }

    const summaryKey = params.get("summary");
    if (summaryKey) {
      log("INIT phase", "free_summary_return (summary email return)");
      return "free_summary_return";
    }

    const hasPaid        = localStorage.getItem("paid") === "true";
    const hasPaidRef     = !!localStorage.getItem("paid_ref");
    const hasPaths       = !!localStorage.getItem("ycc_selected_paths");
    const latestSummaryKey = localStorage.getItem("ycc_latest_summary");

    if (hasPaid && hasPaidRef && hasPaths && latestSummaryKey) {
      try {
        const summaryData = JSON.parse(localStorage.getItem(latestSummaryKey));
        if (summaryData?.answers && Object.keys(summaryData.answers).length > 0) {
          log("INIT phase", "post_payment_reload detected", {
            paid_ref: localStorage.getItem("paid_ref"),
            paths:    localStorage.getItem("ycc_selected_paths"),
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

  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState(() => {
    const params = new URLSearchParams(window.location.search);

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
    const hasPaid = localStorage.getItem("paid") === "true";
    const params  = new URLSearchParams(window.location.search);
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

  const [multiSel,   setMultiSel]   = useState([]);
  const [textVal,    setTextVal]     = useState("");
  const [otherText,  setOtherText]   = useState("");
  const [rating,     setRating]      = useState(0);
  const [hover,      setHover]       = useState(0);

  const [streamed, setStreamed] = useState(() => {
    const params    = new URLSearchParams(window.location.search);
    const reportKey = params.get("report");
    if (reportKey) {
      try { return JSON.parse(localStorage.getItem(reportKey))?.report || ""; } catch { return ""; }
    }
    return "";
  });

  const [report, setReport] = useState(() => {
    const params    = new URLSearchParams(window.location.search);
    const reportKey = params.get("report");
    if (reportKey) {
      try { return JSON.parse(localStorage.getItem(reportKey))?.report || ""; } catch { return ""; }
    }
    return "";
  });

  // Generation failure state — persisted across retries so the user always
  // knows what happened and can act on it.
  const [genErrorCode,   setGenErrorCode]   = useState("");
  const [genErrorDetail, setGenErrorDetail] = useState("");
  const [error,          setError]          = useState("");
  const [freeScore,      setFreeScore]      = useState(null);
  const [freeArchetype,  setFreeArchetype]  = useState(null);

  // Bug 1 fix: sections derived from streamed text (was undefined before)
  const sections = useMemo(() => parseSections(streamed), [streamed]);

  const cur = STEPS[step];

  const singleOtherSelected = cur.type === "single" && answers[cur.id] === OTHER_OPTION;
  const multiOtherSelected  = cur.type === "multi"  && multiSel.includes(OTHER_OPTION);
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
      const base  = multiSel.filter(o => o !== OTHER_OPTION);
      const parts = multiOtherSelected && otherText.trim()
        ? [...base, `Other: ${otherText.trim()}`]
        : base;
      return parts.length > 0 ? parts.join("; ") : "";
    }
    if (cur.type === "text")   return textVal.trim();
    if (cur.type === "rating") return rating > 0 ? String(rating) : "";
    if (singleOtherSelected && otherText.trim()) return `Other: ${otherText.trim()}`;
    return answers[cur.id] || "";
  };

  const handleSingle = (o) => setAnswers(p => ({ ...p, [cur.id]: o }));
  const toggleMulti  = (o) => setMultiSel(p => p.includes(o) ? p.filter(x => x !== o) : [...p, o]);

  const handleNext = () => {
    const val = getValue();
    if (!val) return;
    const updated = { ...answers, [cur.id]: val };
    setAnswers(updated);
    setMultiSel([]); setTextVal(""); setRating(0); setHover(0); setOtherText("");
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      const safeKey = "ycc_" + Date.now();
      const email   = localStorage.getItem("lead_email");
      const name    = localStorage.getItem("lead_name") || userName;
      localStorage.setItem(safeKey, JSON.stringify({
        answers: updated, name, email, timestamp: new Date().toISOString(),
      }));
      localStorage.setItem("ycc_latest_summary", safeKey);
      log("QUIZ complete", { safeKey, answerCount: Object.keys(updated).length });
      setPhase("free_summary");
    }
  };

  const handleBack = () => {
    if (step === 0) return;
    const prev    = STEPS[step - 1];
    const prevVal = answers[prev.id] || "";
    if (prev.type === "multi")   setMultiSel(prevVal ? prevVal.split("; ").map(v => v.startsWith("Other: ") ? OTHER_OPTION : v) : []);
    else if (prev.type === "text")   setTextVal(prevVal);
    else if (prev.type === "rating") setRating(prevVal ? parseInt(prevVal) : 0);
    setOtherText("");
    setStep(s => s - 1);
  };

  // useRef so the guard persists across renders without triggering re-render
  const aiRunning = useRef(false);

  // ─── FAIL GENERATION (never to payment page after payment) ───────────────
  // All error paths inside runAI funnel through here.
  // code:   short key used by GenerationFailedScreen to pick the right message.
  // detail: raw technical string shown in a small code block for support screenshots.
  const failGeneration = (code, detail) => {
    log(`runAI FAILED → generation_failed`, { code, detail });
    setGenErrorCode(code);
    setGenErrorDetail(detail);
    setPhase("generation_failed");
    aiRunning.current = false;
  };

  // ─── RUN AI ──────────────────────────────────────────────────────────────
  const runAI = async (final, path) => {

    // ── [YCC FLOW] Checkpoint 1: entry guard ─────────────────────────────
    if (aiRunning.current) {
      log("runAI → SKIPPED (already running — duplicate call blocked)", {});
      return;
    }
    aiRunning.current = true;

    // ── [YCC FLOW] Checkpoint 2: answers present ──────────────────────────
    log("runAI → ENTERED", {
      answerCount: final ? Object.keys(final).length : 0,
      path,
      paid_ref:   localStorage.getItem("paid_ref"),
      paid_email: localStorage.getItem("paid_email"),
      paid:       localStorage.getItem("paid"),
    });

    if (!final || Object.keys(final).length === 0) {
      log("runAI → ABORT no answers", {});
      return failGeneration("no_answers", "answers object was empty at runAI entry");
    }

    // ── [YCC FLOW] Checkpoint 3: phase transition to loading ──────────────
    log("runAI → setPhase(loading)", {});
    setPhase("loading");
    setStreamed(""); setReport(""); setError("");

    // ── [YCC FLOW] Checkpoint 4: API key present ──────────────────────────
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    log("runAI → API key present?", { present: !!apiKey, length: apiKey?.length ?? 0 });
    if (!apiKey) {
      return failGeneration("auth", "VITE_ANTHROPIC_API_KEY is missing from environment");
    }

    // ── [YCC FLOW] Checkpoint 5: Anthropic request ────────────────────────
    log("runAI → Anthropic fetch starting", {
      model:        "claude-sonnet-4-20250514",
      path,
      answerCount:  Object.keys(final).length,
      userMsgLen:   buildUserMessage(final, path).length,
    });

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type":    "application/json",
          "x-api-key":       apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-beta":  "prompt-caching-2024-07-31",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model:      "claude-sonnet-4-20250514",
          max_tokens: 4000,
          stream:     true,
          system: [{
            type: "text",
            text: SYSTEM_PROMPT,
            cache_control: { type: "ephemeral" },
          }],
          messages: [{
            role:    "user",
            content: buildUserMessage(final, path),
          }],
        }),
      });

      // ── [YCC FLOW] Checkpoint 6: HTTP response ────────────────────────
      log("runAI → Anthropic response", { status: res.status, ok: res.ok });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errType = errData?.error?.type    || "";
        const errMsg  = errData?.error?.message || "";
        log("runAI → Anthropic error body", { errType, errMsg, status: res.status });

        if (res.status === 401) {
          return failGeneration("auth", `HTTP 401 — ${errMsg}`);
        }
        if (errType === "insufficient_quota" || res.status === 529 || errMsg.toLowerCase().includes("credit")) {
          return failGeneration("credits", `HTTP ${res.status} ${errType} — ${errMsg}`);
        }
        return failGeneration("api_error", `HTTP ${res.status} ${errType} — ${errMsg}`);
      }

      // ── [YCC FLOW] Checkpoint 7: stream begins ────────────────────────
      log("runAI → setPhase(results) — stream starting", {});
      setPhase("results");

      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let full       = "";
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

      // ── [YCC FLOW] Checkpoint 8: stream complete ──────────────────────
      log("runAI → stream complete", {
        totalChars:   full.length,
        totalChunks:  chunkCount,
        sectionCount: (full.match(/^## /gm) || []).length,
      });

      if (full.length === 0) {
        // Stream completed but no content arrived — treat as API error
        return failGeneration("api_error", "stream completed with 0 bytes — API may have rejected silently");
      }

      setReport(full);

      // ── [YCC FLOW] Checkpoint 9: save report locally ──────────────────
      // Bug 2 fix: clear ALL payment flags — only after confirmed report delivery
      clearPaymentSession();

      const email     = localStorage.getItem("paid_email") || localStorage.getItem("lead_email");
      const name      = localStorage.getItem("lead_name")  || userName;
      const reportKey = "ycc_report_" + Date.now();
      localStorage.setItem(reportKey, JSON.stringify({
        report: full, name, email,
        paths:  Array.isArray(path) ? path : [path],
        timestamp: new Date().toISOString(),
      }));
      log("runAI → report saved to localStorage", { reportKey, emailWillSend: !!email });

      // ── [YCC FLOW] Checkpoint 10: send email ──────────────────────────
      if (email) {
        // Not awaited — email failure must never block or alter UI state
        sendReportEmail(name, email, reportKey);
      } else {
        log("runAI → email SKIPPED (no email in localStorage)", {});
      }

    } catch (e) {
      // ── [YCC FLOW] Checkpoint ERROR: network or runtime exception ─────
      log("runAI → EXCEPTION", { message: e.message, stack: e.stack });
      return failGeneration("network", e.message || "Unknown network error");
    } finally {
      aiRunning.current = false;
    }
  };

  // ── Mobile post-payment reload recovery ────────────────────────────────────
  useEffect(() => {
    if (phase !== "post_payment_reload") return;
    log("useEffect post_payment_reload → ENTERED", {
      answerCount: Object.keys(answers).length,
      paths:       localStorage.getItem("ycc_selected_paths"),
      paid_ref:    localStorage.getItem("paid_ref"),
    });
    const storedPaths = localStorage.getItem("ycc_selected_paths");
    let paths = null;
    try { paths = storedPaths ? JSON.parse(storedPaths) : null; } catch {}

    if (answers && Object.keys(answers).length > 0) {
      runAI(answers, paths);
    } else {
      log("useEffect post_payment_reload → no answers", {});
      failGeneration("no_answers", "post_payment_reload: answers not restored from localStorage");
    }
  }, []); // intentionally empty — runs once on mount only

  const done = report && streamed === report;

  // Bug 4 fix: reset clears all payment flags so next session starts clean
  const reset = () => {
    log("reset → clearing all session state", {});
    clearPaymentSession();
    localStorage.removeItem("ycc_latest_summary");
    setPhase("landing"); setStep(0); setAnswers({});
    setSelectedPath(null);
    setMultiSel([]); setTextVal(""); setRating(0); setOtherText("");
    setStreamed(""); setReport(""); setError("");
    setGenErrorCode(""); setGenErrorDetail("");
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
          if (localStorage.getItem("lead_email")) setPhase("quiz");
          else setPhase("lead");
        }} />
      )}

      {phase === "lead" && <LeadGate onSubmit={handleLeadSubmit} />}

      {phase === "quiz" && (
        <QuizStep
          step={step} answers={answers} multiSel={multiSel} textVal={textVal}
          otherText={otherText} rating={rating} hover={hover} error={error}
          canProceed={canProceed} userName={userName}
          onSingle={handleSingle} onToggleMulti={toggleMulti}
          onTextChange={setTextVal} onOtherText={setOtherText}
          onRating={setRating} onHover={setHover}
          onHoverLeave={() => setHover(0)} onNext={handleNext} onBack={handleBack}
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
              const email      = localStorage.getItem("lead_email");
              const name       = localStorage.getItem("lead_name") || userName;
              const summaryKey = localStorage.getItem("ycc_latest_summary");
              if (email && summaryKey) {
                sendFreeSummaryEmail(name, email, archetype.name, topPath, summaryKey);
              }
            }}
            onReset={reset}
          />
        ) : (
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
            // ── [YCC FLOW] Checkpoint: Paystack callback fired ────────────
            log("PaymentGate → onSuccess CALLED", {
              paid_ref:   localStorage.getItem("paid_ref"),
              paid_email: localStorage.getItem("paid_email"),
              paid:       localStorage.getItem("paid"),
            });

            const latestKey     = localStorage.getItem("ycc_latest_summary");
            const storedAnswers = latestKey
              ? (() => { try { return JSON.parse(localStorage.getItem(latestKey))?.answers || {}; } catch { return {}; } })()
              : {};
            const storedPaths   = (() => { try { return JSON.parse(localStorage.getItem("ycc_selected_paths")); } catch { return null; } })();
            const finalAnswers  = Object.keys(storedAnswers).length > 0 ? storedAnswers : answers;
            const finalPaths    = storedPaths || selectedPath;

            log("PaymentGate → onSuccess RESOLVED", {
              answerCount:      Object.keys(finalAnswers).length,
              paths:            finalPaths,
              fromLocalStorage: Object.keys(storedAnswers).length > 0,
            });

            runAI(finalAnswers, finalPaths);
          }}
        />
      )}

      {phase === "loading"             && <LoadingScreen />}
      {phase === "post_payment_reload" && <LoadingScreen />}

      {phase === "generation_failed" && (
        <GenerationFailedScreen
          errorCode={genErrorCode}
          errorDetail={genErrorDetail}
          onRetry={() => {
            log("GenerationFailedScreen → RETRY tapped", { genErrorCode, selectedPath });
            setGenErrorCode(""); setGenErrorDetail("");
            // Re-read answers and paths from localStorage for the retry
            const latestKey    = localStorage.getItem("ycc_latest_summary");
            const retryAnswers = latestKey
              ? (() => { try { return JSON.parse(localStorage.getItem(latestKey))?.answers || {}; } catch { return {}; } })()
              : answers;
            const retryPaths   = (() => { try { return JSON.parse(localStorage.getItem("ycc_selected_paths")); } catch { return null; } })()
              || selectedPath;
            runAI(retryAnswers, retryPaths);
          }}
          onReset={reset}
        />
      )}

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
