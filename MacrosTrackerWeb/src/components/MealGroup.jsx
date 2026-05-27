function MealGroup({ group, onDeleteEntry, deletingId }) {
  return (
    <div className="meal-group">
      <div className="meal-group__header">
        <h3 className="meal-group__type">{group.mealType}</h3>
        <span className="meal-group__calories">{Math.round(group.groupCalories)} kcal</span>
      </div>

      {group.entries.map((entry) => {
        const isDeleting = deletingId === entry.id;

        return (
          <div key={entry.id} className="meal-entry">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="meal-entry__name">{entry.foodName}</div>
              <div className="meal-entry__macros">
                {Math.round(entry.calories)} kcal · P {Math.round(entry.protein)}g · C {Math.round(entry.carbs)}g · F {Math.round(entry.fat)}g
                {entry.servingSizeGrams != null && <> · {entry.servingSizeGrams}g</>}
              </div>
            </div>
            <button
              type="button"
              className="btn--danger"
              disabled={isDeleting}
              onClick={() => onDeleteEntry(entry.id, entry.foodName)}
            >
              {isDeleting ? "…" : "Remove"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default MealGroup;
