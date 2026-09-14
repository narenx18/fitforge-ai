export type ExerciseType = 'squat' | 'pushup' | 'lunge' | 'jumping_jack' | 'plank';

export type AppTab = 'dashboard' | 'diet' | 'workout' | 'moves' | 'arena' | 'history' | 'profile';

export type CharacterClass = 'titan' | 'ninja' | 'valkyrie';

export interface CharacterClassConfig {
  id: CharacterClass;
  name: string;
  avatar: string;
  title: string;
  description: string;
  color: string;
  attackMultiplier: number;
  defenseMultiplier: number;
  xpMultiplier: number;
  critRateBonus: number; // e.g. +0.25
  specialTrait: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  token: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  characterClass: CharacterClass;
  level: number;
  title: string;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXpThreshold: number;
  streakDays: number;
  lastWorkoutDate: string;
  weightKg: number;
  heightCm: number;
  targetGoal: string;
  totalSquatsAllTime: number;
  totalPushupsAllTime: number;
  totalLungesAllTime: number;
  totalJacksAllTime: number;
  totalPlankSecondsAllTime: number;
  todayStats: {
    calories: number;
    reps: number;
    avgAccuracy: number;
    activeMinutes: number;
    date: string;
  };
}

export interface ExerciseConfig {
  id: string;
  name: string;
  slug: ExerciseType;
  description: string;
  category: string;
  targetMuscles: string[];
  unlockRequirementReps: number;
  unlockedMoveId: string;
  demoTip: string;
  properFormDescription: string;
  targetAngleDown: number;
  targetAngleUp: number;
  isTimed?: boolean;
  iconName: string;
  color: string;
}

export interface CombatMove {
  id: string;
  name: string;
  exerciseSlug: ExerciseType | 'all';
  baseDamage: number;
  requiredReps: number;
  unlocked: boolean;
  masteryPercent: number;
  description: string;
  iconName: string;
  tier: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  color: string;
}

export interface WorkoutSession {
  id: string;
  timestamp: string;
  dateString: string;
  exerciseType: ExerciseType;
  exerciseName: string;
  repsCompleted: number;
  validReps: number;
  avgFormScore: number;
  xpEarned: number;
  caloriesBurned: number;
  durationSeconds: number;
}

export interface PoseLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export type PoseLandmarks = Record<number, PoseLandmark>;

export interface FormFeedback {
  message: string;
  status: 'good' | 'warning' | 'error' | 'idle';
  angle: number;
  targetDepthReached: boolean;
  score: number;
  completionPercent: number;
}

export interface Fighter {
  id: string;
  name: string;
  avatar: string;
  title: string;
  characterClass: CharacterClass;
  maxHp: number;
  currentHp: number;
  level: number;
  moves: CombatMove[];
  isPlayer: boolean;
  attackPower: number;
  defense: number;
  critRateBonus: number;
}

export interface RivalBoss {
  id: string;
  name: string;
  avatar: string;
  title: string;
  maxHp: number;
  attackPower: number;
  level: number;
  description: string;
  unlockedAtLevel: number;
  color: string;
}

export interface CombatAction {
  id: string;
  turn: number;
  attackerName: string;
  defenderName: string;
  moveName: string;
  damageDealt: number;
  isCritical: boolean;
  timestamp: string;
  narrative: string;
  isPlayerAttacker: boolean;
}

export type BattleStatus = 'idle' | 'battling' | 'victory' | 'defeat';

export interface FloatingDamage {
  id: string;
  text: string;
  isPlayerTarget: boolean;
  isCritical: boolean;
}

export interface BattleState {
  status: BattleStatus;
  turn: number;
  playerFighter: Fighter;
  rivalFighter: Fighter;
  selectedRivalId: string;
  combatLogs: CombatAction[];
  autoBattle: boolean;
  selectedMoveId: string;
  isAttackingAnimation: boolean;
  shakeEffect: boolean;
  slashEffect: boolean;
  floatingDamages: FloatingDamage[];
}

export interface RewardsData {
  type: 'workout' | 'battle';
  title: string;
  subtitle: string;
  xpEarned: number;
  repsDone?: number;
  accuracyScore?: number;
  moveUpgrades?: { name: string; oldMastery: number; newMastery: number }[];
  isVictory?: boolean;
}
