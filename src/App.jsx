import { useState, useEffect, useMemo, useRef } from "react";
import { STEPS } from "./data/steps";
import { parseSections } from "./utils/parseSections";
import { generateAssessmentId, saveAssessment, loadAssessment, markAssessmentPaid, saveReportKey } from "./utils/db";
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

const EMAILJS_SERVICE_ID  = "service_skrb4zu";
const EMAILJS_TEMPLATE_ID = "template_cp2v8ja";
const EMAILJS_PUBLIC_KEY  = "E5Ak4CU7HZlplLiGP";

// ─── DIAGNOSTIC LOGGER ───────────────────────────────────────────────────────
const log = (step, data) => {
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`[YCC FLOW ${ts}] ${step}`, data !== undefined ? data : "");
};

// ─── URL HELPERS ─────────────────────────────────────────────────────────────
// New: /results/{id} — the permanent cross-device link sent in email
const getAssessmentIdFromUrl = () => {
  const m = window.location.pathname.match(/^\/results\/([a-z0-9]{10})$/);
  return m ? m[1] : null;
};
// Legacy: ?summary= and ?report= links continue to work
const getLegacySummaryKey = () => new URLSearchParams(window.location.search).get("summary");
const getLegacyReportKey  = () => new URLSearchParams(window.location.search).get("report");

// ─── FORMSPREE ───────────────────────────────────────────────────────────────
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
const loadEmailJs = () => new Promise((res, rej) => {
  if (window.emailjs) { res(); return; }
  const s = document.createElement("script");
  s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
  s.onload = () => { window.emailjs.init(EMAILJS_PUBLIC_KEY); res(); };
  s.onerror = rej;
  document.head.appendChild(s);
});

// ─── SUMMARY EMAIL ────────────────────────────────────────────────────────────
// Sent when user reaches screen 1 of the free summary.
// Link is the permanent /results/{assessmentId} URL.
const sendSummaryEmail = async ({ name, email, archetype, topPath, assessmentId }) => {
  log("sendSummaryEmail → starting", { email, assessmentId });
  try {
    await loadEmailJs();
    const returnUrl = `${window.location.origin}/results/${assessmentId}`;
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_name:      name  || "Healthcare Professional",
      to_email:     email,
      from_name:    "Your Clinical Currency",
      subject:      "Your Clinical Currency results are ready",
      whatsapp_link: "",
      report_link:  returnUrl,
      message: `Your Clinical Currency profile is ready, and what we found is genuinely exciting.

Your archetype: ${archetype || "Your Clinical Currency Archetype"}
Your top income path: ${topPath || "Matched to your background"}

This is just the beginning of what your assessment revealed. Your full personalised blueprint goes much deeper — it shows you exactly what to do first, how to price your expertise, which certifications will unlock new income doors, and a 30-day action plan built specifically around your clinical schedule.

When you unlock your full blueprint, you also get immediate access to the YCC Community — a private WhatsApp group of Nigerian healthcare professionals who are actively building income alongside each other. Weekly check-ins, live Q&As, accountability partners, and real support from people who understand what it means to build something while managing a clinical career.

Your results are saved. Tap the link below to return any time, on any device — your results will be waiting exactly as you left them.

Your blueprint and your community seat are waiting. Unlock everything for ₦5,000.

This is the launch price. It goes up to ₦15,000 soon.`,
    });
    log("sendSummaryEmail → sent OK", { email });
  } catch (e) {
    log("sendSummaryEmail → FAILED", { message: e?.message, status: e?.status });
  }
};

// ─── BLUEPRINT EMAIL ──────────────────────────────────────────────────────────
// Sent after AI generation completes.
// Link is the same /results/{assessmentId} URL — no separate report link needed.
const sendBlueprintEmail = async ({ name, email, assessmentId }) => {
  log("sendBlueprintEmail → starting", { email, assessmentId });
  try {
    await loadEmailJs();
    const reportUrl = `${window.location.origin}/results/${assessmentId}`;
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_name:    name  || "Healthcare Professional",
      to_email:   email,
      subject:    "Your Clinical Currency Blueprint is ready",
      report_link: reportUrl,
      from_name:  "Your Clinical Currency",
      message: `Thank you for purchasing your Clinical Currency Blueprint. This means a lot, and we do not take it lightly.

Your full personalised report has been generated and is ready for you right now. It includes everything built specifically around your specialty, your personality, and the income path you chose — your 30-day action plan, your signature offer, your skills and certifications roadmap, income projections, and much more.

Your bonuses are inside your report:
- The First ₦100k Checklist — specific to your chosen path
- 30 Content Ideas tailored to your specialty
- Full access to the YCC Community

Join the YCC Community here: https://chat.whatsapp.com/KqhTYdiG4LjF9IrxPRWnD2

Your report is saved and waiting. Tap the link below to open it any time, on any device.`,
    });
    log("sendBlueprintEmail → sent OK", { email });
  } catch (e) {
    log("sendBlueprintEmail → FAILED", { message: e?.message, status: e?.status });
  }
};

// ─── CLEAR PAYMENT SESSION FLAGS ─────────────────────────────────────────────
// Only called after confirmed report delivery and on reset.
// Never called on generation failure so paid state survives retries.
const clearPaymentSession = () => {
  log("clearPaymentSession", "removing paid / paid_ref / paid_email / ycc_selected_paths");
  localStorage.removeItem("paid");
  localStorage.removeItem("paid_ref");
  localStorage.removeItem("paid_email");
  localStorage.removeItem("ycc_selected_paths");
};

// ─── GENERATION FAILED SCREEN ────────────────────────────────────────────────
// Shown instead of payment page when blueprint generation fails after payment.
// Paid state is preserved so the user can retry without paying again.
function GenerationFailedScreen({ errorCode, errorDetail, onRetry, onReset }) {
  const isCredits   = errorCode === "credits";
  const isAuth      = errorCode === "auth";
  const isNoAnswers = errorCode === "no_answers";

  const heading = isCredits   ? "We hit a temporary limit"
    : isAuth      ? "A configuration issue occurred"
    : isNoAnswers ? "Your assessment answers could not be found"
    : "Blueprint generation failed";

  const body = isCredits
    ? "Your payment was received. We hit a temporary API limit on our end — this is not a problem with your order. Please wait a few minutes and tap Retry below. Your blueprint will generate immediately."
    : isAuth
    ? "Your payment was received. There is a configuration issue on our end. Please contact support and reference your payment — we will generate your blueprint manually."
    : isNoAnswers
    ? "Your payment was received, but your quiz answers could not be restored. Please contact support — we will resolve this manually."
    : "Your payment was received. Blueprint generation stopped unexpectedly. Please tap Retry — if the problem continues, contact support.";

  return (
    <div style={{ minHeight:"100vh", background:"#0a0f28", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, textAlign:"center", gap:20 }}>
      <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:700, color:"#fff" }}>
        Your<span style={{ color:"#c8a030" }}>Clinical</span>Currency
      </div>
      <div style={{ fontSize:36 }}>{isCredits ? "⏳" : "⚠️"}</div>
      <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:700, color:"#fff", maxWidth:420, margin:0 }}>
        {heading}
      </h2>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"rgba(255,255,255,0.65)", maxWidth:400, lineHeight:1.8, margin:0 }}>
        {body}
      </p>
      {errorDetail && (
        <div style={{ background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:6, padding:"10px 16px", maxWidth:420, fontFamily:"monospace", fontSize:11, color:"rgba(255,255,255,0.4)", wordBreak:"break-word", textAlign:"left" }}>
          {errorDetail}
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:12, width:"100%", maxWidth:320 }}>
        {!isAuth && !isNoAnswers && (
          <button onClick={onRetry} style={{ background:"#c8a030", color:"#0d1b3e", fontFamily:"'Space Grotesk',sans-serif", fontSize:14, fontWeight:700, padding:"14px 32px", border:"none", borderRadius:4, cursor:"pointer" }}>
            Retry Blueprint Generation
          </button>
        )}
        <a href="mailto:hello@yourclinicalcurrency.com" style={{ color:"rgba(255,255,255,0.5)", fontFamily:"'DM Sans',sans-serif", fontSize:13, padding:"10px", textDecoration:"underline" }}>
          Contact support
        </a>
      </div>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:11, color:"rgba(255,255,255,0.25)", margin:0 }}>
        Your payment has been received and is safe. You will not be charged again.
      </p>
    </div>
  );
}

// ─── RESULTS RETURN LOADING SCREEN ───────────────────────────────────────────
// Shown for the ~300ms while Firestore loads the assessment on /results/:id.
function ReturningScreen() {
  return (
    <div style={{ minHeight:"100vh", background:"#0a0f28", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
      <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:700, color:"#fff" }}>
        Your<span style={{ color:"#c8a030" }}>Clinical</span>Currency
      </div>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"rgba(255,255,255,0.5)" }}>
        Loading your results…
      </p>
    </div>
  );
}

// ─── NOT FOUND SCREEN ────────────────────────────────────────────────────────
function NotFoundScreen({ onReset }) {
  return (
    <div style={{ minHeight:"100vh", background:"#0a0f28", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, textAlign:"center", gap:20 }}>
      <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:700, color:"#fff" }}>
        Your<span style={{ color:"#c8a030" }}>Clinical</span>Currency
      </div>
      <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:700, color:"#fff", maxWidth:400 }}>
        Results not found
      </h2>
      <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"rgba(255,255,255,0.5)", maxWidth:380, lineHeight:1.7 }}>
        This link may have expired or may have been opened on a different device before your results were saved. Please take the assessment again — it only takes 10 minutes.
      </p>
      <button onClick={onReset} style={{ background:"#c8a030", color:"#0d1b3e", fontFamily:"'Space Grotesk',sans-serif", fontSize:13, fontWeight:700, padding:"14px 32px", border:"none", borderRadius:4, cursor:"pointer" }}>
        Start My Assessment
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [userName, setUserName] = useState(() => localStorage.getItem("lead_name") || "");

  // assessmentId is the single thread connecting quiz → summary → payment → report.
  // Generated at quiz completion. Restored from URL on /results/:id return.
  // Stored in localStorage for mobile post-payment reload recovery.
  const [assessmentId, setAssessmentId] = useState(
    () => getAssessmentIdFromUrl() || localStorage.getItem("ycc_assessment_id") || null
  );

  const [phase, setPhase] = useState(() => {
    // ── /results/{id} — cross-device return via email link ───────────────
    const urlId = getAssessmentIdFromUrl();
    if (urlId) {
      log("INIT phase", "results_loading (returning via /results/:id)", { urlId });
      return "results_loading";
    }

    // ── Legacy ?report= link — keep old links working ────────────────────
    const legacyReport = getLegacyReportKey();
    if (legacyReport && localStorage.getItem(legacyReport)) {
      log("INIT phase", "results (legacy ?report= link)");
      return "results";
    }

    // ── Legacy ?summary= link — keep old links working ───────────────────
    const legacySummary = getLegacySummaryKey();
    if (legacySummary) {
      log("INIT phase", "free_summary_return (legacy ?summary= link)");
      return "free_summary_return";
    }

    // ── Paystack mobile redirect: page reloaded after payment ────────────
    const justPaid = localStorage.getItem("paid") === "true"
      && localStorage.getItem("paid_ref")
      && localStorage.getItem("ycc_selected_paths")
      && localStorage.getItem("ycc_latest_summary");

    if (justPaid) {
      log("INIT phase", "post_payment_reload", {
        paid_ref:    localStorage.getItem("paid_ref"),
        assessmentId: localStorage.getItem("ycc_assessment_id"),
      });
      return "post_payment_reload";
    }

    log("INIT phase", "landing");
    return "landing";
  });

  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState(() => {
    // Legacy ?summary= restore
    const legacySummary = getLegacySummaryKey();
    if (legacySummary) {
      try {
        const stored = JSON.parse(localStorage.getItem(legacySummary));
        if (stored?.answers) return stored.answers;
      } catch {}
    }
    // Post-payment mobile restore
    const latestKey = localStorage.getItem("ycc_latest_summary");
    if (latestKey && localStorage.getItem("paid") === "true") {
      try {
        const stored = JSON.parse(localStorage.getItem(latestKey));
        if (stored?.answers) return stored.answers;
      } catch {}
    }
    return {};
  });

  const [selectedPath, setSelectedPath] = useState(() => {
    const hasPaid = localStorage.getItem("paid") === "true";
    const hasSummaryParam = !!getLegacySummaryKey();
    if (hasPaid || hasSummaryParam) {
      try { return JSON.parse(localStorage.getItem("ycc_selected_paths")); } catch {}
    }
    return null;
  });

  const [multiSel,   setMultiSel]   = useState([]);
  const [textVal,    setTextVal]     = useState("");
  const [otherText,  setOtherText]   = useState("");
  const [rating,     setRating]      = useState(0);
  const [hover,      setHover]       = useState(0);

  const [streamed, setStreamed] = useState(() => {
    const legacyReport = getLegacyReportKey();
    if (legacyReport) {
      try { return JSON.parse(localStorage.getItem(legacyReport))?.report || ""; } catch {}
    }
    return "";
  });

  const [report, setReport] = useState(() => {
    const legacyReport = getLegacyReportKey();
    if (legacyReport) {
      try { return JSON.parse(localStorage.getItem(legacyReport))?.report || ""; } catch {}
    }
    return "";
  });

  const [genErrorCode,   setGenErrorCode]   = useState("");
  const [genErrorDetail, setGenErrorDetail] = useState("");
  const [error,          setError]          = useState("");
  const [freeScore,      setFreeScore]      = useState(null);
  const [freeArchetype,  setFreeArchetype]  = useState(null);

  // Bug 1 fix: sections derived from streamed text
  const sections = useMemo(() => parseSections(streamed), [streamed]);

  // ── Load assessment from Firestore when arriving via /results/:id ─────────
  useEffect(() => {
    if (phase !== "results_loading") return;
    const urlId = getAssessmentIdFromUrl();
    if (!urlId) { setPhase("landing"); return; }

    log("results_loading → loadAssessment", { urlId });

    loadAssessment(urlId).then((data) => {
      if (!data) {
        log("results_loading → not found", { urlId });
        setPhase("not_found");
        return;
      }

      log("results_loading → loaded", { urlId, paid: data.paid, hasReportKey: !!data.reportKey });

      // Restore all state from the persisted assessment
      setAssessmentId(urlId);
      localStorage.setItem("ycc_assessment_id", urlId);
      setAnswers(data.answers || {});
      setUserName(data.name || "");
      setFreeScore(data.score ?? null);
      setFreeArchetype(data.archetype ?? null);

      if (data.paid && data.reportKey) {
        // Paid user — try to load report from localStorage
        const storedReport = (() => {
          try { return JSON.parse(localStorage.getItem(data.reportKey))?.report || ""; } catch { return ""; }
        })();

        if (storedReport) {
          // Report is in this browser — show results directly
          setStreamed(storedReport);
          setReport(storedReport);
          setSelectedPath(data.selectedPaths || null);
          setPhase("results");
        } else {
          // Report exists (reportKey is set) but not in this browser's localStorage.
          // Show generation_failed with a retry option — no charge on retry.
          // Restore the payment flags so runAI can proceed without re-payment.
          localStorage.setItem("paid", "true");
          localStorage.setItem("ycc_selected_paths", JSON.stringify(data.selectedPaths || []));
          localStorage.setItem("paid_email", data.email || "");
          setSelectedPath(data.selectedPaths || null);
          setGenErrorCode("report_not_in_browser");
          setGenErrorDetail("Report was generated but is not available in this browser. Retry to regenerate.");
          setPhase("generation_failed");
        }
      } else if (data.paid && !data.reportKey) {
        // Paid but generation never completed — allow retry without charge
        localStorage.setItem("paid", "true");
        localStorage.setItem("ycc_selected_paths", JSON.stringify(data.selectedPaths || []));
        localStorage.setItem("paid_email", data.email || "");
        setSelectedPath(data.selectedPaths || null);
        setGenErrorCode("report_not_in_browser");
        setGenErrorDetail("Payment confirmed but report generation did not complete. Retry to generate.");
        setPhase("generation_failed");
      } else {
        // Unpaid — show free summary with their results intact
        setPhase("free_summary_return");
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Mobile post-payment reload recovery ───────────────────────────────────
  useEffect(() => {
    if (phase !== "post_payment_reload") return;
    log("post_payment_reload → ENTERED", {
      answerCount:  Object.keys(answers).length,
      assessmentId: localStorage.getItem("ycc_assessment_id"),
    });
    const storedPaths = localStorage.getItem("ycc_selected_paths");
    let paths = null;
    try { paths = storedPaths ? JSON.parse(storedPaths) : null; } catch {}

    if (Object.keys(answers).length > 0) {
      runAI(answers, paths);
    } else {
      log("post_payment_reload → no answers", {});
      failGeneration("no_answers", "post_payment_reload: answers not in localStorage");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const aiRunning = useRef(false);

  // ── All generation failures funnel here — never to the payment page ───────
  const failGeneration = (code, detail) => {
    log("runAI → FAILED → generation_failed", { code, detail });
    setGenErrorCode(code);
    setGenErrorDetail(detail);
    setPhase("generation_failed");
    aiRunning.current = false;
  };

  const cur = STEPS[step];
  const singleOtherSelected = cur.type === "single" && answers[cur.id] === OTHER_OPTION;
  const multiOtherSelected  = cur.type === "multi"  && multiSel.includes(OTHER_OPTION);
  const otherRequired = (singleOtherSelected || multiOtherSelected) && cur.hasOther;

  const canProceed =
    cur.type === "multi"   ? multiSel.length > 0 && (!otherRequired || otherText.trim().length > 0)
    : cur.type === "text"  ? textVal.trim().length > 0
    : cur.type === "rating"? rating > 0
    : !!answers[cur.id] && (!otherRequired || otherText.trim().length > 0);

  const getValue = () => {
    if (cur.type === "multi") {
      const base  = multiSel.filter(o => o !== OTHER_OPTION);
      const parts = multiOtherSelected && otherText.trim() ? [...base, `Other: ${otherText.trim()}`] : base;
      return parts.length > 0 ? parts.join("; ") : "";
    }
    if (cur.type === "text")    return textVal.trim();
    if (cur.type === "rating")  return rating > 0 ? String(rating) : "";
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
      // Quiz complete: generate assessment ID and store locally for mobile safety
      const newId   = generateAssessmentId();
      const email   = localStorage.getItem("lead_email") || "";
      const name    = localStorage.getItem("lead_name")  || userName;
      const safeKey = "ycc_" + Date.now();
      localStorage.setItem(safeKey, JSON.stringify({ answers: updated, name, email, timestamp: new Date().toISOString() }));
      localStorage.setItem("ycc_latest_summary", safeKey);
      localStorage.setItem("ycc_assessment_id", newId);
      setAssessmentId(newId);
      log("QUIZ complete", { newId, answerCount: Object.keys(updated).length });
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

  // ─── RUN AI ───────────────────────────────────────────────────────────────
  const runAI = async (final, path) => {
    if (aiRunning.current) {
      log("runAI → SKIPPED (duplicate call)", {});
      return;
    }
    aiRunning.current = true;

    const currentId = assessmentId || localStorage.getItem("ycc_assessment_id");

    log("runAI → ENTERED", {
      answerCount: final ? Object.keys(final).length : 0,
      path,
      assessmentId: currentId,
      paid_ref:  localStorage.getItem("paid_ref"),
      paid:      localStorage.getItem("paid"),
    });

    if (!final || Object.keys(final).length === 0) {
      return failGeneration("no_answers", "answers object was empty at runAI entry");
    }

    log("runAI → setPhase(loading)");
    setPhase("loading");
    setStreamed(""); setReport(""); setError("");

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    log("runAI → API key present?", { present: !!apiKey, length: apiKey?.length ?? 0 });
    if (!apiKey) {
      return failGeneration("auth", "VITE_ANTHROPIC_API_KEY missing from environment");
    }

    log("runAI → Anthropic fetch starting", { path, userMsgLen: buildUserMessage(final, path).length });

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
          system: [{ type:"text", text:SYSTEM_PROMPT, cache_control:{ type:"ephemeral" } }],
          messages: [{ role:"user", content:buildUserMessage(final, path) }],
        }),
      });

      log("runAI → Anthropic response", { status: res.status, ok: res.ok });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        const errType = errData?.error?.type    || "";
        const errMsg  = errData?.error?.message || "";
        log("runAI → Anthropic error body", { errType, errMsg, status: res.status });
        if (res.status === 401) return failGeneration("auth",    `HTTP 401 — ${errMsg}`);
        if (errType === "insufficient_quota" || res.status === 529 || errMsg.toLowerCase().includes("credit"))
          return failGeneration("credits", `HTTP ${res.status} ${errType} — ${errMsg}`);
        return failGeneration("api_error", `HTTP ${res.status} ${errType} — ${errMsg}`);
      }

      log("runAI → setPhase(results) — stream starting");
      setPhase("results");

      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let full = "", chunkCount = 0;

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
        totalChars:   full.length,
        totalChunks:  chunkCount,
        sectionCount: (full.match(/^## /gm) || []).length,
      });

      if (full.length === 0) {
        return failGeneration("api_error", "stream completed with 0 bytes");
      }

      setReport(full);

      // Save report to localStorage (fast local access)
      const email     = localStorage.getItem("paid_email") || localStorage.getItem("lead_email") || "";
      const name      = localStorage.getItem("lead_name")  || userName;
      const reportKey = "ycc_report_" + Date.now();
      localStorage.setItem(reportKey, JSON.stringify({
        report: full, name, email,
        paths: Array.isArray(path) ? path : [path],
        timestamp: new Date().toISOString(),
      }));
      log("runAI → report saved to localStorage", { reportKey });

      // Persist report key to Firestore so returning users can be identified
      if (currentId) saveReportKey(currentId, reportKey);

      // Bug 2 fix: clear payment flags only after confirmed delivery
      clearPaymentSession();

      // Send blueprint email with the permanent /results/:id link
      if (email && currentId) {
        sendBlueprintEmail({ name, email, assessmentId: currentId });
      }

    } catch (e) {
      log("runAI → EXCEPTION", { message: e.message });
      return failGeneration("network", e.message || "Unknown network error");
    } finally {
      aiRunning.current = false;
    }
  };

  const done = report && streamed === report;

  // Bug 4 fix: reset clears everything so next session starts clean
  const reset = () => {
    log("reset → clearing all session state");
    clearPaymentSession();
    localStorage.removeItem("ycc_latest_summary");
    localStorage.removeItem("ycc_assessment_id");
    if (window.location.pathname !== "/") window.history.pushState({}, "", "/");
    setPhase("landing"); setStep(0); setAnswers({}); setSelectedPath(null);
    setAssessmentId(null);
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

  // ─── RENDER ───────────────────────────────────────────────────────────────
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
              log("FreeSummary → onPay", { paths, assessmentId });
              localStorage.setItem("ycc_selected_paths", JSON.stringify(paths));
              setSelectedPath(paths);
              setPhase("payment");
            }}
            onScoreReady={(s, a) => { setFreeScore(s); setFreeArchetype(a); }}
            onSummaryReady={(score, archetype, topPath) => {
              // Fires once when user reaches screen 1.
              // Save to Firestore and send the permanent email link.
              const email     = localStorage.getItem("lead_email") || "";
              const name      = localStorage.getItem("lead_name")  || userName;
              const currentId = assessmentId || localStorage.getItem("ycc_assessment_id");
              const latestKey = localStorage.getItem("ycc_latest_summary");
              const storedAnswers = (() => {
                try { return JSON.parse(localStorage.getItem(latestKey))?.answers || answers; } catch { return answers; }
              })();

              if (currentId) {
                saveAssessment({ id:currentId, email, name, answers:storedAnswers, score, archetype, topPath });
                if (email) {
                  sendSummaryEmail({ name, email, archetype: archetype?.name, topPath, assessmentId: currentId });
                }
              }
            }}
            onReset={reset}
          />
        ) : (
          // /results/:id was opened on a different device before Firestore saved —
          // this path is now a rare fallback since Firestore handles cross-device.
          <div style={{ minHeight:"100vh", background:"#0a0f28", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:32, textAlign:"center", gap:20 }}>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:700, color:"#fff" }}>Your<span style={{ color:"#c8a030" }}>Clinical</span>Currency</div>
            <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:700, color:"#fff", maxWidth:400 }}>Welcome back</h2>
            <p style={{ fontFamily:"'DM Sans',sans-serif", fontSize:14, color:"rgba(255,255,255,0.5)", maxWidth:380, lineHeight:1.7 }}>
              Your results were saved. Use the link in your email to open them on any device.
            </p>
            <button onClick={reset} style={{ background:"#c8a030", color:"#0d1b3e", fontFamily:"'Space Grotesk',sans-serif", fontSize:13, fontWeight:700, padding:"14px 32px", border:"none", borderRadius:4, cursor:"pointer" }}>
              Start a New Assessment
            </button>
          </div>
        )
      )}

      {phase === "results_loading" && <ReturningScreen />}
      {phase === "not_found"       && <NotFoundScreen onReset={reset} />}

      {phase === "payment" && (
        <PaymentGate
          selectedPath={selectedPath}
          onSuccess={() => {
            const paidRef   = localStorage.getItem("paid_ref")   || "";
            const paidEmail = localStorage.getItem("paid_email") || localStorage.getItem("lead_email") || "";
            const currentId = assessmentId || localStorage.getItem("ycc_assessment_id");
            log("PaymentGate → onSuccess CALLED", { paidRef, paidEmail, assessmentId: currentId });

            const latestKey     = localStorage.getItem("ycc_latest_summary");
            const storedAnswers = latestKey
              ? (() => { try { return JSON.parse(localStorage.getItem(latestKey))?.answers || {}; } catch { return {}; } })()
              : {};
            const storedPaths   = (() => { try { return JSON.parse(localStorage.getItem("ycc_selected_paths")); } catch { return null; } })();
            const finalAnswers  = Object.keys(storedAnswers).length > 0 ? storedAnswers : answers;
            const finalPaths    = storedPaths || selectedPath;

            log("PaymentGate → onSuccess RESOLVED", {
              answerCount: Object.keys(finalAnswers).length,
              paths: finalPaths,
              assessmentId: currentId,
            });

            // Record payment in Firestore before starting generation
            if (currentId) markAssessmentPaid(currentId, { paidRef, selectedPaths: finalPaths || [] });

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
            log("GenerationFailedScreen → RETRY tapped", { genErrorCode });
            setGenErrorCode(""); setGenErrorDetail("");
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
