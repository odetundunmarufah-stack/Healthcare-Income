export default function LoadingScreen() {
  return (
    <div className="load-wrap">
      <div className="load-logo">Healthcare Income Navigator</div>
      <div className="load-ring" />
      <h2 className="load-h">Analysing your profile across 28 data points...</h2>
      <p className="load-p">
        Cross-referencing your specialty, location, skills, personality, goals, and mindset to build a plan specific to your clinical career.
      </p>
      <div className="load-steps">
        {[
          "Mapping your clinical knowledge to income categories",
          "Filtering by your personality and visibility preference",
          "Calibrating to your available hours and location",
          "Identifying hidden opportunities for your specialty",
          "Building your 30-day implementation roadmap",
        ].map((s, i) => (
          <div key={i} className="load-step">
            <div className="load-dot" style={{ animationDelay: `${i * 0.3}s` }} />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
