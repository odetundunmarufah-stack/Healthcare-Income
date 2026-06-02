import { ICONS, CARD_COLORS, WIDE_SECTIONS } from "../data/reportConfig";
import { renderMd } from "../utils/renderMd";

export default function ResultsPage({ sections, done, streamed, onReset }) {
  return (
    <div className="res-wrap">
      <div className="res-hdr">
        <div className="res-inner">
          <div>
            <div className="r-label">Your Personalised Report</div>
            <h1 className="r-h1">Healthcare Income<br />Navigator</h1>
            <p className="r-sub">
              Built from 28 answers about your profession, specialty, personality, goals, and location. Every recommendation is specific to your profile.
            </p>
          </div>
          <div className="r-stats">
            {[
              {n:"28",l:"Profile data points analysed"},
              {n:"12",l:"Report sections generated"},
              {n:"30",l:"Day implementation roadmap"},
              {n:"4+",l:"Income categories mapped"},
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
            const bg = CARD_COLORS[sec.title] || "#1a6b5a";
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
              Building your Healthcare Income Navigator<span className="cursor" />
            </div>
          )}
          {done && (
            <div className="r-acts">
              <div className="r-delivery-msg">
                ✉️ Your personalised report has been sent to your email. Continue your onboarding inside the community below.
              </div>
              <a
                className="btn-whatsapp"
                href="https://chat.whatsapp.com/YOUR_GROUP_LINK"
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 Join Your Private Healthcare Income Community
              </a>
              <button className="btn-reset" onClick={onReset}>← Start Over</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
