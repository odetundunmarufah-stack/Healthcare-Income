import { ICONS, CARD_COLORS, WIDE_SECTIONS } from "../data/reportConfig";
import { renderMd } from "../utils/renderMd";
import { openPrintableReport } from "./PrintableReport";

export default function ResultsPage({ sections, done, streamed, userName, selectedPaths, score, archetype, onReset }) {
  return (
    <div className="res-wrap">
      <div className="res-hdr">
        <div className="res-inner">
          <div>
            <div className="r-label">Your Clinical Currency Blueprint</div>
            <h1 className="r-h1">Your<br />Personalised<br />Report</h1>
            <p className="r-sub">
              Built from your 15 assessment answers — specific to your specialty, personality, and chosen income path.
            </p>
          </div>
          <div className="r-stats">
            {[
              {n:"14", l:"Report sections generated"},
              {n:"30", l:"Day implementation roadmap"},
              {n:"3",  l:"Income scenarios mapped"},
              {n:"PDF",l:"Delivered to your email"},
            ].map(s => (
              <div key={s.n} className="r-stat">
                <div className="r-stat-n">{s.n}</div>
                <div className="r-stat-l">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="r-body">
        <div className="r-grid">
          {sections.length > 0 ? sections.map((sec, i) => {
            const wide = WIDE_SECTIONS.some(w => sec.title.includes(w));
            const bg = CARD_COLORS[sec.title] || "#1a3a6b";
            return (
              <div
                key={i}
                className={`rcard${wide ? " wide" : ""}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="rcard-h" style={{ background: bg }}>
                  <span className="rcard-ico">{ICONS[sec.title] || "📋"}</span>
                  <span className="rcard-ttl">{sec.title}</span>
                </div>
                <div className="rcard-b">
                  {renderMd(sec.content)}
                  {!done && i === sections.length - 1 && <span className="cursor" />}
                </div>
              </div>
            );
          }) : (
            <div className="streaming">
              Building your Clinical Currency Blueprint<span className="cursor" />
            </div>
          )}

          {done && (
            <div className="r-acts">

              {/* ── EMAIL DELIVERY CONFIRMATION ── */}
              <div className="r-delivery-msg">
                ✉️ Your blueprint has been sent to your email as a PDF. Check your inbox.
              </div>

              {/* ── DOWNLOAD PDF BUTTON ── */}
              <button
                className="btn-download-pdf"
                onClick={() => openPrintableReport({ sections, userName, selectedPaths, score, archetype })}
              >
                ⬇ Download / View as PDF
              </button>

              {/* ── WHATSAPP COMMUNITY CTA ── */}
              <div className="r-wa-cta">
                <div className="r-wa-cta-inner">
                  <div className="r-wa-cta-icon">💬</div>
                  <div className="r-wa-cta-text">
                    <div className="r-wa-cta-title">Join the YCC Community</div>
                    <p className="r-wa-cta-desc">Your blueprint tells you what to do. The YCC Community makes sure you actually do it — weekly check-ins, live Q&As, accountability partners, income milestone support, and a growing group of Nigerian healthcare professionals building income alongside you.</p>
                  </div>
                </div>
                <a
                  className="btn-whatsapp"
                  href="https://chat.whatsapp.com/KqhTYdiG4LjF9IrxPRWnD2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  💬 Join the YCC Community — It is Free
                </a>
              </div>

              <button className="btn-reset" onClick={onReset}>← Start Over</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
