import { useState } from "react";

// ─── Replace with your live/test public key from dashboard.paystack.com ───────
const PAYSTACK_PUBLIC_KEY = "pk_test_REPLACE_WITH_YOUR_KEY";
const AMOUNT_KOBO = 500000; // ₦5,000 × 100

export default function PaymentGate({ onSuccess }) {
  const [email, setEmail] = useState("");
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

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: AMOUNT_KOBO,
      currency: "NGN",
      label: "Healthcare Income Navigator",
      onClose: () => {
        setLoading(false);
      },
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
        <div className="pg-logo">Healthcare<span>Income</span> Navigator</div>
        <div className="pg-badge">One-time access</div>
        <h2 className="pg-title">Unlock Your Personalised Report</h2>
        <p className="pg-body">
          Get a fully personalised income blueprint built from 25 data points about your profession, personality, goals, and location. Pay once — access yours forever.
        </p>

        <div className="pg-price-row">
          <span className="pg-currency">₦</span>
          <span className="pg-amount">5,000</span>
          <span className="pg-once">one-time</span>
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
          {loading ? "Opening payment…" : "Pay ₦5,000 & Start →"}
        </button>

        <p className="pg-secure">🔒 Secured by Paystack · Card, bank transfer &amp; USSD accepted</p>
      </div>
    </div>
  );
}
