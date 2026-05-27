function formatDate(isoDate) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  if (isoDate === todayStr) return "Today";
  if (isoDate === yesterdayStr) return "Yesterday";

  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function DayNavigator({ date, onPrev, onNext, isToday }) {
  return (
    <div className="day-nav">
      <button type="button" className="day-nav__btn" onClick={onPrev} aria-label="Previous day">
        ‹
      </button>
      <span className="day-nav__label">{formatDate(date)}</span>
      <button
        type="button"
        className="day-nav__btn"
        onClick={isToday ? undefined : onNext}
        disabled={isToday}
        aria-label="Next day"
        aria-disabled={isToday}
      >
        ›
      </button>
    </div>
  );
}

export default DayNavigator;
