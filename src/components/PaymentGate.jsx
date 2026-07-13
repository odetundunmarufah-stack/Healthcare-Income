import { useState } from "react";

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

// ─── LAUNCH PRICING ──────────────────────────────────────────────────────────
const AMOUNT_KOBO    = 350000;
const DISPLAY_PRICE  = "3,500";
const REGULAR_PRICE  = "5,000";

// ─── COMPLIMENTARY ACCESS WHITELIST ──────────────────────────────────────────
// Emails listed here bypass payment entirely and go straight to blueprint delivery.
// All lowercase — comparison is case-insensitive.
const COMPLIMENTARY_EMAILS = [
  "carleherbdul@yahoo.com",
  "waleoyewole2008@gmail.com",
];

const isComplimentary = (email) =>
  COMPLIMENTARY_EMAILS.includes(email.trim().toLowerCase());

export default function PaymentGate({ onSuccess, selectedPath }) {
  const [email, setEmail] = useState(
    localStorage.getItem("lead_email") || localStorage.getItem("paid_email") || ""
  );
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handlePay = () => {
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setLoading(true);

    // Complimentary access — skip Paystack entirely
    if (isComplimentary(email)) {
      localStorage.setItem("paid", "true");
      localStorage.setItem("paid_email", email);
      localStorage.setItem("paid_ref", "COMPLIMENTARY");
      onSuccess();
      return;
    }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: AMOUNT_KOBO,
      currency: "NGN",
      label: "Your Clinical Currency",
      onClose: () => { setLoading(false); },
      callback: (response) => {
        if (response.status === "success") {
          localStorage.setItem("paid", "true");
          localStorage.setItem("paid_email", email);
          localStorage.setItem("paid_ref", response.reference);
          onSuccess();
        } else {
          setLoading(false);
        }
      },
    });

    handler.openIframe();
  };

  return (
    <div className="pg-overlay">
      <div className="pg-card">
        <div className="pg-logo">Your<span>Clinical</span>Currency</div>
        <div className="pg-badge">Founding member price</div>
        <h2 className="pg-title">Unlock Your Full Clinical Currency Blueprint</h2>
        <p className="pg-body">
          Get a fully personalised income blueprint built from your assessment answers — specific to your specialty, personality, and goals. Pay once, yours forever.
        </p>

        <div className="pg-price-row">
          <span className="pg-currency">₦</span>
          <span className="pg-amount">{DISPLAY_PRICE}</span>
          <span className="pg-once">one-time</span>
        </div>
        <div className="pg-regular-price">Regular price: ₦{REGULAR_PRICE}</div>

        <div className="pg-delivery-note">
          <span className="pg-delivery-icon">⏱️</span>
          <div>
            <div className="pg-delivery-title">Delivered within 2 hours</div>
            <p className="pg-delivery-body">Your blueprint is personally crafted during launch week to ensure exceptional quality. It arrives by email, ready to read on any device.</p>
          </div>
        </div>

        <ul className="pg-features">
          <li>✓ Your Clinical Edge &amp; Opportunity Map</li>
          <li>✓ Personality-fit income model</li>
          <li>✓ 30-day implementation roadmap</li>
          <li>✓ Realistic income projections</li>
          <li>✓ Mindset &amp; blocker audit</li>
        </ul>

        <div className="pg-field">
          <label className="pg-label" htmlFor="pg-email">Your email address</label>
          <input
            id="pg-email"
            className={`pg-input${emailError ? " pg-input-err" : ""}`}
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handlePay()}
            disabled={loading}
          />
          {emailError && <p className="pg-field-err">{emailError}</p>}
        </div>

        <button className="pg-btn" onClick={handlePay} disabled={loading}>
          {loading ? "Opening payment…" : `Pay ₦${DISPLAY_PRICE} & Get My Blueprint →`}
        </button>

        <p className="pg-secure">🔒 Secured by Paystack · Card, bank transfer &amp; USSD accepted</p>
      </div>
    </div>
  );
}
