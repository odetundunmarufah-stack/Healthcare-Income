import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { renderMd } from "../utils/renderMd";
import { ICONS, CARD_COLORS } from "../data/reportConfig";

const PATH_NAMES = {
  remote: "The Remote Income Path",
  remote_medva: "Medical Virtual Assistant",
  prior_auth: "Prior Authorisation Specialist",
  education: "The Clinical Educator Path",
  online_courses: "Online Courses and Teaching",
  consulting: "The Private Consulting Path",
  private_consult: "Private Consultation Practice",
  health_content: "Health Content Creator",
  content: "Health Content Creator",
  digital_products: "Digital Products and Passive Income",
  med_writing: "Medical Writing",
  writing: "Medical Writing",
  corporate_wellness: "Corporate Wellness and Speaking",
  health_coaching: "Health Coaching and Advisory",
  health_tech: "Health Tech and Digital Ventures",
  business: "Healthcare Business",
  aesthetics: "Medical Aesthetics and Wellness",
  community_building: "Healthcare Community and Membership",
  transition: "Non-Clinical Career Transition",
};

// ─── OPEN IN NEW TAB ─────────────────────────────────────────────────────────
export const openPrintableReport = ({ sections, userName, selectedPaths }) => {
  const win = window.open("", "_blank");
  if (!win) return;

  // Inject styles into new window
  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
    <title>Your Clinical Currency Blueprint</title>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet"/>
    <style>
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      :root{--navy:#0d1b3e;--gold:#c8a030;--gold-light:#e0b84a;}
      body{background:#fff;font-family:'DM Sans',sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
      .no-print{position:fixed;top:0;left:0;right:0;background:var(--navy);padding:12px 24px;display:flex;align-items:center;justify-content:space-between;z-index:100;gap:16px;}
      .no-print p{font-size:13px;color:rgba(255,255,255,0.6);font-family:'DM Sans',sans-serif;}
      .no-print button{background:var(--gold);color:var(--navy);font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;padding:8px 20px;border:none;border-radius:4px;cursor:pointer;}
      .pr-spacer{height:48px;}
      .pr-page{min-height:100vh;page-break-after:always;padding:60px 64px;display:flex;flex-direction:column;box-sizing:border-box;}
      .pr-cover{background:var(--navy);justify-content:space-between;}
      .pr-cover-logo{font-family:'Space Grotesk',sans-serif;font-size:18px;font-weight:700;color:#fff;margin-bottom:6px;}
      .pr-cover-logo span{color:var(--gold);}
      .pr-cover-tagline{font-size:12px;font-weight:300;color:rgba(255,255,255,0.35);}
      .pr-cover-main{flex:1;display:flex;flex-direction:column;justify-content:center;padding:60px 0;}
      .pr-cover-label{font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);margin-bottom:20px;opacity:.8;}
      .pr-cover-title{font-family:'Space Grotesk',sans-serif;font-size:48px;font-weight:700;color:#fff;line-height:1.1;margin-bottom:28px;letter-spacing:-0.02em;}
      .pr-cover-name{font-size:16px;font-weight:400;color:rgba(255,255,255,0.6);margin-bottom:8px;}
      .pr-cover-path{font-family:'Space Grotesk',sans-serif;font-size:14px;font-weight:600;color:var(--gold);margin-bottom:8px;}
      .pr-cover-date{font-size:13px;font-weight:300;color:rgba(255,255,255,0.3);}
      .pr-cover-footer{border-top:1px solid rgba(255,255,255,0.1);padding-top:20px;}
      .pr-cover-footer-note{font-size:12px;font-weight:300;color:rgba(255,255,255,0.3);line-height:1.65;}
      .pr-section-page{padding:0;}
      .pr-section-header{padding:20px 40px;display:flex;align-items:center;gap:12px;}
      .pr-section-icon{font-size:18px;}
      .pr-section-title{font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,0.9);}
      .pr-section-body{padding:32px 40px;flex:1;}
      .pr-section-body p{font-size:13px;line-height:1.85;color:#1a2a3a;margin-bottom:10px;}
      .pr-section-body h4{font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#0d1b3e;margin:18px 0 8px;}
      .pr-section-body ul,.pr-section-body ol{padding-left:20px;margin-bottom:10px;}
      .pr-section-body li{font-size:13px;line-height:1.8;color:#1a2a3a;margin-bottom:4px;}
      .pr-section-body strong{color:#0d1b3e;font-weight:600;}
      .pr-page-footer{padding:14px 40px;border-top:1px solid #e8edf4;display:flex;justify-content:space-between;align-items:center;}
      .pr-footer-brand{font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:600;color:var(--gold);letter-spacing:.08em;}
      .pr-footer-page{font-size:11px;color:#9aadcc;}
      .pr-backpage{background:var(--navy);justify-content:space-between;align-items:center;text-align:center;}
      .pr-back-logo{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:#fff;margin-bottom:32px;}
      .pr-back-logo span{color:var(--gold);}
      .pr-back-title{font-family:'Space Grotesk',sans-serif;font-size:28px;font-weight:700;color:#fff;margin-bottom:16px;line-height:1.2;max-width:480px;}
      .pr-back-body{font-size:14px;font-weight:300;color:rgba(255,255,255,0.45);line-height:1.75;max-width:480px;margin-bottom:28px;}
      .pr-wa-box{background:rgba(37,211,102,0.08);border:1px solid rgba(37,211,102,0.2);border-radius:10px;padding:24px 32px;max-width:480px;width:100%;margin-bottom:24px;}
      .pr-wa-icon{font-size:28px;margin-bottom:10px;}
      .pr-wa-title{font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;color:#fff;margin-bottom:8px;}
      .pr-wa-desc{font-size:12px;color:rgba(255,255,255,0.5);line-height:1.7;margin-bottom:12px;}
      .pr-wa-link{font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:600;color:#4ade80;word-break:break-all;margin-bottom:10px;}
      .pr-wa-cta{font-size:13px;font-weight:500;color:rgba(255,255,255,0.6);font-style:italic;}
      .pr-back-bonuses{max-width:480px;width:100%;margin-bottom:32px;}
      .pr-bonus-title{font-family:'Space Grotesk',sans-serif;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-bottom:10px;opacity:.8;}
      .pr-bonus-item{font-size:13px;color:rgba(255,255,255,0.55);padding:3px 0;}
      .pr-back-footer{border-top:1px solid rgba(255,255,255,0.08);padding-top:16px;width:100%;text-align:center;}
      .pr-back-footer-brand{font-family:'Space Grotesk',sans-serif;font-size:13px;font-weight:700;color:#fff;}
      .pr-back-footer-note{font-size:12px;color:rgba(255,255,255,0.3);margin-top:4px;}
      @media print{.no-print,.pr-spacer{display:none!important;}.pr-page{page-break-after:always;min-height:auto;}}
    </style>
  </head><body><div id="pr-root"></div></body></html>`);
  win.document.close();

  // Mount React into new window
  setTimeout(() => {
    const root = win.document.getElementById("pr-root");
    if (root) {
      createRoot(root).render(
        <PrintableReportContent sections={sections} userName={userName} selectedPaths={selectedPaths} win={win} />
      );
    }
  }, 200);
};

// ─── CONTENT COMPONENT ────────────────────────────────────────────────────────
function PrintableReportContent({ sections, userName, selectedPaths, win }) {
  useEffect(() => {
    const timer = setTimeout(() => win.print(), 800);
    return () => clearTimeout(timer);
  }, []);

  const pathNames = Array.isArray(selectedPaths)
    ? selectedPaths.map(p => PATH_NAMES[p] || p).join(" & ")
    : PATH_NAMES[selectedPaths] || "Your Clinical Currency";

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      <div className="no-print">
        <p>Your browser's print dialog will open shortly. Select <strong>Save as PDF</strong> to download.</p>
        <button onClick={() => win.close()}>Close</button>
      </div>
      <div className="pr-spacer" />

      {/* Cover */}
      <div className="pr-page pr-cover">
        <div>
          <div className="pr-cover-logo">Your<span>Clinical</span>Currency</div>
          <div className="pr-cover-tagline">Turn Your Healthcare Expertise Into Income, Impact, and Opportunity</div>
        </div>
        <div className="pr-cover-main">
          <div className="pr-cover-label">Personalised Income Blueprint</div>
          <div className="pr-cover-title">Your Clinical Currency Blueprint</div>
          {userName && <div className="pr-cover-name">Prepared for {userName}</div>}
          <div className="pr-cover-path">Primary Path: {pathNames}</div>
          <div className="pr-cover-date">{today}</div>
        </div>
        <div className="pr-cover-footer">
          <div className="pr-cover-footer-note">This report was generated specifically from your assessment answers. Every recommendation is personalised to your profession, specialty, personality, and goals.</div>
        </div>
      </div>

      {/* Sections */}
      {sections.map((sec, i) => {
        const bg = CARD_COLORS[sec.title] || "#1a3a6b";
        const icon = ICONS[sec.title] || "📋";
        return (
          <div key={i} className="pr-page pr-section-page">
            <div className="pr-section-header" style={{ background: bg }}>
              <span className="pr-section-icon">{icon}</span>
              <span className="pr-section-title">{sec.title}</span>
            </div>
            <div className="pr-section-body">
              {renderMd(sec.content)}
            </div>
            <div className="pr-page-footer">
              <span className="pr-footer-brand">Your Clinical Currency Blueprint</span>
              <span className="pr-footer-page">{i + 1} / {sections.length}</span>
            </div>
          </div>
        );
      })}

      {/* Back page */}
      <div className="pr-page pr-backpage">
        <div className="pr-back-logo">Your<span>Clinical</span>Currency</div>
        <div className="pr-back-title">Your Next Step Is Not In This Report.</div>
        <p className="pr-back-body">
          It is in a community of Nigerian healthcare professionals who are doing exactly what you are now planning to do — building income, growing their presence, and holding each other accountable.
        </p>
        <div className="pr-wa-box">
          <div className="pr-wa-icon">💬</div>
          <div className="pr-wa-title">Join the YCC Community</div>
          <p className="pr-wa-desc">Weekly check-ins · Live Q&As · Accountability partners · Income milestone support · Templates and resources</p>
          <div className="pr-wa-link">https://chat.whatsapp.com/KqhTYdiG4LjF9IrxPRWnD2</div>
          <p className="pr-wa-cta">Your report tells you what to do. The YCC Community makes sure you actually do it.</p>
        </div>
        <div className="pr-back-bonuses">
          <div className="pr-bonus-title">Your Bonuses — Included</div>
          <div className="pr-bonus-item">✓ The First ₦100k Checklist</div>
          <div className="pr-bonus-item">✓ 30 Content Ideas for your specialty</div>
          <div className="pr-bonus-item">✓ Access to the YCC Community</div>
        </div>
        <div className="pr-back-footer">
          <div className="pr-back-footer-brand">Your Clinical Currency</div>
          <div className="pr-back-footer-note">yourclinicalcurrency.com</div>
        </div>
      </div>
    </>
  );
}

export default function PrintableReport({ sections, userName, selectedPaths, onClose }) {
  useEffect(() => {
    // Give a moment for styles to load then open print
    const timer = setTimeout(() => window.print(), 600);
    return () => clearTimeout(timer);
  }, []);

  const pathNames = Array.isArray(selectedPaths)
    ? selectedPaths.map(p => PATH_NAMES[p] || p).join(" & ")
    : PATH_NAMES[selectedPaths] || "Your Clinical Currency";

  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="pr-wrap">

      {/* ── CLOSE BUTTON (screen only) ── */}
      <div className="pr-close-bar no-print">
        <p className="pr-close-hint">Your browser's print dialog will open shortly. Select "Save as PDF" to download.</p>
        <button className="pr-close-btn" onClick={onClose}>← Back to Report</button>
      </div>

      {/* ── COVER PAGE ── */}
      <div className="pr-page pr-cover">
        <div className="pr-cover-top">
          <div className="pr-cover-logo">Your<span>Clinical</span>Currency</div>
          <div className="pr-cover-tagline">Turn Your Healthcare Expertise Into Income, Impact, and Opportunity</div>
        </div>
        <div className="pr-cover-main">
          <div className="pr-cover-label">PERSONALISED INCOME BLUEPRINT</div>
          <h1 className="pr-cover-title">Your Clinical Currency Blueprint</h1>
          {userName && <div className="pr-cover-name">Prepared for {userName}</div>}
          <div className="pr-cover-path">Primary Path: {pathNames}</div>
          <div className="pr-cover-date">{today}</div>
        </div>
        <div className="pr-cover-footer">
          <div className="pr-cover-footer-note">This report was generated specifically from your assessment answers. Every recommendation is personalised to your profession, specialty, personality, and goals.</div>
        </div>
      </div>

      {/* ── REPORT SECTIONS ── */}
      {sections.map((sec, i) => {
        const bg = CARD_COLORS[sec.title] || "#1a3a6b";
        const icon = ICONS[sec.title] || "📋";
        return (
          <div key={i} className="pr-page pr-section-page">
            <div className="pr-section-header" style={{ background: bg }}>
              <span className="pr-section-icon">{icon}</span>
              <span className="pr-section-title">{sec.title}</span>
            </div>
            <div className="pr-section-body">
              {renderMd(sec.content)}
            </div>
            <div className="pr-page-footer">
              <span className="pr-footer-brand">Your Clinical Currency Blueprint</span>
              <span className="pr-footer-page">{i + 1} / {sections.length}</span>
            </div>
          </div>
        );
      })}

      {/* ── BACK PAGE ── */}
      <div className="pr-page pr-backpage">
        <div className="pr-back-logo">Your<span>Clinical</span>Currency</div>
        <div className="pr-back-title">Your Next Step Is Not In This Report.</div>
        <p className="pr-back-body">
          It is in a community of Nigerian healthcare professionals who are doing exactly what you are now planning to do — building income, growing their online presence, and holding each other accountable.
        </p>

        <div className="pr-wa-box">
          <div className="pr-wa-icon">💬</div>
          <div className="pr-wa-title">Join the YCC Community</div>
          <p className="pr-wa-desc">
            Weekly check-ins · Live Q&A sessions · Accountability partners · Income milestone support · Platform growth guidance · Templates and resources
          </p>
          <div className="pr-wa-link">https://chat.whatsapp.com/KqhTYdiG4LjF9IrxPRWnD2</div>
          <p className="pr-wa-cta">Your report tells you what to do. The YCC Community makes sure you actually do it.</p>
        </div>

        <div className="pr-back-bonuses">
          <div className="pr-bonus-title">Your Bonuses — Also Included</div>
          <div className="pr-bonus-item">✓ The First ₦100k Checklist</div>
          <div className="pr-bonus-item">✓ 30 Content Ideas tailored to your specialty</div>
          <div className="pr-bonus-item">✓ Access to the YCC Community</div>
        </div>

        <div className="pr-back-footer">
          <div className="pr-back-footer-brand">Your Clinical Currency</div>
          <div className="pr-back-footer-note">yourclinicalcurrency.com</div>
        </div>
      </div>

    </div>
  );
}
