const card = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 22,
  padding: 28,
};

const macroGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 12,
  margin: "20px 0",
};

const macroCell = {
  background: "rgba(255,255,255,0.06)",
  borderRadius: 14,
  padding: "14px 10px",
  textAlign: "center",
};

const verifiedBadge = {
  display: "inline-block",
  padding: "3px 12px",
  borderRadius: 999,
  fontSize: "0.8rem",
  fontWeight: 600,
  background: "rgba(134,239,172,0.15)",
  color: "#86efac",
  border: "1px solid rgba(134,239,172,0.3)",
};

const aiBadge = {
  display: "inline-block",
  padding: "3px 12px",
  borderRadius: 999,
  fontSize: "0.8rem",
  fontWeight: 600,
  background: "rgba(246,197,103,0.15)",
  color: "#f6c567",
  border: "1px solid rgba(246,197,103,0.3)",
};

const warningBox = {
  marginTop: 14,
  padding: "12px 16px",
  borderRadius: 12,
  background: "rgba(253,164,175,0.1)",
  border: "1px solid rgba(253,164,175,0.25)",
  color: "#fda4af",
  fontSize: "0.9rem",
};

const linkButton = {
  background: "none",
  border: "none",
  padding: 0,
  color: "#f6c567",
  cursor: "pointer",
  textDecoration: "underline",
  font: "inherit",
  fontSize: "0.9rem",
};

const muted = { color: "rgba(247,244,236,0.65)", fontSize: "0.9rem", margin: "4px 0 0" };

function MacroCell({ label, value }) {
  return (
    <div style={macroCell}>
      <div style={{ fontSize: "1.25rem", fontWeight: 700 }}>{Math.round(value ?? 0)}g</div>
      <div style={{ fontSize: "0.75rem", color: "rgba(247,244,236,0.6)", marginTop: 3 }}>{label}</div>
    </div>
  );
}

function ScanResultCard({ result, onLog, onDismiss, onSearchManually }) {
  const isVerified = result.resultSource === "Verified";
  const isLowConfidence = !isVerified && (result.confidencePercent ?? 100) < 40;

  return (
    <div style={card}>
      <div style={{ marginBottom: 10 }}>
        <h2 style={{ margin: "0 0 8px", fontSize: "1.5rem" }}>{result.foodName}</h2>
        <span style={isVerified ? verifiedBadge : aiBadge}>
          {isVerified
            ? "Verified local data"
            : `AI estimate · ${result.confidencePercent ?? "?"}% confidence`}
        </span>
      </div>

      <div style={{ margin: "18px 0 4px" }}>
        <div style={{ fontSize: "0.75rem", color: "rgba(247,244,236,0.55)", textTransform: "uppercase", letterSpacing: "0.12em" }}>
          Calories
        </div>
        <div style={{ fontSize: "2.8rem", fontWeight: 700, lineHeight: 1, color: "#f6c567" }}>
          {Math.round(result.calories)}
        </div>
        <div style={{ fontSize: "0.8rem", color: "rgba(247,244,236,0.55)" }}>kcal</div>
      </div>

      <div style={macroGrid}>
        <MacroCell label="Protein" value={result.protein} />
        <MacroCell label="Carbs" value={result.carbs} />
        <MacroCell label="Fat" value={result.fat} />
      </div>

      {result.servingSizeGrams != null && (
        <p style={muted}>Serving size: ~{result.servingSizeGrams}g</p>
      )}

      {result.notes && <p style={muted}>{result.notes}</p>}

      {isLowConfidence && (
        <div style={warningBox}>
          Low confidence result — consider{" "}
          <button type="button" style={linkButton} onClick={onSearchManually}>
            searching manually instead
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 22, flexWrap: "wrap" }}>
        <button type="button" className="button-primary" onClick={onLog}>
          Log this meal
        </button>
        <button type="button" className="button-secondary" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default ScanResultCard;
