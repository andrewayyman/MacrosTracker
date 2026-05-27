function MacroProgressBar({ label, consumed, goal, unit = "g" }) {
  if (!goal || goal === 0) {
    return (
      <div className="macro-bar">
        <div className="macro-bar__header">
          <span className="macro-bar__label">{label}</span>
          <span className="macro-bar__values">No goal set</span>
        </div>
      </div>
    );
  }

  const isOver = consumed > goal;
  const fillPct = Math.min(consumed / goal, 1) * 100;
  const diff = isOver ? consumed - goal : goal - consumed;

  return (
    <div className="macro-bar">
      <div className="macro-bar__header">
        <span className="macro-bar__label">{label}</span>
        <span className="macro-bar__values">
          {consumed} / {goal} {unit}
        </span>
      </div>
      <div className="macro-bar__track">
        <div
          className={`macro-bar__fill${isOver ? " macro-bar__fill--over" : ""}`}
          style={{ width: `${fillPct}%` }}
        />
      </div>
      <div className={`macro-bar__status${isOver ? " macro-bar__status--over" : ""}`}>
        {isOver
          ? `${diff} ${unit} over`
          : `${diff} ${unit} remaining`}
      </div>
    </div>
  );
}

export default MacroProgressBar;
