import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import DayNavigator from "../components/DayNavigator";
import DailySummary from "../components/DailySummary";
import MealGroup from "../components/MealGroup";
import { getDiary, deleteDiaryEntry } from "../api/diaryClient";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(isoDate, delta) {
  const d = new Date(isoDate + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [diaryData, setDiaryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const isToday = selectedDate === todayIso();

  async function fetchDiary(date) {
    setIsLoading(true);
    setFetchError(null);
    setDiaryData(null);
    try {
      const res = await getDiary(date);
      setDiaryData(res.data.data);
    } catch {
      setFetchError("Failed to load diary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchDiary(selectedDate);
  }, [selectedDate]);

  function handlePrev() {
    setSelectedDate((d) => addDays(d, -1));
  }

  function handleNext() {
    if (!isToday) {
      setSelectedDate((d) => addDays(d, 1));
    }
  }

  async function handleDeleteEntry(id, foodName) {
    if (!window.confirm(`Remove "${foodName}" from your diary?`)) return;

    setDeletingId(id);
    setDeleteError(null);
    try {
      await deleteDiaryEntry(id);
      await fetchDiary(selectedDate);
    } catch {
      setDeleteError("Failed to remove entry. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <PageShell
      eyebrow="Diary"
      title="Meal History"
      description="Review your logged meals by day."
    >
      <DayNavigator
        date={selectedDate}
        onPrev={handlePrev}
        onNext={handleNext}
        isToday={isToday}
      />

      {deleteError && (
        <div className="alert alert--error">{deleteError}</div>
      )}

      {isLoading && <div className="spinner spinner--lg" />}

      {!isLoading && fetchError && (
        <div className="alert alert--error">
          {fetchError}
          <div style={{ marginTop: "var(--sp-3)" }}>
            <button
              type="button"
              className="button-secondary"
              onClick={() => fetchDiary(selectedDate)}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && !fetchError && diaryData && (
        <>
          <DailySummary summary={diaryData.dailySummary} goals={diaryData.goals} />

          {diaryData.mealGroups.length === 0 ? (
            <div className="empty-state">
              <p>No meals logged for {formatDateLabel(selectedDate)} yet.</p>
              <Link to="/scan" className="button-secondary">Scan a meal</Link>
            </div>
          ) : (
            diaryData.mealGroups.map((group) => (
              <MealGroup
                key={group.mealType}
                group={group}
                onDeleteEntry={handleDeleteEntry}
                deletingId={deletingId}
              />
            ))
          )}
        </>
      )}
    </PageShell>
  );
}

export default HistoryPage;
