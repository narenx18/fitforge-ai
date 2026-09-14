import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, CombatMove, WorkoutSession, AuthUser, CharacterClass } from '../types';
import { INITIAL_MOVES } from '../constants/exercises';

const STORAGE_KEYS = {
  AUTH_USER: '@fitforge_auth_session_v2',
  USER_PROFILE: '@fitforge_user_profile_v3',
  COMBAT_MOVES: '@fitforge_combat_moves_v3',
  WORKOUT_HISTORY: '@fitforge_workout_history_v3',
};

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user_gladiator_01',
  name: 'Cyber Gladiator',
  email: 'pilot@fitforge.ai',
  characterClass: 'titan',
  level: 1,
  title: 'CYBER NOVICE',
  totalXp: 0,
  currentLevelXp: 0,
  nextLevelXpThreshold: 100,
  streakDays: 0,
  lastWorkoutDate: new Date().toISOString().split('T')[0],
  weightKg: 72,
  heightCm: 178,
  targetGoal: 'Unlock Electric Combat Moves',
  totalSquatsAllTime: 0,
  totalPushupsAllTime: 0,
  totalLungesAllTime: 0,
  totalJacksAllTime: 0,
  totalPlankSecondsAllTime: 0,
  todayStats: {
    calories: 0,
    reps: 0,
    avgAccuracy: 0,
    activeMinutes: 0,
    date: new Date().toISOString().split('T')[0],
  },
};

export const DEFAULT_INITIAL_HISTORY: WorkoutSession[] = [];

export const storageService = {
  async loadAuthUser(): Promise<AuthUser | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (data) {
        return JSON.parse(data) as AuthUser;
      }
      return null;
    } catch (e) {
      console.warn('Error loading auth user:', e);
      return null;
    }
  },

  async saveAuthUser(user: AuthUser): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } catch (e) {
      console.warn('Error saving auth user:', e);
    }
  },

  async clearAuthUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    } catch (e) {
      console.warn('Error clearing auth user:', e);
    }
  },

  async loadUserProfile(): Promise<UserProfile> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (data) {
        const parsed = JSON.parse(data) as UserProfile;
        const today = new Date().toISOString().split('T')[0];
        if (parsed.todayStats?.date !== today) {
          parsed.todayStats = {
            calories: 0,
            reps: 0,
            avgAccuracy: 0,
            activeMinutes: 0,
            date: today,
          };
        }
        return {
          ...DEFAULT_USER_PROFILE,
          ...parsed,
        };
      }
      return DEFAULT_USER_PROFILE;
    } catch (e) {
      console.warn('Error loading user profile from storage:', e);
      return DEFAULT_USER_PROFILE;
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Error saving user profile:', e);
    }
  },

  async loadCombatMoves(): Promise<CombatMove[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.COMBAT_MOVES);
      if (data) {
        const parsed = JSON.parse(data) as CombatMove[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          const moveMap = new Map(parsed.map((m) => [m.id, m]));
          return INITIAL_MOVES.map((initMove) => {
            const stored = moveMap.get(initMove.id);
            return stored ? { ...initMove, ...stored } : initMove;
          });
        }
      }
      return INITIAL_MOVES;
    } catch (e) {
      console.warn('Error loading combat moves:', e);
      return INITIAL_MOVES;
    }
  },

  async saveCombatMoves(moves: CombatMove[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.COMBAT_MOVES, JSON.stringify(moves));
    } catch (e) {
      console.warn('Error saving combat moves:', e);
    }
  },

  async loadWorkoutHistory(): Promise<WorkoutSession[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_HISTORY);
      if (data) {
        const parsed = JSON.parse(data) as WorkoutSession[];
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      return DEFAULT_INITIAL_HISTORY;
    } catch (e) {
      console.warn('Error loading workout history:', e);
      return DEFAULT_INITIAL_HISTORY;
    }
  },

  async saveWorkoutHistory(history: WorkoutSession[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_HISTORY, JSON.stringify(history));
    } catch (e) {
      console.warn('Error saving workout history:', e);
    }
  },

  async resetAllData(): Promise<{ user: UserProfile; moves: CombatMove[]; history: WorkoutSession[] }> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER_PROFILE,
        STORAGE_KEYS.COMBAT_MOVES,
        STORAGE_KEYS.WORKOUT_HISTORY,
      ]);
      return {
        user: DEFAULT_USER_PROFILE,
        moves: INITIAL_MOVES,
        history: DEFAULT_INITIAL_HISTORY,
      };
    } catch (e) {
      console.warn('Error resetting data:', e);
      return {
        user: DEFAULT_USER_PROFILE,
        moves: INITIAL_MOVES,
        history: DEFAULT_INITIAL_HISTORY,
      };
    }
  },
};