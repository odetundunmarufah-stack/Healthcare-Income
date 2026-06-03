import { STEPS } from "../data/steps";
import { getRatingDesc } from "../utils/getRatingDesc";

const OTHER_OPTION = "Other — please describe below";

export default function QuizStep({
  step,
  answers,
  multiSel,
  textVal,
  rating,
  hover,
  error,
  canProceed,
  otherText,
  onSingle,
  onToggleMulti,
  onTextChange,
  onOtherText,
  onRating,
  onHover,
  onHoverLeave,
  onNext,
  onBack,
  userName,
}) {
  const cur = STEPS[step];
  const pct = Math.round(((step + 1) / STEPS.length) * 100);
  const prevStep = step > 0 ? STEPS[step - 1] : null;
  const sectionChanged = !prevStep || prevStep.section !== cur.section;

  const singleOtherSelected = cur.type === "single" && answers[cur.id] === OTHER_OPTION;
  const multiOtherSelected = cur.type === "multi" && multiSel.includes(OTHER_OPTION);
  const showOtherBox = (singleOtherSelected || multiOtherSelected) && cur.hasOther;

  return (
    <div className="quiz-shell">
      <div className="quiz-topbar">
        {sectionChanged && (
          <div className="quiz-sec-strip">
            Section {cur.sectionNum} of {cur.totalSections} — {cur.section}
          </div>
        )}
        <div className="quiz-prog-row">
          <div className="quiz-track">
            <div className="quiz-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="quiz-pct">{step + 1} / {STEPS.length}</span>
        </div>
      </div>

      <div className="quiz-card">
        <div className="q-badge">
          {cur.type === "single" && "Choose one"}
          {cur.type === "multi" && "Select all that apply"}
          {cur.type === "text" && "Your answer"}
          {cur.type === "rating" && "Rate yourself — 1 to 10"}
        </div>
        <h2 className="q-title">
          {userName && cur.sectionNum === 1 && step === 0
            ? `${userName}, ${cur.question.charAt(0).toLowerCase()}${cur.question.slice(1)}`
            : cur.question}
        </h2>
        {cur.hint && <p className="q-hint">{cur.hint}</p>}

        {cur.type === "single" && (
          <div className="opts">
            {cur.options.map(o => (
              <button
                key={o}
                className={`opt${answers[cur.id] === o ? " sel" : ""}`}
                onClick={() => onSingle(o)}
              >
                <span className="opt-ind">
                  {answers[cur.id] === o && <span className="opt-dot" />}
                </span>
                {o}
              </button>
            ))}
            {cur.hasOther && (
              <button
                className={`opt${answers[cur.id] === OTHER_OPTION ? " sel" : ""}`}
                onClick={() => onSingle(OTHER_OPTION)}
              >
                <span className="opt-ind">
                  {answers[cur.id] === OTHER_OPTION && <span className="opt-dot" />}
                </span>
                {OTHER_OPTION}
              </button>
            )}
          </div>
        )}

        {cur.type === "multi" && (
          <>
            <div className="opts">
              {cur.options.map(o => (
                <button
                  key={o}
                  className={`opt${multiSel.includes(o) ? " sel" : ""}`}
                  onClick={() => onToggleMulti(o)}
                >
                  <span className="opt-ind opt-box">{multiSel.includes(o) ? "✓" : ""}</span>
                  {o}
                </button>
              ))}
              {cur.hasOther && (
                <button
                  className={`opt${multiSel.includes(OTHER_OPTION) ? " sel" : ""}`}
                  onClick={() => onToggleMulti(OTHER_OPTION)}
                >
                  <span className="opt-ind opt-box">{multiSel.includes(OTHER_OPTION) ? "✓" : ""}</span>
                  {OTHER_OPTION}
                </button>
              )}
            </div>
            {multiSel.length > 0 && (
              <p className="sel-count">{multiSel.length} selected</p>
            )}
          </>
        )}

        {showOtherBox && (
          <textarea
            className="q-ta q-ta-other"
            placeholder="Please describe your answer here..."
            value={otherText}
            onChange={e => onOtherText(e.target.value)}
            style={{ marginTop: 10 }}
          />
        )}

        {cur.type === "text" && (
          <textarea
            className="q-ta"
            placeholder={cur.placeholder}
            value={textVal}
            onChange={e => onTextChange(e.target.value)}
          />
        )}

        {cur.type === "rating" && (
          <div className="rating-area">
            <div className="rating-nums">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                <button
                  key={n}
                  className={`rn${(hover || rating) >= n ? " lit" : ""}${rating === n ? " picked" : ""}`}
                  onClick={() => onRating(n)}
                  onMouseEnter={() => onHover(n)}
                  onMouseLeave={onHoverLeave}
                >
                  {n}
                </button>
              ))}
            </div>
            {cur.ratingLabels && (
              <div className="r-labels">
                <span>{cur.ratingLabels[0]}</span>
                <span>{cur.ratingLabels[1]}</span>
              </div>
            )}
            <div className="r-desc">{getRatingDesc(cur, rating)}</div>
          </div>
        )}

        {error && (
          <p style={{ color: "#b83232", fontSize: 13, marginTop: 12, fontWeight: 500 }}>
            {error}
          </p>
        )}

        <div className="q-actions">
          {step > 0 && (
            <button className="q-back" onClick={onBack}>← Back</button>
          )}
          <button className="q-next" onClick={onNext} disabled={!canProceed}>
            {step < STEPS.length - 1 ? "Continue →" : "Generate My Navigator →"}
          </button>
        </div>
      </div>
    </div>
  );
}
