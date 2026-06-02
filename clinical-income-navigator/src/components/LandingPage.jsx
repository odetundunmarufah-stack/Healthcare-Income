export default function LandingPage({ onStart }) {
  return (
    <div className="land">
      <nav className="land-nav">
        <div className="land-logo">Healthcare<span>Income</span> Navigator</div>
        <span className="land-tag">For African Healthcare Professionals</span>
      </nav>
      <div className="land-hero">
        <div>
          <div className="land-eyebrow">A career intelligence tool</div>
          <h1 className="land-h1">
            Discover ethical, realistic<br />
            income paths built<br />
            for <em>your profession.</em>
          </h1>
          <p className="land-body">
            Helping Nigerian and African healthcare professionals find the fastest, most suitable paths to additional income, remote work, digital products, and scalable healthcare businesses — based on their actual specialty, personality, and schedule.
          </p>
          <button className="land-cta" onClick={onStart}>
            Build My Income Navigator →
          </button>
          <span className="land-cta-note">28 questions · 10 minutes · Fully personalised to your profession and goals</span>
        </div>
        <div className="land-panel">
          <div className="land-panel-title">What your report covers</div>
          {[
            {n:"01",t:"Your Clinical Edge",d:"The specific, monetisable intersection of your specialty and skills"},
            {n:"02",t:"Your Opportunity Map",d:"Clinical, non-clinical, educational, and digital income paths — including hidden ones"},
            {n:"03",t:"Personality-Fit Model",d:"One income architecture matched to how you actually work"},
            {n:"04",t:"Realistic Timelines",d:"Honest time-to-income estimates, not optimistic promises"},
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
      <div className="land-problem">
        {[
          {icon:"🏥",t:"Your salary was not designed to be enough",d:"Government salaries have not kept pace with Nigerian inflation. Private sector earnings vary wildly. Most healthcare professionals are quietly building alternative income — or trying to."},
          {icon:"🔍",t:"Generic advice does not fit clinical careers",d:"Most income tools suggest freelancing or dropshipping. They do not understand licensing constraints, clinical time pressures, MDCN ethics, or the specific skills that come with a healthcare degree."},
          {icon:"🗺️",t:"Nobody has mapped the full picture",d:"From medical virtual assistance to utilisation review, prior authorisation, and health tech operations — there are dozens of income paths most Nigerian healthcare professionals have never heard of."},
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
