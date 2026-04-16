// ═══════════════════════════════════════════════════════════════════════════
// LEVEL SYSTEM - Point-based user levels (gamification)
// ═══════════════════════════════════════════════════════════════════════════

export type LevelTier =
  | "novice"
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "elite"
  | "legends";

export interface LevelDefinition {
  tier: LevelTier;
  label: string;
  minPoints: number;
  maxPoints: number;
  icon: string;
  color: {
    bg: string;
    text: string;
    border: string;
  };
  description: string;
}

export const LEVEL_TIERS: Record<LevelTier, LevelDefinition> = {
  novice: {
    tier: "novice",
    label: "Pemula",
    minPoints: 0,
    maxPoints: 99,
    icon: "⭐",
    color: {
      bg: "bg-slate-50",
      text: "text-slate-700",
      border: "border-slate-300",
    },
    description: "Baru memulai perjalanan integritas",
  },
  bronze: {
    tier: "bronze",
    label: "Perunggu",
    minPoints: 100,
    maxPoints: 249,
    icon: "🥉",
    color: {
      bg: "bg-orange-50",
      text: "text-orange-700",
      border: "border-orange-300",
    },
    description: "Mulai menunjukkan konsistensi",
  },
  silver: {
    tier: "silver",
    label: "Perak",
    minPoints: 250,
    maxPoints: 499,
    icon: "🥈",
    color: {
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-400",
    },
    description: "Disiplin yang solid",
  },
  gold: {
    tier: "gold",
    label: "Emas",
    minPoints: 500,
    maxPoints: 999,
    icon: "🥇",
    color: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      border: "border-yellow-300",
    },
    description: "Sangat disiplin dan terpercaya",
  },
  platinum: {
    tier: "platinum",
    label: "Platinum",
    minPoints: 1000,
    maxPoints: 1999,
    icon: "💎",
    color: {
      bg: "bg-cyan-50",
      text: "text-cyan-700",
      border: "border-cyan-300",
    },
    description: "Integritas luar biasa",
  },
  elite: {
    tier: "elite",
    label: "Elit",
    minPoints: 2000,
    maxPoints: 4999,
    icon: "👑",
    color: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border-purple-300",
    },
    description: "Teladan integritas",
  },
  legends: {
    tier: "legends",
    label: "Legenda",
    minPoints: 5000,
    maxPoints: Infinity,
    icon: "🌟",
    color: {
      bg: "bg-gradient-to-r from-purple-50 to-pink-50",
      text: "text-purple-700",
      border: "border-purple-300",
    },
    description: "Puncak keunggulan integritas",
  },
};

/**
 * Get level tier berdasarkan total points
 */
export const getLevelTier = (points: number): LevelDefinition => {
  for (const tier of Object.values(LEVEL_TIERS)) {
    if (points >= tier.minPoints && points <= tier.maxPoints) {
      return tier;
    }
  }
  // Default fallback ke novice
  return LEVEL_TIERS.novice;
};

/**
 * Get progress menuju next level
 */
export const getLevelProgress = (
  points: number,
): {
  current: LevelDefinition;
  next: LevelDefinition | null;
  progressPercent: number;
  pointsUntilNext: number;
} => {
  const current = getLevelTier(points);

  // Cari tier setelahnya
  const tierOrder = Object.keys(LEVEL_TIERS) as LevelTier[];
  const currentIndex = tierOrder.indexOf(current.tier);
  const nextTier =
    currentIndex < tierOrder.length - 1
      ? LEVEL_TIERS[tierOrder[currentIndex + 1]]
      : null;

  let progressPercent = 0;
  let pointsUntilNext = 0;

  if (nextTier) {
    const pointsInCurrentTier = points - current.minPoints;
    const tierRange = nextTier.minPoints - current.minPoints;
    progressPercent = Math.min(100, (pointsInCurrentTier / tierRange) * 100);
    pointsUntilNext = Math.max(0, nextTier.minPoints - points);
  } else {
    // Already at max level
    progressPercent = 100;
    pointsUntilNext = 0;
  }

  return {
    current,
    next: nextTier,
    progressPercent,
    pointsUntilNext,
  };
};

/**
 * Format level display
 */
export const formatLevel = (points: number): string => {
  const level = getLevelTier(points);
  return `${level.icon} ${level.label}`;
};

/**
 * Format point dengan penambahan "poin" text
 */
export const formatPoints = (points: number): string => {
  return `${points.toLocaleString("id-ID")} poin`;
};
