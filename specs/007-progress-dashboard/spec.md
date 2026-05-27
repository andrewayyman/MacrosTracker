# Feature Specification: Progress Dashboard & Goal Achievement

**Feature Branch**: `007-progress-dashboard`

**Created**: 2026-05-27

**Status**: Draft

**Input**: User description: "Progress Dashboard — charts and trends showing daily/weekly/monthly calories and macros vs. goals, plus the end-to-end cycle from setting a goal to tracking it until it is achieved."

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Today's Nutrition Progress at a Glance (Priority: P1)

A user opens the Progress Dashboard and immediately sees how they are doing today. Visual progress bars show calories consumed vs. the daily calorie goal, and separate bars show progress for protein, carbohydrates, and fat. Each bar displays the logged amount, the goal, and the remaining budget (or the overage if exceeded). The user can instantly tell whether they are on track, under target, or over target without doing any arithmetic.

**Why this priority**: This is the core daily feedback loop that connects all prior logging work (Specs 004–006) to the user's stated goals (Spec 003). Without it, users have no way to see whether their logging activity is keeping them on track. It is the most frequently visited view in any nutrition tracking app.

**Independent Test**: A user with at least one logged food entry for today and at least one nutrition goal set can open the Progress Dashboard and see today's calorie and macro totals alongside their goals in visual progress indicators.

**Acceptance Scenarios**:

1. **Given** a user has nutrition goals set and has logged at least one food today, **When** they open the Progress Dashboard, **Then** they see progress bars for calories, protein, carbohydrates, and fat — each showing amount consumed, goal amount, and remaining/overage.
2. **Given** a user is on the Progress Dashboard, **When** their macros are under goal, **Then** the progress bars appear in a neutral/positive colour and show remaining budget.
3. **Given** a user is on the Progress Dashboard, **When** a macro exceeds its goal, **Then** the corresponding bar changes to an over-budget visual state and shows the overage amount.
4. **Given** a user has not logged any food today, **When** they open the Progress Dashboard, **Then** all bars show zero consumed with the goal targets visible, and an empty-state prompt suggests starting to log.
5. **Given** a user has no nutrition goals set, **When** they open the Progress Dashboard, **Then** a prompt is shown explaining that goals are needed and linking to the goal-setting screen (Spec 003).
6. **Given** a user is not authenticated, **When** they attempt to access the Progress Dashboard, **Then** they are redirected to the login screen.

---

### User Story 2 — Track Historical Trends Over Time (Priority: P2)

A user wants to understand their eating patterns over time, not just today. They switch to a trend view and see line or bar charts for daily calorie intake and per-macro intake over the past 7, 30, or 90 days. A goal reference line runs across each chart so they can see visually which days they were under, on target, or over. They can switch between time ranges with a single tap.

**Why this priority**: Single-day feedback (P1) tells a user where they are now; trend data tells them whether their habits are consistent. Identifying patterns — such as consistently over on carbs on weekends — enables behavioural change. This is the second most-used view in nutrition apps after the daily summary.

**Independent Test**: A user who has logged food on at least 3 distinct days can view a chart showing per-day calorie intake vs. their calorie goal for those days.

**Acceptance Scenarios**:

1. **Given** a user has logged food on at least one past day, **When** they open the trend view, **Then** charts appear showing daily calorie intake for the selected period, with the calorie goal shown as a reference line.
2. **Given** a user is viewing the trend view, **When** they select a different time range (7, 30, or 90 days), **Then** the charts update to reflect only data within that range.
3. **Given** a user selects a time range where no data exists, **When** the chart is rendered, **Then** an empty-state message is shown for that period rather than a blank or broken chart.
4. **Given** a user views the chart for a specific macro, **When** they look at any single day bar or point, **Then** the value displayed matches the corresponding daily log total for that day.

---

### User Story 3 — See Goal Consistency and Streaks (Priority: P3)

A user wants to know how consistently they are hitting their daily goals. The dashboard shows a "goal streak" — the number of consecutive days they stayed within their calorie goal — and a "goal hit rate" — the percentage of days in the last 30 days where the calorie goal was met. A compact calendar heatmap for the past 30 days colour-codes each day as on-goal, over, under, or unlogged, so the user can spot patterns at a glance.

**Why this priority**: Consistency metrics and streaks create a habit-forming feedback loop that motivates users to keep logging and staying on target. They close the "end-to-end goal cycle" — a user who sets a goal, logs consistently, and sees their streak grow has completed the full intended journey of the app.

**Independent Test**: A user who has logged food on at least 3 consecutive days within their calorie goal can see a streak counter showing 3 or more, and a calendar heatmap showing those days highlighted as on-goal.

**Acceptance Scenarios**:

1. **Given** a user has logged food and stayed within their calorie goal on consecutive days, **When** they view the Goal Consistency section, **Then** their current streak count is shown and equals the number of consecutive on-goal days ending today (or the most recent logged day).
2. **Given** a user breaks their streak by exceeding their calorie goal on a day, **When** they view the Goal Consistency section, **Then** the streak resets to zero (or the count since the last break) and the broken-streak day is visible in the heatmap.
3. **Given** a user has 30 days of logged data, **When** they view the Goal Consistency section, **Then** the goal hit rate shows the correct percentage of on-goal days out of all days with log entries in that period.
4. **Given** a user views the 30-day heatmap, **When** they look at a specific day, **Then** the day is colour-coded correctly: on-goal (green), over-goal (red), under-goal (amber), or no data (grey).
5. **Given** a user has no prior log data, **When** they view the Goal Consistency section, **Then** an empty state is shown with an encouraging message to start logging to build a streak.

---

### User Story 4 — Weekly Summary Snapshot (Priority: P4)

A user wants a quick week-at-a-glance view. The weekly summary shows a table or card layout for the current week (Monday through Sunday) with each day's logged calories, goal, and a pass/fail indicator. A weekly aggregate row at the bottom shows total calories for the week vs. the weekly calorie budget (7× daily goal). The user can navigate backward to view previous weeks.

**Why this priority**: Weekly summaries help users who slightly overshoot one day compensate on another. It is a natural reporting cadence for fitness tracking and supports a more flexible approach to goal adherence.

**Independent Test**: A user with at least one logged day in the current week can view a weekly summary showing each logged day's total alongside the daily calorie goal.

**Acceptance Scenarios**:

1. **Given** a user opens the Weekly Summary view, **When** the page loads, **Then** they see the current Monday-to-Sunday week with each day's logged calorie total and the daily calorie goal displayed per row.
2. **Given** a user is viewing the Weekly Summary, **When** they tap the back arrow, **Then** they navigate to the previous week, and the data updates to show that week's history.
3. **Given** a week has days with no logged data, **When** those days appear in the summary, **Then** they are shown as "No data" rather than zero, and they do not skew the weekly aggregate.
4. **Given** a user views the weekly aggregate row, **When** they check the total, **Then** it equals the arithmetic sum of all days in that week that have logged data.

---

### Edge Cases

- What if a user changes their nutrition goals mid-period? Historical trend charts and streaks use the goal that was active at the time each day was logged, not the current goal. If goal history is unavailable, the current goal is used for all historical comparisons and this is noted with a tooltip.
- What if a user has no nutrition goals set when they open the dashboard? All goal-comparison views (progress bars, trend reference lines, streak) are replaced with a prompt to set goals first; no broken or zero-based charts are displayed.
- What if the user has logged food but all entries are for dates far in the past (no recent data)? The daily summary shows zero for today with an empty-state prompt; the trend charts show the available historical data.
- What if a user has only logged food for a single day? The trend chart shows a single data point; the streak shows 1 if that day is on-goal; the weekly summary shows one populated row.
- What if the calorie goal is zero (misconfigured)? Treat this as "no goal set" and show the goal-setup prompt rather than rendering division-by-zero charts.
- What if a user views the dashboard on a day they have not yet logged anything? The daily summary shows zero progress for today; the streak remains the count from the previous day (not broken by absence until the day ends).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a daily progress summary showing calories consumed, calorie goal, and calories remaining (or overage) as a visual progress bar.
- **FR-002**: System MUST display individual progress bars for protein, carbohydrates, and fat — each showing consumed amount, goal, and remaining/overage.
- **FR-003**: System MUST visually distinguish between on-track (under goal) and over-goal states for each macro and calorie bar.
- **FR-004**: System MUST display trend charts of daily calorie intake vs. calorie goal for user-selectable time ranges of 7 days, 30 days, and 90 days.
- **FR-005**: System MUST display trend charts of daily protein, carbohydrate, and fat intake for the same time ranges as calorie trends.
- **FR-006**: System MUST draw the user's nutrition goal as a reference line on all trend charts.
- **FR-007**: System MUST display a current goal streak: the count of consecutive days ending today (or the most recently logged day) where total calorie intake was within the daily calorie goal.
- **FR-008**: System MUST display a goal hit rate: the percentage of logged days in the past 30 days where the calorie goal was met.
- **FR-009**: System MUST display a 30-day calendar heatmap colour-coded by day status: on-goal, over-goal, under-goal, or no data logged.
- **FR-010**: System MUST display a weekly summary view for the current week (Monday–Sunday) showing per-day calorie totals vs. daily goal.
- **FR-011**: System MUST allow users to navigate backward to previous weeks in the weekly summary view.
- **FR-012**: System MUST display a weekly aggregate total (sum of logged days) alongside the weekly calorie budget (7× daily goal) in the weekly summary.
- **FR-013**: System MUST show an empty state with a prompt to log food when no data exists for today.
- **FR-014**: System MUST show a prompt to set nutrition goals (linking to the goal-setting screen) when no goals have been configured.
- **FR-015**: System MUST require authentication — unauthenticated users are redirected to login.

### Key Entities

- **Daily Nutrition Summary**: The aggregated total of calories, protein, carbohydrates, and fat logged for a specific calendar day for a given user. Derived from existing `MealLog` entries (Specs 004–006). No new stored entity required.
- **Nutrition Goal**: The user's configured daily targets for calories, protein, carbohydrates, and fat. Already stored (Spec 003). The dashboard reads this entity directly.
- **Goal Streak**: A computed value representing the number of consecutive logged days (ending today or the most recent logged day) where total calorie intake did not exceed the calorie goal. Derived on request — not a stored entity.
- **Goal Hit Rate**: A computed percentage — the number of logged days in the past 30 days where the calorie goal was met, divided by the total number of logged days in that period. Derived on request.
- **Day Status**: A classification of a calendar day for a given user: `on-goal` (logged calories ≤ daily goal), `over-goal` (logged calories > daily goal), `under-goal` (logged calories < 75% of daily goal), or `no-data` (no log entries). Derived on request for the heatmap and weekly summary.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can open the Progress Dashboard and see their current day's calorie and macro progress in under 2 seconds under normal network conditions.
- **SC-002**: All numerical values displayed on the dashboard (consumed amounts, percentages, streak counts) are arithmetically accurate — they match the sum of the user's corresponding log entries.
- **SC-003**: Trend charts for any selected time range load and render in under 3 seconds under normal network conditions.
- **SC-004**: The goal streak counter correctly reflects the true consecutive on-goal day count for 100% of tested users across varied log histories, including streak breaks and resumptions.
- **SC-005**: The 30-day heatmap correctly classifies 100% of days across all four day-status categories (on-goal, over-goal, under-goal, no data).
- **SC-006**: Users with no logged data or no goals set always see a meaningful empty state rather than a broken or blank screen — zero broken-layout incidents.
- **SC-007**: Users can navigate to a previous week in the weekly summary and see correct historical data within 1 second of tapping the navigation control.

## Assumptions

- A day is classified as "on-goal" when total calorie intake is at or below the user's daily calorie goal. The goal-met threshold for streak and hit-rate calculations is ≤ 100% of the calorie goal (not ± tolerance).
- A day is classified as "under-goal" (not on-goal) when total calorie intake is less than 75% of the daily calorie goal, to distinguish a meaningfully underlogged day from a good tracking day.
- A day with zero log entries is classified as "no-data" and does not count for or against the streak or goal hit rate.
- The streak is broken only when a day with log entries exceeds the calorie goal. Days with no data do not break a streak.
- If a user has changed their nutrition goals multiple times, this version uses the current active goal for all historical comparisons. Tracking goal history is out of scope.
- The Progress Dashboard is a read-only view — users cannot edit or delete log entries from this screen.
- The weekly summary uses Monday–Sunday as the week boundary. No user-configurable week start day in this version.
- All date and time calculations use the user's local device timezone, consistent with how log entries are recorded.
- The dashboard is accessible to authenticated users only; guest or anonymous access is not supported.
- Macro trend charts show one chart per macro (protein, carbohydrates, fat) plus one chart for calories — four charts total. Combining macros into a stacked chart is out of scope for this version.
