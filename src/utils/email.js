// ─── EMAIL DELIVERY UTILITY ────────────────────────────────────────────────
// Frontend-safe. No backend required.
//
// HOW TO ACTIVATE (pick one):
//
// OPTION A — Zapier/Make webhook (recommended, zero code):
//   1. Create a Zap: "Catch Hook" → "Send Email" (Gmail/SendGrid/etc.)
//   2. Replace WEBHOOK_URL below with your webhook URL
//   3. Map {{email}} and {{report}} fields in your Zap
//
// OPTION B — EmailJS (if you prefer a JS SDK):
//   1. npm install @emailjs/browser
//   2. Replace the fetch() block with:
//      import emailjs from "@emailjs/browser";
//      await emailjs.send("SERVICE_ID", "TEMPLATE_ID", { email, report }, "PUBLIC_KEY");
//
// Until a real URL is set, sendResultEmail() silently no-ops so the app
// never throws on report completion.
// ─────────────────────────────────────────────────────────────────────────────

const WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/27826834/4bfsj5y/";

export const sendResultEmail = async (email, report) => {
  if (!email || !report) return;
  if (WEBHOOK_URL.includes("REPLACE_WITH_YOUR_WEBHOOK")) {
    // Webhook not yet configured — fail silently in production
    console.warn("[email.js] Webhook URL not set. Report email not sent.");
    return;
  }

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        report,
        // First ~600 chars as a plain-text preview for the email subject/preview line
        preview: report.slice(0, 600).replace(/[#*`]/g, "").trim(),
        sent_at: new Date().toISOString(),
      }),
    });
  } catch (err) {
    // Never surface delivery errors to the user — report is already on screen
    console.error("[email.js] Delivery failed:", err);
  }
};
