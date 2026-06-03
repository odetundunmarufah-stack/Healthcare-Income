// FreeSummary — shown after quiz completion, before payment
// Generates a short free profile using the Anthropic API

import { useState, useEffect } from "react";

const buildFreePrompt = (answers) => `
You are the Your Clinical Currency assessment engine. Based on the following 25-question assessment answers from a healthcare professional, generate a short, compelling FREE profile summary.

ANSWERS:
${Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join("\n")}

Generate EXACTLY this structure with EXACTLY these headings (use ## for each):

## YOUR CAREER PROFILE SUMMARY
Write 3-4 sentences. Address them by their profession and specialty. Describe who they are professionally, their experience level, and their working style. Make it feel like the tool truly understands them. Do NOT use their name.

## YOUR TOP 3 INCOME CATEGORIES
List exactly 3 income categories that fit their profile. For each, write ONE compelling sentence explaining why it fits them specifically. Use bullet points starting with 🟢

## YOUR KEY STRENGTH
One paragraph. Identify the single most powerful monetisable strength in their profile. Be specific to their specialty and answers. Make them feel seen.

## YOUR KEY BLOCKER
One paragraph. Identify the single most significant thing holding them back based on their answers. Be direct but compassionate. Do NOT give solutions — those are in the paid report.

Keep total response under 400 words. Be specific, warm, and direct. Sound like a knowledgeable mentor, not a generic AI.
`;

export default function FreeSummary({ answers, userName, onPay, onReset }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    generateSummary();
  }, []);

  const generateSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 600,
          messages: [{ role: "user", content: buildFreePrompt(answers) }],
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      setSummary(text);
    } catch {
      setError("Could not generate your summary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderSummary = (text) => {
    if (!text) return null;
    const sections = [];
    let current = null;
    for (const line of text.split("\n")) {
      if (line.startsWith("## ")) {
        if (current) sections.push(current);
        current = { title: line.slice(3).trim(), lines: [] };
      } else if (current) {
        current.lines.push(line);
      }
    }
    if (current) sections.push(current);

    return sections.map((sec, i) => (
      <div key={i} className="fs-section">
        <div className="fs-section-title">{sec.title}</div>
        <div className="fs-section-body">
          {sec.lines.map((line, j) => {
            if (!line.trim()) return null;
            if (line.startsWith("🟢")) {
              return (
                <div key={j} className="fs-bullet">
                  <span className="fs-bullet-dot">🟢</span>
                  <span>{line.replace("🟢", "").trim()}</span>
                </div>
              );
            }
            return <p key={j} className="fs-para">{line}</p>;
          })}
        </div>
      </div>
    ));
  };

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
        {loading && (
          <div className="fs-loading">
            <div className="load-ring" style={{ width: 36, height: 36 }} />
            <p>Analysing your profile across 25 data points...</p>
          </div>
        )}
        {error && (
          <div className="fs-error">
            <p>{error}</p>
            <button className="fs-retry" onClick={generateSummary}>Try Again</button>
          </div>
        )}
        {!loading && !error && (
          <div className="fs-content">
            {renderSummary(summary)}
          </div>
        )}
      </div>

      {!loading && !error && (
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
                "📅 30-Day Roadmap — week-by-week tasks built around your clinical schedule",
                "📈 Income Trajectory — conservative and ambitious projections at 3, 6, and 12 months",
                "🧠 Mindset Audit — your specific blockers named and addressed with practical fixes",
                "⚡ The Real Reason You Haven't Started — and how to move past it today",
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
      )}
    </div>
  );
}
