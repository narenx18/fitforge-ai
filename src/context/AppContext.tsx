import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  CombatMove,
  WorkoutSession,
  AppTab,
  ExerciseType,
  BattleState,
  RewardsData,
  Fighter,
  CombatAction,
  ExerciseConfig,
  FloatingDamage,
  CharacterClass,
} from '../types';
import { storageService, DEFAULT_USER_PROFILE, DEFAULT_INITIAL_HISTORY } from '../services/storage';
import { INITIAL_MOVES, RIVAL_BOSSES, LEVEL_TIERS, EXERCISES } from '../constants/exercises';
import { CHARACTER_CLASSES } from '../constants/characters';
import { safeHaptic } from '../services/haptics';

interface ExtendedBattleState extends BattleState {
  attackerSide: 'player' | 'rival' | null;
  hitSide: 'player' | 'rival' | null;
}

interface AppContextType {
  user: UserProfile;
  moves: CombatMove[];
  history: WorkoutSession[];
  activeTab: AppTab;
  activeExercise: ExerciseType;
  isSimulated: boolean;
  battle: ExtendedBattleState;
  activeModal: 'results' | 'exercise_detail' | null;
  modalData: any;
  isLoading: boolean;
  setActiveTab: (tab: AppTab) => void;
  setActiveExercise: (exercise: ExerciseType) => void;
  toggleSimulation: (val?: boolean) => void;
  openExerciseDetail: (config: ExerciseConfig) => void;
  closeModal: () => void;
  recordCompletedRep: (exercise: ExerciseType, accuracyScore: number) => { xpGained: number; unlockedNewMove?: string };
  finishWorkoutSession: (session: {
    exerciseType: ExerciseType;
    repsCompleted: number;
    validReps: number;
    avgFormScore: number;
    xpEarned: number;
    caloriesBurned: number;
    durationSeconds: number;
  }) => void;
  startBattle: (rivalId?: string) => void;
  executeCombatTurn: () => void;
  toggleAutoBattle: () => void;
  selectCombatMove: (moveId: string) => void;
  resetBattle: () => void;
  resetAllUserData: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function createInitialFighter(user: UserProfile, moves: CombatMove[]): Fighter {
  const cls = CHARACTER_CLASSES[user.characterClass] || CHARACTER_CLASSES.titan;
  const unlockedMoves = moves.filter((m) => m.unlocked);
  return {
    id: user.id,
    name: user.name,
    avatar: cls.avatar,
    title: user.title,
    characterClass: user.characterClass,
    maxHp: 100,
    currentHp: 100,
    level: user.level,
    moves: unlockedMoves.length > 0 ? unlockedMoves : [INITIAL_MOVES[0]],
    isPlayer: true,
    attackPower: Math.round((22 + user.level * 5) * cls.attackMultiplier),
    defense: Math.round((10 + user.level * 2) * cls.defenseMultiplier),
    critRateBonus: cls.critRateBonus,
  };
}

function createRivalFighter(rivalId: string = 'boss_aegis9'): Fighter {
  const boss = RIVAL_BOSSES.find((b) => b.id === rivalId) || RIVAL_BOSSES[0];
  return {
    id: boss.id,
    name: boss.name,
    avatar: boss.avatar,
    title: boss.title,
    characterClass: 'titan' as CharacterClass,
    maxHp: boss.maxHp,
    currentHp: boss.maxHp,
    level: boss.level,
    moves: [],
    isPlayer: false,
    attackPower: boss.attackPower,
    defense: 8 + boss.level * 3,
    critRateBonus: 0.1,
  };
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER_PROFILE);
  const [moves, setMoves] = useState<CombatMove[]>(INITIAL_MOVES);
  const [history, setHistory] = useState<WorkoutSession[]>(DEFAULT_INITIAL_HISTORY);
  const [activeTab, setActiveTabState] = useState<AppTab>('dashboard');
  const [activeExercise, setActiveExercise] = useState<ExerciseType>('squat');
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeModal, setActiveModal] = useState<'results' | 'exercise_detail' | null>(null);
  const [modalData, setModalData] = useState<any>(null);

  const [battle, setBattle] = useState<ExtendedBattleState>({
    status: 'idle',
    turn: 1,
    playerFighter: createInitialFighter(DEFAULT_USER_PROFILE, INITIAL_MOVES),
    rivalFighter: createRivalFighter('boss_aegis9'),
    selectedRivalId: 'boss_aegis9',
    combatLogs: [],
    autoBattle: false,
    selectedMoveId: 'iron_kick',
    isAttackingAnimation: false,
    shakeEffect: false,
    slashEffect: false,
    floatingDamages: [],
    attackerSide: null,
    hitSide: null,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedUser, loadedMoves, loadedHistory] = await Promise.all([
          storageService.loadUserProfile(),
          storageService.loadCombatMoves(),
          storageService.loadWorkoutHistory(),
        ]);
        setUser(loadedUser);
        setMoves(loadedMoves);
        setHistory(loadedHistory);
        setBattle((prev) => ({
          ...prev,
          playerFighter: createInitialFighter(loadedUser, loadedMoves),
          selectedMoveId: loadedMoves.find((m) => m.unlocked)?.id || 'iron_kick',
        }));
      } catch (err) {
        console.error('Error hydrating app state:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const refreshUserProfile = async () => {
    try {
      const [loadedUser, loadedMoves] = await Promise.all([
        storageService.loadUserProfile(),
        storageService.loadCombatMoves(),
      ]);
      setUser(loadedUser);
      setMoves(loadedMoves);
      setBattle((prev) => ({
        ...prev,
        playerFighter: createInitialFighter(loadedUser, loadedMoves),
      }));
    } catch (e) {
      console.warn('Error refreshing profile:', e);
    }
  };

  const setActiveTab = (tab: AppTab) => {
    safeHaptic.light();
    setActiveTabState(tab);
  };

  const toggleSimulation = (val?: boolean) => {
    safeHaptic.medium();
    setIsSimulated((prev) => (val !== undefined ? val : !prev));
  };

  const openExerciseDetail = (config: ExerciseConfig) => {
    safeHaptic.light();
    setModalData(config);
    setActiveModal('exercise_detail');
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  const calculateLevelTier = (totalXp: number) => {
    let currentLevel = 1;
    let title = LEVEL_TIERS[0].title;
    let nextThreshold = LEVEL_TIERS[0].maxXp;
    let currentLevelXp = totalXp;
    for (const tier of LEVEL_TIERS) {
      if (totalXp >= tier.minXp) {
        currentLevel = tier.level;
        title = tier.title;
        nextThreshold = tier.maxXp;
        currentLevelXp = totalXp - tier.minXp;
      }
    }
    return { level: currentLevel, title, currentLevelXp, nextLevelXpThreshold: nextThreshold };
  };

  const recordCompletedRep = (exercise: ExerciseType, accuracyScore: number) => {
    safeHaptic.success();
    const cls = CHARACTER_CLASSES[user.characterClass] || CHARACTER_CLASSES.titan;
    const baseXp = Math.max(1, Math.round(10 * (accuracyScore / 100)));
    const xpGained = Math.round(baseXp * cls.xpMultiplier);
    let unlockedNewMove: string | undefined = undefined;

    setUser((prevUser) => {
      const newTotalXp = prevUser.totalXp + xpGained;
      const newSquats = exercise === 'squat' ? prevUser.totalSquatsAllTime + 1 : prevUser.totalSquatsAllTime;
      const newPushups = exercise === 'pushup' ? prevUser.totalPushupsAllTime + 1 : prevUser.totalPushupsAllTime;
      const newLunges = exercise === 'lunge' ? (prevUser.totalLungesAllTime || 0) + 1 : (prevUser.totalLungesAllTime || 0);
      const newJacks = exercise === 'jumping_jack' ? (prevUser.totalJacksAllTime || 0) + 1 : (prevUser.totalJacksAllTime || 0);
      const newPlank = exercise === 'plank' ? (prevUser.totalPlankSecondsAllTime || 0) + 1 : (prevUser.totalPlankSecondsAllTime || 0);
      const { level, title, currentLevelXp, nextLevelXpThreshold } = calculateLevelTier(newTotalXp);
      const caloriesAdded = exercise === 'jumping_jack' ? 6 : exercise === 'plank' ? 2 : 5;
      const updatedUser: UserProfile = {
        ...prevUser,
        totalXp: newTotalXp,
        level,
        title,
        currentLevelXp,
        nextLevelXpThreshold,
        totalSquatsAllTime: newSquats,
        totalPushupsAllTime: newPushups,
        totalLungesAllTime: newLunges,
        totalJacksAllTime: newJacks,
        totalPlankSecondsAllTime: newPlank,
        todayStats: {
          ...prevUser.todayStats,
          reps: prevUser.todayStats.reps + 1,
          calories: prevUser.todayStats.calories + caloriesAdded,
          avgAccuracy: Math.round(
            (prevUser.todayStats.avgAccuracy * prevUser.todayStats.reps + accuracyScore) /
              (prevUser.todayStats.reps + 1)
          ),
        },
      };
      storageService.saveUserProfile(updatedUser);
      return updatedUser;
    });

    setMoves((prevMoves) => {
      const updatedMoves = prevMoves.map((m) => {
        const isMatch = m.exerciseSlug === exercise || m.exerciseSlug === 'all';
        let updatedMastery = m.masteryPercent;
        if (isMatch) {
          updatedMastery = Math.min(100, m.masteryPercent + (accuracyScore >= 80 ? 5 : 2));
        }
        return { ...m, masteryPercent: updatedMastery, unlocked: true };
      });
      storageService.saveCombatMoves(updatedMoves);
      return updatedMoves;
    });

    return { xpGained, unlockedNewMove };
  };

  const finishWorkoutSession = (sessionData: {
    exerciseType: ExerciseType;
    repsCompleted: number;
    validReps: number;
    avgFormScore: number;
    xpEarned: number;
    caloriesBurned: number;
    durationSeconds: number;
  }) => {
    safeHaptic.heavy();
    const newSession: WorkoutSession = {
      id: `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
      dateString: new Date().toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
      }),
      exerciseType: sessionData.exerciseType,
      exerciseName: EXERCISES[sessionData.exerciseType].name,
      repsCompleted: sessionData.repsCompleted,
      validReps: sessionData.validReps,
      avgFormScore: sessionData.avgFormScore,
      xpEarned: sessionData.xpEarned,
      caloriesBurned: sessionData.caloriesBurned,
      durationSeconds: sessionData.durationSeconds,
    };
    const updatedHistory = [newSession, ...history];
    setHistory(updatedHistory);
    storageService.saveWorkoutHistory(updatedHistory);
    const rewards: RewardsData = {
      type: 'workout',
      title: 'WORKOUT PROTOCOL COMPLETE',
      subtitle: `${EXERCISES[sessionData.exerciseType].name} Combat Conditioning`,
      xpEarned: sessionData.xpEarned,
      repsDone: sessionData.validReps,
      accuracyScore: sessionData.avgFormScore,
      moveUpgrades: moves
        .filter((m) => m.exerciseSlug === sessionData.exerciseType || m.exerciseSlug === 'all')
        .map((m) => ({
          name: m.name,
          oldMastery: Math.max(0, m.masteryPercent - sessionData.validReps * 5),
          newMastery: m.masteryPercent,
        })),
    };
    setModalData(rewards);
    setActiveModal('results');
  };

  const startBattle = (rivalId: string = 'boss_aegis9') => {
    safeHaptic.heavy();
    const rival = createRivalFighter(rivalId);
    const player = createInitialFighter(user, moves);
    const initialLog: CombatAction = {
      id: `log_${Date.now()}`,
      turn: 1,
      attackerName: 'SYSTEM',
      defenderName: 'ARENA',
      moveName: 'Combat Link Initialized',
      damageDealt: 0,
      isCritical: false,
      timestamp: new Date().toLocaleTimeString(),
      narrative: `⚔️ Combat initiated against ${rival.name}! Select a move or execute strike.`,
      isPlayerAttacker: true,
    };
    const availableMove = moves.find((m) => m.unlocked) || INITIAL_MOVES[0];
    setBattle({
      status: 'battling',
      turn: 1,
      playerFighter: player,
      rivalFighter: rival,
      selectedRivalId: rivalId,
      combatLogs: [initialLog],
      autoBattle: false,
      selectedMoveId: availableMove.id,
      isAttackingAnimation: false,
      shakeEffect: false,
      slashEffect: false,
      floatingDamages: [],
      attackerSide: null,
      hitSide: null,
    });
  };

  const selectCombatMove = (moveId: string) => {
    safeHaptic.light();
    setBattle((prev) => ({ ...prev, selectedMoveId: moveId }));
  };

  const toggleAutoBattle = () => {
    safeHaptic.medium();
    setBattle((prev) => ({ ...prev, autoBattle: !prev.autoBattle }));
  };

  const executeCombatTurn = () => {
    if (battle.status !== 'battling' || battle.attackerSide !== null) return;
    safeHaptic.heavy();

    const cls = CHARACTER_CLASSES[user.characterClass] || CHARACTER_CLASSES.titan;
    const selectedMove =
      moves.find((m) => m.id === battle.selectedMoveId) ||
      moves.find((m) => m.unlocked) ||
      INITIAL_MOVES[0];
    const critChance = 0.25 + cls.critRateBonus;
    const isCritical = Math.random() < critChance;
    const masteryMultiplier = 1 + (selectedMove.masteryPercent / 100) * 0.5;
    const critMultiplier = isCritical ? 1.6 : 1.0;
    const baseDmg = selectedMove.baseDamage || 20;
    const playerDamage = Math.round(baseDmg * masteryMultiplier * critMultiplier * cls.attackMultiplier);
    const nextRivalHp = Math.max(0, battle.rivalFighter.currentHp - playerDamage);

    // --- PHASE 1: Player Attacks ---
    setBattle((prev) => ({
      ...prev,
      attackerSide: 'player',
      isAttackingAnimation: true,
    }));

    setTimeout(() => {
      safeHaptic.heavy();
      const playerLog: CombatAction = {
        id: `log_p_${Date.now()}_${battle.turn}`,
        turn: battle.turn,
        attackerName: user.name,
        defenderName: battle.rivalFighter.name,
        moveName: selectedMove.name,
        damageDealt: playerDamage,
        isCritical,
        timestamp: new Date().toLocaleTimeString(),
        narrative: `💥 ${user.name} unleashed ${selectedMove.name}! ${isCritical ? '⚡CRITICAL HIT! ' : ''}Dealt ${playerDamage} DMG.`,
        isPlayerAttacker: true,
      };
      const rivalFloatingDmg: FloatingDamage = {
        id: `dmg_r_${Date.now()}`,
        text: `-${playerDamage} HP${isCritical ? ' ⚡CRIT!' : ''}`,
        isPlayerTarget: false,
        isCritical,
      };

      setBattle((prev) => ({
        ...prev,
        attackerSide: null,
        hitSide: 'rival',
        rivalFighter: { ...prev.rivalFighter, currentHp: nextRivalHp },
        combatLogs: [playerLog, ...prev.combatLogs],
        shakeEffect: true,
        slashEffect: true,
        floatingDamages: [rivalFloatingDmg],
      }));

      // Check Victory
      if (nextRivalHp <= 0) {
        safeHaptic.success();
        const victoryXp = Math.round((80 + battle.rivalFighter.level * 30) * cls.xpMultiplier);
        setUser((prev) => {
          const total = prev.totalXp + victoryXp;
          const { level, title, currentLevelXp, nextLevelXpThreshold } = calculateLevelTier(total);
          const updated: UserProfile = { ...prev, totalXp: total, level, title, currentLevelXp, nextLevelXpThreshold };
          storageService.saveUserProfile(updated);
          return updated;
        });
        const victoryLog: CombatAction = {
          id: `log_vic_${Date.now()}`, turn: battle.turn, attackerName: 'SYSTEM',
          defenderName: battle.rivalFighter.name, moveName: 'KNOCKOUT', damageDealt: 0, isCritical: false,
          timestamp: new Date().toLocaleTimeString(),
          narrative: `🏆 VICTORY! ${battle.rivalFighter.name} defeated! Earned +${victoryXp} XP!`,
          isPlayerAttacker: true,
        };
        setTimeout(() => {
          setBattle((prev) => ({
            ...prev, status: 'victory', autoBattle: false, hitSide: null, shakeEffect: false, slashEffect: false,
            combatLogs: [victoryLog, ...prev.combatLogs],
          }));
          setModalData({ type: 'battle', title: 'ARENA VICTORY', subtitle: `Defeated ${battle.rivalFighter.name}`, xpEarned: victoryXp, isVictory: true });
          setActiveModal('results');
        }, 500);
        return;
      }

      // --- PHASE 2: Rival Counter-Attacks ---
      setTimeout(() => {
        const rivalAtk = battle.rivalFighter.attackPower;
        const rivalDmg = Math.round(rivalAtk * (0.85 + Math.random() * 0.35));
        const nextPlayerHp = Math.max(0, battle.playerFighter.currentHp - rivalDmg);

        setBattle((prev) => ({
          ...prev,
          attackerSide: 'rival',
          hitSide: null,
          shakeEffect: false,
          slashEffect: false,
          floatingDamages: [],
        }));

        setTimeout(() => {
          safeHaptic.heavy();
          const rivalLog: CombatAction = {
            id: `log_r_${Date.now()}_${battle.turn}`, turn: battle.turn,
            attackerName: battle.rivalFighter.name, defenderName: user.name,
            moveName: 'Counter Pulse', damageDealt: rivalDmg, isCritical: false,
            timestamp: new Date().toLocaleTimeString(),
            narrative: `⚡ ${battle.rivalFighter.name} retaliated with Counter Pulse for ${rivalDmg} DMG!`,
            isPlayerAttacker: false,
          };
          const playerFloatingDmg: FloatingDamage = {
            id: `dmg_p_${Date.now()}`, text: `-${rivalDmg} HP`, isPlayerTarget: true, isCritical: false,
          };

          if (nextPlayerHp <= 0) {
            safeHaptic.error();
            const defeatLog: CombatAction = {
              id: `log_def_${Date.now()}`, turn: battle.turn, attackerName: 'SYSTEM', defenderName: user.name,
              moveName: 'DEFEAT', damageDealt: 0, isCritical: false,
              timestamp: new Date().toLocaleTimeString(),
              narrative: `💀 DEFEAT! Armor systems breached. Train reps to upgrade move mastery!`,
              isPlayerAttacker: false,
            };
            setBattle((prev) => ({
              ...prev, status: 'defeat', autoBattle: false, attackerSide: null, hitSide: 'player',
              playerFighter: { ...prev.playerFighter, currentHp: 0 },
              combatLogs: [defeatLog, rivalLog, ...prev.combatLogs],
              shakeEffect: true, slashEffect: true, floatingDamages: [playerFloatingDmg],
            }));
            setTimeout(() => {
              setModalData({ type: 'battle', title: 'COMBAT DEFEAT', subtitle: `Overpowered by ${battle.rivalFighter.name}`, xpEarned: 15, isVictory: false });
              setActiveModal('results');
            }, 500);
            return;
          }

          setBattle((prev) => ({
            ...prev,
            turn: prev.turn + 1,
            attackerSide: null,
            hitSide: 'player',
            playerFighter: { ...prev.playerFighter, currentHp: nextPlayerHp },
            combatLogs: [rivalLog, ...prev.combatLogs],
            shakeEffect: true,
            slashEffect: true,
            floatingDamages: [playerFloatingDmg],
          }));

          setTimeout(() => {
            setBattle((prev) => ({
              ...prev,
              hitSide: null,
              shakeEffect: false,
              slashEffect: false,
              floatingDamages: [],
              isAttackingAnimation: false,
            }));
          }, 400);
        }, 300);
      }, 500);
    }, 300);
  };

  useEffect(() => {
    let interval: any = null;
    if (battle.status === 'battling' && battle.autoBattle && !battle.attackerSide) {
      interval = setInterval(() => { executeCombatTurn(); }, 2200);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [battle.status, battle.autoBattle, battle.turn, battle.selectedMoveId, battle.attackerSide, moves]);

  const resetBattle = () => {
    safeHaptic.light();
    startBattle(battle.selectedRivalId);
  };

  const resetAllUserData = async () => {
    safeHaptic.warning();
    const fresh = await storageService.resetAllData();
    setUser(fresh.user);
    setMoves(fresh.moves);
    setHistory(fresh.history);
    setBattle({
      status: 'idle', turn: 1,
      playerFighter: createInitialFighter(fresh.user, fresh.moves),
      rivalFighter: createRivalFighter('boss_aegis9'),
      selectedRivalId: 'boss_aegis9', combatLogs: [], autoBattle: false,
      selectedMoveId: 'iron_kick', isAttackingAnimation: false,
      shakeEffect: false, slashEffect: false, floatingDamages: [],
      attackerSide: null, hitSide: null,
    });
  };

  return (
    <AppContext.Provider
      value={{
        user, moves, history, activeTab, activeExercise, isSimulated, battle,
        activeModal, modalData, isLoading,
        setActiveTab, setActiveExercise, toggleSimulation, openExerciseDetail, closeModal,
        recordCompletedRep, finishWorkoutSession,
        startBattle, executeCombatTurn, toggleAutoBattle, selectCombatMove, resetBattle,
        resetAllUserData, refreshUserProfile,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};