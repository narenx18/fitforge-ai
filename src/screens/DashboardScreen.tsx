import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  Flame,
  Activity,
  CheckCircle2,
  Clock,
  Swords,
  Zap,
  Target,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Shield,
} from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { CyberCard } from '../components/common/CyberCard';
import { CyberButton } from '../components/common/CyberButton';
import { ExerciseType } from '../types';

export const DashboardScreen: React.FC = () => {
  const { user, moves, history, setActiveTab, setActiveExercise } = useApp();

  const unlockedMovesCount = moves.filter((m) => m.unlocked).length;
  const recentSession = history.length > 0 ? history[0] : null;

  const handleStartWorkout = (slug: ExerciseType) => {
    setActiveExercise(slug);
    setActiveTab('workout');
  };

  const totalRepsAllTime =
    user.totalSquatsAllTime +
    user.totalPushupsAllTime +
    (user.totalLungesAllTime || 0) +
    (user.totalJacksAllTime || 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Primary Goal Banner */}
      <CyberCard style={styles.goalCard} borderColor={THEME.colors.cyan} glow>
        <View style={styles.goalHeader}>
          <View style={styles.goalTag}>
            <Target size={12} color={THEME.colors.cyan} />
            <Text style={styles.goalTagText}>PRIMARY COMBAT OBJECTIVE</Text>
          </View>
          <Text style={styles.biometricsText}>
            {user.weightKg}KG // {user.heightCm}CM
          </Text>
        </View>
        <Text style={styles.goalTitle}>{user.targetGoal}</Text>

        <View style={styles.statsRowMini}>
          <View style={styles.miniStat}>
            <Text style={styles.miniVal}>{totalRepsAllTime}</Text>
            <Text style={styles.miniLbl}>TOTAL REPS</Text>
          </View>
          <View style={styles.miniDivider} />
          <View style={styles.miniStat}>
            <Text style={styles.miniVal}>{user.totalPlankSecondsAllTime || 0}S</Text>
            <Text style={styles.miniLbl}>PLANK HOLD</Text>
          </View>
          <View style={styles.miniDivider} />
          <View style={styles.miniStat}>
            <Text style={[styles.miniVal, { color: THEME.colors.neonYellow }]}>
              {unlockedMovesCount}/{moves.length}
            </Text>
            <Text style={styles.miniLbl}>ARMED MOVES</Text>
          </View>
        </View>
      </CyberCard>

      {/* 4-Item Daily Metrics Telemetry Grid */}
      <View style={styles.sectionHeader}>
        <TrendingUp size={14} color={THEME.colors.cyan} />
        <Text style={styles.sectionTitle}>TODAY'S TELEMETRY GRID</Text>
      </View>

      <View style={styles.metricsGrid}>
        {/* Metric 1: Active Calories */}
        <CyberCard style={styles.metricCard} borderColor={THEME.colors.border}>
          <View style={styles.metricIconRow}>
            <Flame size={18} color={THEME.colors.streakFire} />
            <Text style={styles.metricLabel}>CALORIES</Text>
          </View>
          <Text style={[styles.metricValue, { color: THEME.colors.streakFire }]}>
            {user.todayStats.calories}
          </Text>
          <Text style={styles.metricSub}>KCAL BURNED</Text>
        </CyberCard>

        {/* Metric 2: Total Reps Today */}
        <CyberCard style={styles.metricCard} borderColor={THEME.colors.border}>
          <View style={styles.metricIconRow}>
            <Activity size={18} color={THEME.colors.goldLight} />
            <Text style={styles.metricLabel}>TOTAL REPS</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#F3E5AB' }]}>
            {user.todayStats.reps}
          </Text>
          <Text style={styles.metricSub}>KINETIC REPS</Text>
        </CyberCard>

        {/* Metric 3: Form Accuracy % */}
        <CyberCard style={styles.metricCard} borderColor={THEME.colors.border}>
          <View style={styles.metricIconRow}>
            <CheckCircle2 size={18} color={THEME.colors.btnAccentEmerald} />
            <Text style={styles.metricLabel}>FORM SCORE</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#10B981' }]}>
            {user.todayStats.avgAccuracy}%
          </Text>
          <Text style={styles.metricSub}>JOINT ACCURACY</Text>
        </CyberCard>

        {/* Metric 4: Workout Time */}
        <CyberCard style={styles.metricCard} borderColor={THEME.colors.border}>
          <View style={styles.metricIconRow}>
            <Clock size={18} color={THEME.colors.goldPrimary} />
            <Text style={styles.metricLabel}>ACTIVE TIME</Text>
          </View>
          <Text style={[styles.metricValue, { color: '#F5F5F7' }]}>
            {user.todayStats.activeMinutes}M
          </Text>
          <Text style={styles.metricSub}>SESSION TIME</Text>
        </CyberCard>
      </View>

      {/* Rapid Deployment Exercise Launchers */}
      <View style={styles.sectionHeader}>
        <Zap size={14} color={THEME.colors.neonYellow} />
        <Text style={[styles.sectionTitle, { color: THEME.colors.neonYellow }]}>
          RAPID TRAINING DEPLOYMENT (5 EXERCISES)
        </Text>
      </View>

      <View style={styles.quickLaunchDeck}>
        {/* Squats */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.launchCard}
          onPress={() => handleStartWorkout('squat')}
        >
          <View style={styles.launchLeft}>
            <View style={[styles.launchIconBox, { backgroundColor: 'rgba(0, 240, 255, 0.15)' }]}>
              <Activity size={20} color={THEME.colors.cyan} />
            </View>
            <View>
              <Text style={styles.launchTitle}>Forge Squats</Text>
              <Text style={styles.launchDesc}>Powers "Iron Kick" & "Cyber Uppercut"</Text>
            </View>
          </View>
          <ChevronRight size={18} color={THEME.colors.cyan} />
        </TouchableOpacity>

        {/* Push-ups */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.launchCard}
          onPress={() => handleStartWorkout('pushup')}
        >
          <View style={styles.launchLeft}>
            <View style={[styles.launchIconBox, { backgroundColor: 'rgba(255, 0, 85, 0.15)' }]}>
              <Zap size={20} color={THEME.colors.electricRed} />
            </View>
            <View>
              <Text style={styles.launchTitle}>Titan Push-ups</Text>
              <Text style={styles.launchDesc}>Powers "Titan Punch" & "Forge Blast"</Text>
            </View>
          </View>
          <ChevronRight size={18} color={THEME.colors.electricRed} />
        </TouchableOpacity>

        {/* Lunges */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.launchCard}
          onPress={() => handleStartWorkout('lunge')}
        >
          <View style={styles.launchLeft}>
            <View style={[styles.launchIconBox, { backgroundColor: 'rgba(255, 230, 0, 0.15)' }]}>
              <Flame size={20} color={THEME.colors.neonYellow} />
            </View>
            <View>
              <Text style={styles.launchTitle}>Volt Lunges</Text>
              <Text style={styles.launchDesc}>Powers "Thunder Stride" strike power</Text>
            </View>
          </View>
          <ChevronRight size={18} color={THEME.colors.neonYellow} />
        </TouchableOpacity>

        {/* Jumping Jacks */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.launchCard}
          onPress={() => handleStartWorkout('jumping_jack')}
        >
          <View style={styles.launchLeft}>
            <View style={[styles.launchIconBox, { backgroundColor: 'rgba(0, 255, 102, 0.15)' }]}>
              <Sparkles size={20} color={THEME.colors.neonGreen} />
            </View>
            <View>
              <Text style={styles.launchTitle}>Hyper Jumping Jacks</Text>
              <Text style={styles.launchDesc}>Powers "Nova Burst" radial strike</Text>
            </View>
          </View>
          <ChevronRight size={18} color={THEME.colors.neonGreen} />
        </TouchableOpacity>

        {/* Plank Hold */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.launchCard}
          onPress={() => handleStartWorkout('plank')}
        >
          <View style={styles.launchLeft}>
            <View style={[styles.launchIconBox, { backgroundColor: 'rgba(176, 38, 255, 0.15)' }]}>
              <Shield size={20} color={THEME.colors.purple} />
            </View>
            <View>
              <Text style={styles.launchTitle}>Aegis Plank Hold</Text>
              <Text style={styles.launchDesc}>Powers "Aegis Barrier" defense shield</Text>
            </View>
          </View>
          <ChevronRight size={18} color={THEME.colors.purple} />
        </TouchableOpacity>
      </View>

      {/* AI Battle Arena Banner CTA */}
      <CyberCard
        style={styles.arenaBannerCard}
        borderColor={unlockedMovesCount > 0 ? THEME.colors.purple : THEME.colors.bgCardBorder}
        glow={unlockedMovesCount > 0}
      >
        <View style={styles.arenaBannerContent}>
          <View style={styles.arenaTag}>
            <Swords size={12} color={THEME.colors.purple} />
            <Text style={styles.arenaTagText}>AUTOMATED AI BATTLE ARENA</Text>
          </View>
          <Text style={styles.arenaHeadline}>Test Form Power Against AI Rivals</Text>
          <Text style={styles.arenaSub}>
            {unlockedMovesCount > 0
              ? `${unlockedMovesCount} combat protocols armed and ready.`
              : 'Complete 10 reps of any exercise to arm combat moves!'}
          </Text>
          <CyberButton
            title="ENTER COMBAT ARENA"
            variant={unlockedMovesCount > 0 ? 'purple' : 'outline'}
            size="md"
            icon={<Swords size={16} color="#FFFFFF" />}
            onPress={() => setActiveTab('arena')}
            style={{ marginTop: 12 }}
          />
        </View>
      </CyberCard>

      {/* Recent Session Preview if any */}
      {recentSession && (
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Clock size={14} color={THEME.colors.textSecondary} />
            <Text style={styles.sectionTitle}>LATEST COMPLETED SESSION</Text>
          </View>
          <CyberCard style={styles.recentCard}>
            <View style={styles.recentRow}>
              <View>
                <Text style={styles.recentTitle}>{recentSession.exerciseName}</Text>
                <Text style={styles.recentDate}>{recentSession.dateString}</Text>
              </View>
              <View style={styles.recentStats}>
                <Text style={styles.recentReps}>{recentSession.validReps} REPS</Text>
                <Text style={styles.recentAccuracy}>{recentSession.avgFormScore}% SCORE</Text>
              </View>
            </View>
          </CyberCard>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bgDark,
  },
  content: {
    padding: THEME.spacing.md,
    paddingBottom: 40,
  },
  goalCard: {
    marginBottom: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  goalTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: THEME.colors.cyan,
    letterSpacing: 0.8,
  },
  biometricsText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.textMuted,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statsRowMini: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.colors.bgCardElevated,
    borderRadius: THEME.borderRadius.md,
    padding: 8,
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
  },
  miniVal: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  miniLbl: {
    fontSize: 8,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  miniDivider: {
    width: 1,
    height: 20,
    backgroundColor: THEME.colors.bgCardBorder,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME.colors.textSecondary,
    letterSpacing: 0.8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    padding: 12,
  },
  metricIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  metricSub: {
    fontSize: 8,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  quickLaunchDeck: {
    gap: 8,
    marginBottom: 16,
  },
  launchCard: {
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: THEME.colors.bgCardBorder,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  launchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  launchIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  launchTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  launchDesc: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  arenaBannerCard: {
    padding: 14,
  },
  arenaBannerContent: {
    width: '100%',
  },
  arenaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  arenaTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: THEME.colors.purple,
    letterSpacing: 0.8,
  },
  arenaHeadline: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  arenaSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  recentSection: {
    marginTop: 4,
  },
  recentCard: {
    padding: 12,
  },
  recentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  recentDate: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  recentStats: {
    alignItems: 'flex-end',
  },
  recentReps: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME.colors.cyan,
  },
  recentAccuracy: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.neonGreen,
    marginTop: 2,
  },
});
