/**
 * Dynamic AI Recommendation Engine for GymScan / MacrosTracker
 * Generates personalized, actionable nutrition coaching recommendations based on actual user data.
 */

export function generateRecommendation({
  consumedCal,
  targetCal,
  pConsumed,
  pTarget,
  cConsumed,
  cTarget,
  fConsumed,
  fTarget,
  currentStreak = 0,
  goalType = null,
  waterCups = 0,
  isGoalProfileLoading = false,
  isGoalProfileError = false,
  hasGoalProfile = true
}) {
  // 1. Loading State
  if (isGoalProfileLoading) {
    return {
      headline: "AI Coach is preparing...",
      text: "Analyzing your physical profile and calculating your personalized daily macro splits...",
      type: "loading",
      icon: "Sparkles"
    };
  }

  // 2. Goal Profile not configured
  if (isGoalProfileError || !hasGoalProfile || !goalType) {
    return {
      headline: "Configure your goals",
      text: "Your target nutrition settings are not set up yet. Calibrate your biological metrics to unlock personalized coaching recommendations.",
      type: "setup",
      icon: "Sliders",
      actionText: "Configure Goal Profile",
      actionLink: "/my-goal"
    };
  }

  // Clamped calculations
  const remainingCal = targetCal - consumedCal;
  const isCalOver = remainingCal < 0;
  const calPct = targetCal > 0 ? (consumedCal / targetCal) * 100 : 0;

  const pPct = pTarget > 0 ? (pConsumed / pTarget) * 100 : 0;
  const cPct = cTarget > 0 ? (cConsumed / cTarget) * 100 : 0;
  const fPct = fTarget > 0 ? (fConsumed / fTarget) * 100 : 0;

  const proteinGap = pTarget - pConsumed;
  const carbsGap = cTarget - cConsumed;
  const fatsGap = fTarget - fConsumed;

  // Map database enum/string representation of GoalType to plain English
  let goalName = "your health goals";
  if (goalType.toLowerCase().includes("lose")) {
    goalName = "healthy fat loss";
  } else if (goalType.toLowerCase().includes("gain")) {
    goalName = "muscle development";
  } else if (goalType.toLowerCase().includes("maintain")) {
    goalName = "weight maintenance";
  }

  // 3. Empty Diary State (consumedCal === 0)
  if (consumedCal === 0) {
    if (goalType.toLowerCase().includes("lose")) {
      return {
        headline: "Ready for fat loss today?",
        text: "Your nutrition diary is empty. Focus on logging clean, high-protein meals with high volume and moderate portions today to maintain your calorie deficit.",
        type: "info",
        icon: "Camera",
        actionText: "Scan Plate with AI",
        actionLink: "/scan"
      };
    } else if (goalType.toLowerCase().includes("gain")) {
      return {
        headline: "Ready to fuel muscle growth?",
        text: "No meals logged yet today. To optimize muscle hypertrophy, start tracking early and ensure you meet your caloric surplus and protein targets.",
        type: "info",
        icon: "Beef",
        actionText: "Log Breakfast",
        actionLink: "/log"
      };
    } else {
      return {
        headline: "Start tracking today",
        text: "Your nutrition diary is empty. Log your breakfast, scan your plate using AI, or search for food items manually to start tracking your day!",
        type: "info",
        icon: "Sparkles",
        actionText: "Scan Meal with AI",
        actionLink: "/scan"
      };
    }
  }

  // 4. Calorie Target Exceeded (High priority warning)
  if (isCalOver) {
    const overAmt = Math.round(Math.abs(remainingCal));
    return {
      headline: "Calorie target exceeded",
      text: `You are currently ${overAmt} calories above your target. Try focusing on low-calorie, high-volume vegetables and sugar-free hydration for the rest of the day.`,
      type: "warning",
      icon: "Flame"
    };
  }

  // 5. Protein is Low
  // Protein deficit is a major priority for all user types, especially when calorie budget is already partly used.
  if (proteinGap >= 25) {
    let proteinRecommendation = `You're currently ${Math.round(proteinGap)}g below your protein target. Consider adding chicken breast, lean beef, Greek yogurt, egg whites, or a scoop of whey protein.`;
    
    // Customize tip if calorie budget is running thin (e.g. less than 400 kcal remaining)
    if (remainingCal < 400 && remainingCal > 0) {
      proteinRecommendation = `You are ${Math.round(proteinGap)}g short of your protein goal with only ${Math.round(remainingCal)} calories left. Choose ultra-lean protein sources like tuna, egg whites, or high-purity protein isolates to hit your target.`;
    }

    return {
      headline: "Boost your protein intake",
      text: proteinRecommendation,
      type: "tip",
      icon: "Beef"
    };
  }

  // 6. Carbs exceed target (significant surplus)
  if (cConsumed > cTarget + 15) {
    const overCarbs = Math.round(cConsumed - cTarget);
    return {
      headline: "Carbohydrates limit reached",
      text: `You are currently ${overCarbs}g above your carbs target. Keep subsequent meals lean and green, prioritizing proteins and healthy fats for clean energy.`,
      type: "warning",
      icon: "Wheat"
    };
  }

  // 7. Fats exceed target (significant surplus)
  if (fConsumed > fTarget + 10) {
    const overFat = Math.round(fConsumed - fTarget);
    return {
      headline: "Healthy fats limit reached",
      text: `You are ${overFat}g over your fat allowance. Avoid cooking oils, butter, cheese, dressings, or nuts for your remaining meals today.`,
      type: "warning",
      icon: "Pizza"
    };
  }

  // 8. Hydration tracking is very low
  if (waterCups < 4) {
    return {
      headline: "Hydration check!",
      text: `You have logged only ${waterCups} cup${waterCups === 1 ? "" : "s"} of water today. Staying hydrated supports physical stamina, digestion, and metabolizing fat cells for your ${goalName} plan. Let's aim for 8 cups today!`,
      type: "tip",
      icon: "Droplets"
    };
  }

  // 9. Excellent Adherence (e.g., reached protein and within calories)
  if (pPct >= 85) {
    if (currentStreak >= 3) {
      return {
        headline: "Unstoppable streak!",
        text: `Excellent progress on your ${currentStreak}-day streak! You've already achieved ${Math.round(pPct)}% of today's protein target and are perfectly aligned with your ${goalName} roadmap.`,
        type: "success",
        icon: "CheckCircle2"
      };
    } else {
      return {
        headline: "Excellent fuel efficiency!",
        text: `Outstanding job! You have reached ${Math.round(pPct)}% of your protein target while maintaining a healthy energy balance. Keep up this high-quality nutrition rhythm.`,
        type: "success",
        icon: "CheckCircle2"
      };
    }
  }

  // 10. Default Streak and Consistency encouragement
  if (currentStreak >= 3) {
    return {
      headline: `${currentStreak}-Day Streak Active`,
      text: `Your consistency is paying off! You've logged ${consumedCal} kcal (${Math.round(calPct)}%) and successfully stayed on track for your ${goalName} objectives today. Keep the momentum going!`,
      type: "success",
      icon: "CheckCircle2"
    };
  }

  // 11. Generic perfect daily tracking state
  return {
    headline: "You're on track!",
    text: `Maintain a steady intake of nutrient-dense foods. You've hit ${Math.round(calPct)}% of your calories and logged ${Math.round(pConsumed)}g of protein. Excellent work tracking today!`,
    type: "success",
    icon: "Sparkles"
  };
}
