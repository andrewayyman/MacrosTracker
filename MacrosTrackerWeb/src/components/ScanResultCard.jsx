function MacroCell({ label, value }) {
  return (
    <div className="macro-cell">
      <div className="macro-cell__value">{Math.round(value ?? 0)}g</div>
      <div className="macro-cell__label">{label}</div>
    </div>
  );
}

function ScanResultCard({ result, onLog, onDismiss, onSearchManually }) {
  const isVerified = result.resultSource === "Verified";
  const isLowConfidence = !isVerified && (result.confidencePercent ?? 100) < 40;

  return (
    <div className="scan-result">
      <div style={{ marginBottom: "var(--sp-2)" }}>
        <h2 className="scan-result__name">{result.foodName}</h2>
        <span className={isVerified ? "badge badge--verified" : "badge badge--ai"}>
          {isVerified
            ? "Verified local data"
            : `AI estimate · ${result.confidencePercent ?? "?"}% confidence`}
        </span>
      </div>

      <div className="scan-result__cal-label">Calories</div>
      <div className="scan-result__cal-value">{Math.round(result.calories)}</div>
      <div className="scan-result__cal-unit">kcal</div>

      <div className="macro-grid">
        <MacroCell label="Protein" value={result.protein} />
        <MacroCell label="Carbs"   value={result.carbs} />
        <MacroCell label="Fat"     value={result.fat} />
      </div>

      {result.servingSizeGrams != null && (
        <p className="scan-result__notes">Serving size: ~{result.servingSizeGrams}g</p>
      )}

      {result.notes && (
        <p className="scan-result__notes">{result.notes}</p>
      )}

      {isLowConfidence && (
        <div className="alert alert--warning" style={{ marginTop: "var(--sp-3)" }}>
          Low confidence result — consider{" "}
          <button type="button" className="link-btn" onClick={onSearchManually}>
            searching manually instead
          </button>
        </div>
      )}

      <div className="scan-result__actions">
        <button type="button" className="button-primary" onClick={onLog}>Log this meal</button>
        <button type="button" className="button-secondary" onClick={onDismiss}>Dismiss</button>
      </div>
    </div>
  );
}

export default ScanResultCard;
