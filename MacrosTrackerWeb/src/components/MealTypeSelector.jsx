const MEAL_TYPES = [
  { value: 1, label: "Breakfast" },
  { value: 2, label: "Lunch" },
  { value: 3, label: "Dinner" },
  { value: 4, label: "Snack" },
];

function MealTypeSelector({ selected, onSelect }) {
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {MEAL_TYPES.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          className={selected === value ? "button-primary" : "button-secondary"}
          style={{ fontSize: "0.9rem", minHeight: 40, padding: "0 16px" }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default MealTypeSelector;
