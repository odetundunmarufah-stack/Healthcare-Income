export default function LandingPage({ onStart }) {
  return (
    <div className="land">
      <nav className="land-nav">
        <div className="land-logo">Your<span>Clinical</span>Currency</div>
        <span className="land-tag">Turn Your Healthcare Expertise Into Income, Impact, and Opportunity</span>
      </nav>

      <div className="land-hero">
        <div>
          <div className="land-eyebrow">Income intelligence for African healthcare professionals</div>
          <h1 className="land-h1">
            Your clinical knowledge<br />
            is worth far more than<br />
            <em>your salary reflects.</em>
          </h1>
          <p className="land-body">
            Most Nigerian healthcare professionals are sitting on untapped income potential they have never been shown how to access. Your Clinical Currency gives you a personalised, specialty-specific blueprint — built from a short assessment about who you are, how you work, and what you want.
          </p>
          <button className="land-cta" onClick={onStart}>
            Discover My Clinical Currency →
          </button>
          <span className="land-cta-note">Free assessment · Personalised blueprint · Under 10 minutes</span>
        </div>

        <div className="land-panel">
          <div className="land-panel-title">Your full paid blueprint covers</div>
          {[
            {n:"01", t:"Your Clinical Edge", d:"The specific, monetisable intersection of your specialty, experience, and skills right now"},
            {n:"02", t:"Your Opportunity Map", d:"Every income path ranked by fit, speed, and potential — including ones most clinicians have never heard of"},
            {n:"03", t:"Your Signature Offer", d:"The one thing to start selling first — with exact pricing, platform, and a pitch you can use today"},
            {n:"04", t:"Skills & Certifications Roadmap", d:"What to learn, where to get certified, and what income door each certification unlocks"},
            {n:"05", t:"Your 30-Day Roadmap", d:"Week-by-week tasks built around your actual clinical schedule and available hours"},
            {n:"06", t:"Income Trajectory", d:"Honest, conservative and ambitious projections at 3, 6, and 12 months"},
          ].map(f => (
            <div key={f.n} className="panel-item">
              <div className="panel-num">{f.n}</div>
              <div>
                <h4>{f.t}</h4>
                <p>{f.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="land-how">
        <div className="land-how-title">How It Works</div>
        <h2 className="land-how-h">Your Blueprint in 3 Simple Steps</h2>
        <div className="land-steps">
          {[
            {n:"1", t:"Take the Free Assessment", d:"Answer a short set of questions about your profession, skills, personality, and goals. Completely free."},
            {n:"2", t:"Get Your Free Profile Summary", d:"Instantly see your Income Readiness Score, your Clinical Currency Archetype, and your top 3 income paths."},
            {n:"3", t:"Unlock Your Full Blueprint", d:"Select your preferred income path and pay ₦5,000 to unlock your complete personalised report — delivered to your email as a PDF."},
          ].map(s => (
            <div key={s.n} className="land-step">
              <div className="land-step-num">{s.n}</div>
              <h4>{s.t}</h4>
              <p>{s.d}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="land-problem">
        {[
          {
            icon: "🏥",
            t: "Your salary was not designed to be enough",
            d: "Government salaries have not kept pace with Nigerian inflation. Private sector earnings vary wildly. Most healthcare professionals are quietly building alternative income — or trying to."
          },
          {
            icon: "🔍",
            t: "Generic advice does not fit clinical careers",
            d: "Most income tools suggest freelancing or dropshipping. They do not understand MDCN regulations, clinical time pressures, or the specific skills that come with a healthcare degree."
          },
          {
            icon: "🗺️",
            t: "Nobody has mapped the full picture for you",
            d: "From medical virtual assistance to prior authorisation, health tech operations, and remote consulting — there are dozens of income paths most Nigerian healthcare professionals have never been shown."
          },
        ].map(p => (
          <div key={p.t} className="prob-item">
            <div className="prob-icon">{p.icon}</div>
            <h3>{p.t}</h3>
            <p>{p.d}</p>
          </div>
        ))}
      </div>

      <div className="land-community">
        <div className="land-community-inner">
          <div className="land-community-icon">💬</div>
          <h3 className="land-community-title">Join the Your Clinical Currency Community</h3>
          <p className="land-community-body">
            Your blueprint tells you what to do. The community makes sure you actually do it. Weekly check-ins, live Q&As, accountability partners, and a growing group of Nigerian healthcare professionals building income alongside you.
          </p>
          <button className="land-cta" onClick={onStart} style={{marginTop: 8}}>
            Start Your Free Assessment →
          </button>
        </div>
      </div>

    </div>
  );
}
