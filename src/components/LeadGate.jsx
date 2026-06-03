import { useState } from "react";

export default function LeadGate({ onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim() || name.trim().length < 2) e.name = "Please enter your first name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email address.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    localStorage.setItem("lead_name", name.trim());
    localStorage.setItem("lead_email", email.trim().toLowerCase());
    onSubmit({ name: name.trim(), email: email.trim().toLowerCase() });
  };

  return (
    <div className="lg-overlay">
      <div className="lg-card">
        <div className="lg-logo">Your<span>Clinical</span>Currency</div>
        <div className="lg-badge">Free Assessment</div>
        <h2 className="lg-title">Where should we send your results?</h2>
        <p className="lg-body">
          Enter your name and email to begin the 25-question assessment. Your personalised Clinical Currency Blueprint will be waiting at the end.
        </p>

        <div className="lg-fields">
          <div className="lg-field">
            <label className="lg-label" htmlFor="lg-name">First name</label>
            <input
              id="lg-name"
              className={`lg-input${errors.name ? " lg-input-err" : ""}`}
              type="text"
              placeholder="e.g. Amaka"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
            {errors.name && <p className="lg-err">{errors.name}</p>}
          </div>

          <div className="lg-field">
            <label className="lg-label" htmlFor="lg-email">Email address</label>
            <input
              id="lg-email"
              className={`lg-input${errors.email ? " lg-input-err" : ""}`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
            />
            {errors.email && <p className="lg-err">{errors.email}</p>}
          </div>
        </div>

        <button className="lg-btn" onClick={handleSubmit}>
          Start My Free Assessment →
        </button>

        <p className="lg-note">
          🔒 No spam. Your details are used only to deliver your report and keep you updated on healthcare income opportunities.
        </p>

        <div className="lg-trust">
          {["25 personalised questions", "Free to complete", "Results in under 10 minutes"].map(t => (
            <span key={t} className="lg-trust-item">✓ {t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
