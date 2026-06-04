export default function LandingPage({ onStart }) {
  return (
    <div className="land">
      <nav className="land-nav">
        <div className="land-logo">Your<span>Clinical</span>Currency</div>
        <span className="land-tag">Turn Your Healthcare Expertise Into Income, Impact, and Opportunity</span>
      </nav>
      <div className="land-hero">
        <div>
          <div className="land-eyebrow">A career intelligence tool for African healthcare professionals</div>
          <h1 className="land-h1">
            Your clinical knowledge<br />
            is worth more than<br />
            <em>your salary suggests.</em>
          </h1>
          <p className="land-body">
            Most Nigerian healthcare professionals are sitting on untapped income potential they have never been shown how to access. Your Clinical Currency changes that — with a personalised, specialty-specific blueprint built from 25 questions about who you are, how you work, and what you want.
          </p>
          <button className="land-cta" onClick={onStart}>
            Discover My Clinical Currency →
          </button>
          <span className="land-cta-note">Free 25-question assessment · Personalised blueprint · Results in under 10 minutes</span>
        </div>
        <div className="land-panel">
          <div className="land-panel-title">Your full paid blueprint covers</div>
          {[
            {n:"01",t:"Your Clinical Edge",d:"The specific, monetisable intersection of your specialty and skills"},
            {n:"02",t:"Your Opportunity Map",d:"Clinical, non-clinical, educational, and digital income paths — including hidden ones"},
            {n:"03",t:"Personality-Fit Income Model",d:"One income architecture matched to how you actually work"},
            {n:"04",t:"Realistic Income Timelines",d:"Honest time-to-income estimates, not optimistic promises"},
            {n:"05",t:"30-Day Roadmap",d:"Week-by-week tasks built around your clinical schedule"},
            {n:"06",t:"Income Trajectory",d:"Conservative and ambitious projections at 3, 6, and 12 months"},
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
        <h2 className="land-how-h">Get Your Blueprint in 3 Simple Steps</h2>
        <div className="land-steps">
          {[
            {n:"1",t:"Take the Free Assessment",d:"Answer 25 questions about your profession, skills, personality, and goals. Takes under 10 minutes."},
            {n:"2",t:"Get Your Free Profile",d:"Instantly see your top income categories, key strength, and biggest blocker — at no cost."},
            {n:"3",t:"Unlock Your Full Blueprint",d:"Pay ₦5,000 to unlock your complete 13-section personalised report with 30-day action plan."},
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
          {icon:"🏥",t:"Your salary was not designed to be enough",d:"Government salaries have not kept pace with Nigerian inflation. Private sector earnings vary wildly. Most healthcare professionals are quietly building alternative income — or trying to."},
          {icon:"🔍",t:"Generic advice does not fit clinical careers",d:"Most income tools suggest freelancing or dropshipping. They do not understand licensing constraints, clinical time pressures, MDCN ethics, or the specific skills that come with a healthcare degree."},
          {icon:"🗺️",t:"Nobody has mapped the full picture for you",d:"From medical virtual assistance to utilisation review, prior authorisation, and health tech operations — there are dozens of income paths most Nigerian healthcare professionals have never heard of."},
        ].map(p => (
          <div key={p.t} className="prob-item">
            <div className="prob-icon">{p.icon}</div>
            <h3>{p.t}</h3>
            <p>{p.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
