import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Trash2, 
  Flame, 
  Coffee, 
  Utensils, 
  ChefHat, 
  Cookie, 
  Camera, 
  Plus, 
  AlertCircle,
  X,
  Info,
  Beef,
  Wheat,
  Pizza,
  CheckCircle2
} from "lucide-react";

import PageShell from "../components/PageShell";
import { getDiary, deleteDiaryEntry } from "../api/diaryClient";
import { getProgressStreaks } from "../api/progressClient";
import "./History.css";

// --- Date Helpers (immune to timezone offset shifts) ---
function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(isoDate, delta) {
  const d = new Date(isoDate + "T00:00:00");
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

function formatDateLabel(isoDate) {
  const today = todayIso();
  const yesterday = addDays(today, -1);
  
  if (isoDate === today) return "Today";
  if (isoDate === yesterday) return "Yesterday";
  
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function getDaysInMonth(year, month) {
  // first day of the month
  const firstDay = new Date(year, month, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 = Sun, ..., 6 = Sat
  
  const days = [];
  
  // Previous month's trailing days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const isoString = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    days.push({
      day,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      isoString
    });
  }
  
  // Current month's days
  const totalDays = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= totalDays; i++) {
    const isoString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      day: i,
      month,
      year,
      isCurrentMonth: true,
      isoString
    });
  }
  
  // Next month's leading days to fill grid (usually 42 elements for 6 rows)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    const isoString = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({
      day: i,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
      isoString
    });
  }
  
  return days;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_COLORS = {
  OnGoal: "#4caf50",
  OverGoal: "#f44336",
  UnderGoal: "#ff9800",
  NoData: "#e0e0e0",
};

// Map meal types to beautiful semantic icons
function getMealIcon(mealType) {
  const type = (mealType || "").toLowerCase();
  if (type.includes("breakfast")) return <Coffee size={12} />;
  if (type.includes("lunch")) return <Utensils size={12} />;
  if (type.includes("dinner")) return <ChefHat size={12} />;
  return <Cookie size={12} />;
}

function getMealClass(mealType) {
  const type = (mealType || "").toLowerCase();
  if (type.includes("breakfast")) return "breakfast";
  if (type.includes("lunch")) return "lunch";
  if (type.includes("dinner")) return "dinner";
  return "snacks";
}

function HistoryPage() {
  const queryClient = useQueryClient();
  
  const [selectedDate, setSelectedDate] = useState(todayIso());
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMealType, setSelectedMealType] = useState("All");
  
  // Expansion state for entry detail cards
  const [expandedEntries, setExpandedEntries] = useState({});
  // Double deletion confirmation state per entry ID
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  
  // Local calendar year and month (used when browsing month pages)
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  
  const [deleteError, setDeleteError] = useState(null);

  const isToday = selectedDate === todayIso();

  // Sync calendar picker focus when active date changes
  useEffect(() => {
    const d = new Date(selectedDate + "T00:00:00");
    setCalendarYear(d.getFullYear());
    setCalendarMonth(d.getMonth());
  }, [selectedDate]);

  // Queries
  const diaryQuery = useQuery({
    queryKey: ["diary", selectedDate],
    queryFn: () => getDiary(selectedDate).then(r => r.data.data),
  });

  const streaksQuery = useQuery({
    queryKey: ["progress-streaks"],
    queryFn: getProgressStreaks,
  });

  // Deletion Mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDiaryEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["diary", selectedDate] });
      queryClient.invalidateQueries({ queryKey: ["diary-today"] });
      queryClient.invalidateQueries({ queryKey: ["progress-streaks"] });
      queryClient.invalidateQueries({ queryKey: ["progress-trends-7"] });
      setConfirmDeleteId(null);
    },
    onError: () => {
      setDeleteError("Failed to delete the log entry. Please try again.");
    }
  });

  // Date Navigation handlers
  function handlePrev() {
    setSelectedDate((d) => addDays(d, -1));
  }

  function handleNext() {
    if (!isToday) {
      setSelectedDate((d) => addDays(d, 1));
    }
  }

  // Calendar Year/Month paging
  function handlePrevMonth() {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(y => y - 1);
    } else {
      setCalendarMonth(m => m - 1);
    }
  }

  function handleNextMonth() {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(y => y + 1);
    } else {
      setCalendarMonth(m => m + 1);
    }
  }

  function toggleExpandEntry(id) {
    setExpandedEntries(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const handleDeleteEntry = async (id, foodName) => {
    setDeleteError(null);
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // Handled in onError callback but catching to prevent unhandled rejection
    }
  };

  // Process details once query finishes
  const diaryData = diaryQuery.data || null;
  const summary = diaryData?.dailySummary || { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 };
  const goals = diaryData?.goals || null;

  // Calorie Ring Calculations
  const consumedCal = Math.round(summary.totalCalories || 0);
  const targetCal = goals?.caloriesTarget || 2000;
  const calPct = Math.min((consumedCal / targetCal) * 100, 100);
  const remainingCal = targetCal - consumedCal;
  const isCalOver = remainingCal < 0;

  // SVG Ring values
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calPct / 100) * circumference;

  // Macro progress bars
  const pConsumed = summary.totalProtein || 0;
  const pTarget = goals?.proteinTarget || 120;
  const pPct = pTarget > 0 ? Math.min((pConsumed / pTarget) * 100, 100) : 0;
  const pOver = pConsumed > pTarget;

  const cConsumed = summary.totalCarbs || 0;
  const cTarget = goals?.carbsTarget || 200;
  const cPct = cTarget > 0 ? Math.min((cConsumed / cTarget) * 100, 100) : 0;
  const cOver = cConsumed > cTarget;

  const fConsumed = summary.totalFat || 0;
  const fTarget = goals?.fatTarget || 70;
  const fPct = fTarget > 0 ? Math.min((fConsumed / fTarget) * 100, 100) : 0;
  const fOver = fConsumed > fTarget;

  // Filter food groups & entries by search and meal pill filters
  const mealGroupsRaw = diaryData?.mealGroups || [];
  const processedMealGroups = mealGroupsRaw
    .map(group => {
      const typeName = group.mealType || group.MealType || "";
      const groupCal = group.groupCalories || group.GroupCalories || 0;
      const entriesList = group.entries || group.Entries || [];
      
      const filteredEntries = entriesList.filter(entry => {
        const name = entry.foodName || entry.FoodName || "";
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedMealType === "All" || typeName.toLowerCase() === selectedMealType.toLowerCase();
        return matchesSearch && matchesType;
      });

      return {
        mealType: typeName,
        groupCalories: groupCal,
        entries: filteredEntries
      };
    })
    .filter(g => g.entries.length > 0);

  // Map heatmap data for calendar streak display
  const heatmapDaysMap = {};
  if (streaksQuery.data?.heatmapDays) {
    streaksQuery.data.heatmapDays.forEach(day => {
      heatmapDaysMap[day.date] = day;
    });
  }

  const calendarDays = getDaysInMonth(calendarYear, calendarMonth);

  return (
    <PageShell
      eyebrow="Tracker"
      title="Nutrition History"
      description="Review and optimize your logged meals day by day."
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Modern Date Navigation Header */}
        <section className="history-nav-card">
          <div className="history-nav-date-group">
            <button
              type="button"
              className="history-nav-date-btn"
              onClick={handlePrev}
              aria-label="Previous day"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="history-nav-label-wrapper">
              <span className="history-nav-label-sub">Meal Log Date</span>
              <span className="history-nav-label">{formatDateLabel(selectedDate)}</span>
            </div>
            <button
              type="button"
              className="history-nav-date-btn"
              onClick={handleNext}
              disabled={isToday}
              aria-label="Next day"
              aria-disabled={isToday}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="history-nav-actions">
            <button
              type="button"
              className={`btn-calendar-toggle${showCalendar ? " btn-calendar-toggle--active" : ""}`}
              onClick={() => setShowCalendar(s => !s)}
              aria-expanded={showCalendar}
            >
              <CalendarIcon size={16} />
              <span>Calendar</span>
            </button>
            {!isToday && (
              <button
                type="button"
                className="button-secondary btn-jump-today"
                onClick={() => setSelectedDate(todayIso())}
              >
                Jump to Today
              </button>
            )}
          </div>
        </section>

        {/* Interactive Month-Grid Calendar Widget */}
        <AnimatePresence>
          {showCalendar && (
            <motion.section
              className="history-calendar-panel"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <div className="calendar-header">
                <span className="calendar-month-title">
                  {MONTH_NAMES[calendarMonth]} {calendarYear}
                </span>
                <div className="calendar-month-nav">
                  <button
                    type="button"
                    className="calendar-month-btn"
                    onClick={handlePrevMonth}
                    aria-label="Previous Month"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    type="button"
                    className="calendar-month-btn"
                    onClick={handleNextMonth}
                    aria-label="Next Month"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              <div className="calendar-grid-weekdays">
                {WEEKDAY_NAMES.map(day => (
                  <span key={day} className="calendar-weekday">{day}</span>
                ))}
              </div>

              <div className="calendar-grid-days">
                {calendarDays.map((cell, idx) => {
                  const isCellSelected = cell.isoString === selectedDate;
                  const isCellToday = cell.isoString === todayIso();
                  const heatmapData = heatmapDaysMap[cell.isoString];
                  
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedDate(cell.isoString);
                        setShowCalendar(false);
                      }}
                      className={`calendar-day-cell${!cell.isCurrentMonth ? " calendar-day-cell--muted" : ""}${isCellSelected ? " calendar-day-cell--selected" : ""}${isCellToday ? " calendar-day-cell--today" : ""}`}
                    >
                      <span>{cell.day}</span>
                      {heatmapData && heatmapData.status !== "NoData" && (
                        <span 
                          className="calendar-day-dot"
                          style={{ backgroundColor: STATUS_COLORS[heatmapData.status] }}
                          title={`${heatmapData.status}: ${heatmapData.totalCalories} kcal`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Global Errors Notification */}
        {deleteError && (
          <div className="alert alert--error" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{deleteError}</span>
            </div>
            <button 
              className="button-inline" 
              onClick={() => setDeleteError(null)} 
              aria-label="Dismiss error"
              style={{ color: 'inherit', padding: '4px' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* --- Loading State --- */}
        {diaryQuery.isLoading && (
          <div className="skeleton-history">
            <div className="skeleton-history-summary">
              <div className="skeleton-history-cal-card" />
              <div className="skeleton-history-macro-card" />
            </div>
            <div className="skeleton-history-timeline-node" />
            <div className="skeleton-history-timeline-node" />
          </div>
        )}

        {/* --- Error State --- */}
        {diaryQuery.isError && (
          <div className="alert alert--error" style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
            <AlertCircle size={32} style={{ margin: '0 auto var(--sp-3) auto', display: 'block' }} />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--sp-2)' }}>Unable to Load Meal History</h3>
            <p style={{ fontSize: 'var(--text-sm)', opacity: 0.8, marginBottom: 'var(--sp-4)' }}>
              We ran into a connection issue. Please check your network and try again.
            </p>
            <button
              type="button"
              className="button-primary"
              onClick={() => diaryQuery.refetch()}
              style={{ minHeight: '38px' }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* --- Successful Data State --- */}
        {diaryQuery.data && !diaryQuery.isLoading && (
          <>
            {/* Visual Summary: Calories Gauge + Macros Progress */}
            <section className="history-summary-grid">
              
              {/* Calories circular gauge card */}
              <div className="history-calorie-card">
                <div className="history-calorie-circle-layout">
                  <svg className="history-calorie-circle-svg" width="110" height="110">
                    <circle
                      className="history-calorie-circle-bg"
                      cx="55"
                      cy="55"
                      r={radius}
                    />
                    <circle
                      className={`history-calorie-circle-fill${isCalOver ? " history-calorie-circle-fill--over" : ""}`}
                      cx="55"
                      cy="55"
                      r={radius}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                    />
                  </svg>
                  <div className="history-calorie-text">
                    <span className="history-calorie-val">{consumedCal}</span>
                    <span className="history-calorie-unit">kcal</span>
                  </div>
                </div>

                <div className="history-calorie-info">
                  <span className="history-calorie-label">Calories</span>
                  <div className="history-calorie-goal">
                    {goals 
                      ? `of ${Math.round(goals.caloriesTarget)} kcal target`
                      : "kcal logged today"
                    }
                  </div>
                  {goals && (
                    <div className={`history-calorie-remaining-pill ${isCalOver ? "history-calorie-remaining-pill--over" : "history-calorie-remaining-pill--ok"}`}>
                      {isCalOver 
                        ? `+${Math.abs(remainingCal)} kcal over`
                        : `${remainingCal} kcal left`
                      }
                    </div>
                  )}
                </div>
              </div>

              {/* Macros linear progress card */}
              <div className="history-macros-card">
                
                {/* Protein */}
                <div className="history-macro-row">
                  <div className="history-macro-label-row">
                    <span className="history-macro-name">
                      <span className="history-macro-icon history-macro-icon--protein">
                        <Beef size={10} />
                      </span>
                      Protein
                    </span>
                    <span className="history-macro-val">
                      {Math.round(pConsumed)}g / {goals ? `${pTarget}g` : "--"}
                    </span>
                  </div>
                  <div className="history-macro-track">
                    <div 
                      className={`history-macro-fill history-macro-fill--protein${pOver ? " history-macro-fill--over" : ""}`}
                      style={{ width: `${goals ? pPct : 0}%` }}
                    />
                  </div>
                </div>

                {/* Carbs */}
                <div className="history-macro-row">
                  <div className="history-macro-label-row">
                    <span className="history-macro-name">
                      <span className="history-macro-icon history-macro-icon--carbs">
                        <Wheat size={10} />
                      </span>
                      Carbohydrates
                    </span>
                    <span className="history-macro-val">
                      {Math.round(cConsumed)}g / {goals ? `${cTarget}g` : "--"}
                    </span>
                  </div>
                  <div className="history-macro-track">
                    <div 
                      className={`history-macro-fill history-macro-fill--carbs${cOver ? " history-macro-fill--over" : ""}`}
                      style={{ width: `${goals ? cPct : 0}%` }}
                    />
                  </div>
                </div>

                {/* Fats */}
                <div className="history-macro-row">
                  <div className="history-macro-label-row">
                    <span className="history-macro-name">
                      <span className="history-macro-icon history-macro-icon--fat">
                        <Flame size={10} />
                      </span>
                      Fats
                    </span>
                    <span className="history-macro-val">
                      {Math.round(fConsumed)}g / {goals ? `${fTarget}g` : "--"}
                    </span>
                  </div>
                  <div className="history-macro-track">
                    <div 
                      className={`history-macro-fill history-macro-fill--fat${fOver ? " history-macro-fill--over" : ""}`}
                      style={{ width: `${goals ? fPct : 0}%` }}
                    />
                  </div>
                </div>

              </div>
            </section>

            {/* Searching and Category Filtering Panel */}
            <section className="history-filter-panel">
              <div className="history-search-wrapper">
                <Search size={15} className="history-search-icon" />
                <input
                  type="text"
                  className="history-search-input"
                  placeholder="Search logged foods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search logged foods"
                />
              </div>

              <div className="history-filter-pills">
                {["All", "Breakfast", "Lunch", "Dinner", "Snacks"].map(pill => (
                  <button
                    key={pill}
                    type="button"
                    className={`history-filter-pill${selectedMealType === pill ? " history-filter-pill--active" : ""}`}
                    onClick={() => setSelectedMealType(pill)}
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </section>

            {/* Empty State vs Timeline Logs Grid */}
            {processedMealGroups.length === 0 ? (
              <div className="history-empty-card">
                <div className="history-empty-icon-wrapper">
                  {searchQuery || selectedMealType !== "All" ? (
                    <Search size={28} />
                  ) : (
                    <Pizza size={28} />
                  )}
                </div>
                <h3 className="history-empty-title">
                  {searchQuery || selectedMealType !== "All" 
                    ? "No matches found" 
                    : "Your food log is empty"
                  }
                </h3>
                <p className="history-empty-desc">
                  {searchQuery || selectedMealType !== "All" 
                    ? "Try adjusting your search terms or selecting a different meal filter."
                    : `You haven't logged any meals for ${formatDateLabel(selectedDate)} yet. Start tracking to hit your fitness objectives.`
                  }
                </p>
                
                {!(searchQuery || selectedMealType !== "All") && (
                  <div className="history-empty-actions">
                    <Link to="/scan" className="button-primary btn-empty-scan">
                      <Camera size={16} />
                      <span>Scan Plate with AI</span>
                    </Link>
                    <Link to="/log" className="button-secondary btn-empty-manual">
                      <Plus size={16} />
                      <span>Log Food Manually</span>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="history-timeline">
                {processedMealGroups.map((group, gIdx) => {
                  const mealClass = getMealClass(group.mealType);
                  return (
                    <div key={group.mealType} className="history-timeline-node">
                      
                      {/* Timeline Meal Type Icon Badge */}
                      <span className={`history-timeline-marker history-timeline-marker--${mealClass}`}>
                        {getMealIcon(group.mealType)}
                      </span>

                      {/* Timeline Meal Group details */}
                      <div className="history-meal-group-header">
                        <h3 className="history-meal-group-title">{group.mealType}</h3>
                        <span className="history-meal-group-calories">{Math.round(group.groupCalories)} kcal</span>
                      </div>

                      {/* Entries under this meal group */}
                      <div className="history-entries-list">
                        {group.entries.map((entry) => {
                          const entryId = entry.id || entry.Id;
                          const foodName = entry.foodName || entry.FoodName || "";
                          const calories = entry.calories || entry.Calories || 0;
                          const protein = entry.protein || entry.Protein || 0;
                          const carbs = entry.carbs || entry.Carbs || 0;
                          const fat = entry.fat || entry.Fat || 0;
                          const servingGrams = entry.servingSizeGrams || entry.ServingSizeGrams || null;
                          
                          const isExpanded = !!expandedEntries[entryId];
                          const isDeleting = deleteMutation.isPending && deleteMutation.variables === entryId;
                          const isConfirmingDelete = confirmDeleteId === entryId;

                          // Macro contribution percentages
                          const totalMacroGrams = protein + carbs + fat;
                          const pPctContrib = totalMacroGrams > 0 ? Math.round((protein / totalMacroGrams) * 100) : 0;
                          const cPctContrib = totalMacroGrams > 0 ? Math.round((carbs / totalMacroGrams) * 100) : 0;
                          const fPctContrib = totalMacroGrams > 0 ? Math.round((fat / totalMacroGrams) * 100) : 0;

                          return (
                            <article 
                              key={entryId} 
                              className="history-entry-card"
                            >
                              
                              {/* Summary View (Header) */}
                              <div 
                                className="history-entry-header"
                                onClick={() => toggleExpandEntry(entryId)}
                              >
                                <div className="history-entry-main-info">
                                  <h4 className="history-entry-title">{foodName}</h4>
                                  <div className="history-entry-meta">
                                    {servingGrams && (
                                      <span className="history-entry-serving">{Math.round(servingGrams)}g</span>
                                    )}
                                    <span className="history-entry-macro-summary">
                                      P {Math.round(protein)}g · C {Math.round(carbs)}g · F {Math.round(fat)}g
                                    </span>
                                  </div>
                                </div>
                                <div className="history-entry-right-info">
                                  <span className="history-entry-calories">{Math.round(calories)} kcal</span>
                                  <ChevronRight 
                                    size={16} 
                                    className={`history-entry-chevron${isExpanded ? " history-entry-chevron--expanded" : ""}`}
                                  />
                                </div>
                              </div>

                              {/* Expandable detailed content */}
                              <AnimatePresence initial={false}>
                                {isExpanded && (
                                  <motion.div
                                    className="history-entry-expanded"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <div className="history-entry-macro-details">
                                      
                                      {/* Protein badge */}
                                      <div className="history-entry-macro-badge">
                                        <span className="history-entry-macro-badge-label">Protein</span>
                                        <span className="history-entry-macro-badge-val">{Math.round(protein)}g</span>
                                        <span className="history-entry-macro-badge-pct history-entry-macro-badge-pct--protein">
                                          {pPctContrib}% cal
                                        </span>
                                      </div>

                                      {/* Carbs badge */}
                                      <div className="history-entry-macro-badge">
                                        <span className="history-entry-macro-badge-label">Carbs</span>
                                        <span className="history-entry-macro-badge-val">{Math.round(carbs)}g</span>
                                        <span className="history-entry-macro-badge-pct history-entry-macro-badge-pct--carbs">
                                          {cPctContrib}% cal
                                        </span>
                                      </div>

                                      {/* Fat badge */}
                                      <div className="history-entry-macro-badge">
                                        <span className="history-entry-macro-badge-label">Fat</span>
                                        <span className="history-entry-macro-badge-val">{Math.round(fat)}g</span>
                                        <span className="history-entry-macro-badge-pct history-entry-macro-badge-pct--fat">
                                          {fPctContrib}% cal
                                        </span>
                                      </div>

                                    </div>

                                    {/* Action items panel with double confirm deletion */}
                                    <div className="history-entry-actions">
                                      {isConfirmingDelete ? (
                                        <div className="history-entry-delete-confirm">
                                          <span>Delete this log?</span>
                                          <button
                                            type="button"
                                            className="btn-confirm-yes"
                                            onClick={() => handleDeleteEntry(entryId, foodName)}
                                            disabled={isDeleting}
                                          >
                                            {isDeleting ? "Deleting..." : "Yes"}
                                          </button>
                                          <button
                                            type="button"
                                            className="btn-confirm-no"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setConfirmDeleteId(null);
                                            }}
                                            disabled={isDeleting}
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          className="btn-entry-delete"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmDeleteId(entryId);
                                          }}
                                          title="Remove Entry"
                                          disabled={isDeleting}
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                            </article>
                          );
                        })}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

      </div>
    </PageShell>
  );
}

export default HistoryPage;
