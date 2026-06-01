import { motion } from "framer-motion";
import { Zap, Flame, Sword, Shield, Crown, Gem, Trophy, Lock, Sparkles, ChevronRight, Check } from "lucide-react";

export const STREAK_MILESTONES = [
  { 
    days: 3, 
    name: "Spark", 
    icon: Zap, 
    emoji: "✨",
    color: "linear-gradient(135deg, #ff9e2c 0%, #ff5e36 100%)", // Warm Golden Ember
    glow: "rgba(255, 158, 44, 0.35)",
    description: "Start the spark! Track your meals for 3 consecutive days." 
  },
  { 
    days: 7, 
    name: "Fire", 
    icon: Flame, 
    emoji: "🔥",
    color: "linear-gradient(135deg, #ff4e17 0%, #ff007f 100%)", // Vibrant Neon Fire
    glow: "rgba(255, 78, 23, 0.35)",
    description: "Ignite a full week streak. Your progress is catching fire!" 
  },
  { 
    days: 14, 
    name: "Warrior", 
    icon: Sword, 
    emoji: "⚔️",
    color: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)", // Magic Pink-Indigo
    glow: "rgba(236, 72, 153, 0.35)",
    description: "Disciplined and relentless. Complete a solid 14-day streak." 
  },
  { 
    days: 21, 
    name: "Titan", 
    icon: Shield, 
    emoji: "🛡️",
    color: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)", // Majestic Cyan-Blue
    glow: "rgba(59, 130, 246, 0.35)",
    description: "Mythical habit builder. Log consistently for 21 days straight." 
  },
  { 
    days: 30, 
    name: "Legend", 
    icon: Crown, 
    emoji: "👑",
    color: "linear-gradient(135deg, #f59e0b 0%, #eab308 100%)", // Royal Pure Gold
    glow: "rgba(245, 158, 11, 0.35)",
    description: "One month of dedication. A true legend of personal nutrition!" 
  },
  { 
    days: 60, 
    name: "Elite", 
    icon: Gem, 
    emoji: "💎",
    color: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)", // Emerald Diamond
    glow: "rgba(16, 185, 129, 0.35)",
    description: "Exceptional mastery. Sustain a premium 60-day streak." 
  },
  { 
    days: 100, 
    name: "Master", 
    icon: Trophy, 
    emoji: "🏆",
    color: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)", // Cosmic Master Purple-Pink
    glow: "rgba(139, 92, 246, 0.4)",
    description: "Absolute master of health! 100 consecutive days logged." 
  }
];

export function getStreakMilestoneInfo(currentStreak) {
  let currentMilestone = null;
  let nextMilestone = null;

  for (let i = 0; i < STREAK_MILESTONES.length; i++) {
    const milestone = STREAK_MILESTONES[i];
    if (currentStreak >= milestone.days) {
      currentMilestone = milestone;
    } else {
      nextMilestone = milestone;
      break;
    }
  }

  let daysRemaining = 0;
  let progressPercentage = 100;
  let prevDays = 0;

  if (nextMilestone) {
    if (currentMilestone) {
      prevDays = currentMilestone.days;
    }
    const totalSegmentDays = nextMilestone.days - prevDays;
    const progressInSegment = currentStreak - prevDays;
    // Segment-based progress ratio
    progressPercentage = Math.min(Math.max((progressInSegment / totalSegmentDays) * 100, 0), 100);
    daysRemaining = nextMilestone.days - currentStreak;
  }

  return {
    currentMilestone,
    nextMilestone,
    daysRemaining,
    progressPercentage,
  };
}

export function StreakAchievements({ currentStreak, isCompact = false }) {
  const { currentMilestone, nextMilestone, daysRemaining, progressPercentage } = getStreakMilestoneInfo(currentStreak);

  // If in compact/widget mode (perfect for Dashboard)
  if (isCompact) {
    return (
      <div className="streak-achievement-widget">
        <div className="widget-streak-header">
          <div className="widget-streak-badge-display">
            {currentMilestone ? (
              <div 
                className="widget-active-badge-icon" 
                style={{ 
                  background: currentMilestone.color,
                  boxShadow: `0 0 16px ${currentMilestone.glow}`
                }}
              >
                <currentMilestone.icon size={18} className="badge-svg-glow" />
              </div>
            ) : (
              <div className="widget-active-badge-icon widget-active-badge-icon--locked">
                <Lock size={16} />
              </div>
            )}
            <div className="widget-streak-badge-info">
              <div className="widget-streak-badge-title">
                {currentMilestone ? `${currentMilestone.emoji} ${currentMilestone.name} Achieved` : "No Badges Yet"}
              </div>
              <div className="widget-streak-badge-sub">
                Current Streak: <span className="streak-number-accent">{currentStreak} {currentStreak === 1 ? "Day" : "Days"}</span>
              </div>
            </div>
          </div>
          {nextMilestone && (
            <div className="widget-streak-next-milestone-tag">
              Next: {nextMilestone.name} ({nextMilestone.days}d)
            </div>
          )}
        </div>

        {nextMilestone && (
          <div className="widget-streak-progress-container">
            <div className="widget-streak-progress-labels">
              <span>{currentStreak}d</span>
              <span className="widget-streak-progress-remaining-text">
                {daysRemaining} {daysRemaining === 1 ? "day" : "days"} to {nextMilestone.name}
              </span>
              <span>{nextMilestone.days}d</span>
            </div>
            <div className="widget-streak-progress-track">
              <div 
                className="widget-streak-progress-bar"
                style={{ 
                  width: `${progressPercentage}%`,
                  background: nextMilestone.color,
                  boxShadow: `0 0 12px ${nextMilestone.glow}`
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full page layout (perfect for Progress streaks tab)
  return (
    <div className="streak-achievements-full">
      {/* Overview Milestone Card */}
      <div className="streak-achievements-hero-card">
        <div className="hero-card-glow" />
        <div className="streak-achievements-hero-card__content">
          <div className="hero-streak-headline-group">
            <div className="hero-streak-counter-bubble">
              <span className="hero-streak-counter-number">{currentStreak}</span>
              <span className="hero-streak-counter-label">{currentStreak === 1 ? "Day" : "Days"}</span>
              <Flame size={20} className="hero-streak-flame-icon animated-float" />
            </div>
            
            <div className="hero-streak-text-group">
              <span className="hero-streak-eyebrow">Streak Achievements</span>
              <h3 className="hero-streak-title">
                {currentMilestone ? (
                  <>
                    <span className="hero-badge-emoji">{currentMilestone.emoji}</span> 
                    {currentMilestone.name} Level Unlocked
                  </>
                ) : (
                  "Begin Your Journey"
                )}
              </h3>
              <p className="hero-streak-desc">
                {currentMilestone 
                  ? `Incredible dedication! You reached a ${currentMilestone.days}-day streak and earned the ${currentMilestone.name} badge.`
                  : "Log your daily nutrition goals and hit your targets to unlock streak milestone badges!"
                }
              </p>
            </div>
          </div>

          {nextMilestone ? (
            <div className="hero-streak-milestone-progress">
              <div className="hero-streak-milestone-progress__info">
                <span className="progress-remaining-days">
                  🔥 <strong>{daysRemaining} {daysRemaining === 1 ? "Day" : "Days"}</strong> until <strong>{nextMilestone.name} Badge</strong>
                </span>
                <span className="progress-ratio">
                  {currentStreak} / {nextMilestone.days} days
                </span>
              </div>
              <div className="hero-streak-progress-track">
                <div 
                  className="hero-streak-progress-bar"
                  style={{ 
                    width: `${progressPercentage}%`,
                    background: nextMilestone.color,
                    boxShadow: `0 0 16px ${nextMilestone.glow}`
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="hero-streak-completed-badge">
              <Sparkles size={18} className="gold-text-glow" />
              <span>Congratulations! You reached the ultimate milestone: <strong>Legendary Master</strong>!</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of badges */}
      <h4 className="streak-badges-grid-title">Milestone Achievements</h4>
      <div className="streak-badges-grid">
        {STREAK_MILESTONES.map((badge, idx) => {
          const isUnlocked = currentStreak >= badge.days;
          const isNext = nextMilestone && nextMilestone.days === badge.days;
          
          return (
            <motion.div 
              key={badge.days}
              className={`streak-badge-card ${isUnlocked ? 'streak-badge-card--unlocked' : ''} ${isNext ? 'streak-badge-card--next' : ''}`}
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <div className="streak-badge-card__visual">
                {isUnlocked ? (
                  <div 
                    className="streak-badge-icon-container" 
                    style={{ 
                      background: badge.color,
                      boxShadow: `0 8px 24px ${badge.glow}`
                    }}
                  >
                    <badge.icon size={28} className="badge-svg-glow" />
                    <div className="badge-unlocked-tick">
                      <Check size={10} strokeWidth={3} />
                    </div>
                  </div>
                ) : (
                  <div className="streak-badge-icon-container streak-badge-icon-container--locked">
                    <badge.icon size={26} className="badge-locked-icon-gray" />
                    <div className="badge-lock-lock">
                      <Lock size={12} />
                    </div>
                  </div>
                )}
                <div className="streak-badge-days-tag" style={isUnlocked ? { background: badge.color } : {}}>
                  {badge.days}d
                </div>
              </div>

              <div className="streak-badge-card__content">
                <div className="badge-name-status">
                  <span className="badge-name">{badge.name}</span>
                  {isUnlocked && <span className="badge-status-pill badge-status-pill--unlocked">Unlocked</span>}
                  {isNext && <span className="badge-status-pill badge-status-pill--next">Next Up</span>}
                  {!isUnlocked && !isNext && <span className="badge-status-pill badge-status-pill--locked">Locked</span>}
                </div>
                <p className="badge-description">{badge.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
