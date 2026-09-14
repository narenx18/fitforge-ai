import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import {
  History,
  Activity,
  Zap,
  Calendar,
  Award,
  Trash2,
  Flame,
  Sparkles,
  Shield,
} from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { CyberCard } from '../components/common/CyberCard';
import { WorkoutSession, ExerciseType } from '../types';

export const HistoryScreen: React.FC = () => {
  const { history, user, resetAllUserData } = useApp();
  const [filter, setFilter] = useState<'all' | ExerciseType>('all');

  const filteredHistory = history.filter((session) => {
    if (filter === 'all') return true;
    return session.exerciseType === filter;
  });

  const lifetimeReps =
    user.totalSquatsAllTime +
    user.totalPushupsAllTime +
    (user.totalLungesAllTime || 0) +
    (user.totalJacksAllTime || 0);

  const avgOverallAccuracy =
    history.length > 0
      ? Math.round(history.reduce((sum, s) => sum + s.avgFormScore, 0) / history.length)
      : 0;

  const handleConfirmReset = () => {
    Alert.alert(
      'RESET SYSTEM TELEMETRY',
      'Reset all workout history, XP, and unlocked moves to zero?',
      [
        { text: 'CANCEL', style: 'cancel' },
        { text: 'CONFIRM RESET', style: 'destructive', onPress: resetAllUserData },
      ]
    );
  };

  const getExerciseIcon = (type: ExerciseType) => {
    switch (type) {
      case 'squat':
        return <Activity size={16} color={THEME.colors.cyan} />;
      case 'pushup':
        return <Zap size={16} color={THEME.colors.electricRed} />;
      case 'lunge':
        return <Flame size={16} color={THEME.colors.neonYellow} />;
      case 'jumping_jack':
        return <Sparkles size={16} color={THEME.colors.neonGreen} />;
      case 'plank':
      default:
        return <Shield size={16} color={THEME.colors.purple} />;
    }
  };

  const renderSessionItem = ({ item }: { item: WorkoutSession }) => {
    return (
      <CyberCard style={styles.sessionCard} borderColor={THEME.colors.bgCardBorder}>
        <View style={styles.cardTopRow}>
          <View style={styles.titleWithIcon}>
            <View style={styles.typeIconBox}>
              {getExerciseIcon(item.exerciseType)}
            </View>
            <View>
              <Text style={styles.sessionName}>{item.exerciseName}</Text>
              <View style={styles.dateRow}>
                <Calendar size={10} color={THEME.colors.textMuted} />
                <Text style={styles.dateText}>{item.dateString}</Text>
              </View>
            </View>
          </View>

          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>+{item.xpEarned} XP</Text>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.sessionMetric}>
            <Text style={styles.metricVal}>{item.validReps}</Text>
            <Text style={styles.metricLbl}>
              {item.exerciseType === 'plank' ? 'HOLD SECS' : 'VALID REPS'}
            </Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.sessionMetric}>
            <Text style={[styles.metricVal, { color: THEME.colors.neonGreen }]}>
              {item.avgFormScore}%
            </Text>
            <Text style={styles.metricLbl}>FORM SCORE</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.sessionMetric}>
            <Text style={[styles.metricVal, { color: THEME.colors.neonYellow }]}>
              {item.caloriesBurned}
            </Text>
            <Text style={styles.metricLbl}>KCAL</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.sessionMetric}>
            <Text style={styles.metricVal}>{Math.round(item.durationSeconds / 60)}M</Text>
            <Text style={styles.metricLbl}>DURATION</Text>
          </View>
        </View>
      </CyberCard>
    );
  };

  const filterTabs: { id: 'all' | ExerciseType; label: string }[] = [
    { id: 'all', label: 'ALL' },
    { id: 'squat', label: 'SQUATS' },
    { id: 'pushup', label: 'PUSH-UPS' },
    { id: 'lunge', label: 'LUNGES' },
    { id: 'jumping_jack', label: 'JACKS' },
    { id: 'plank', label: 'PLANK' },
  ];

  return (
    <View style={styles.container}>
      {/* Lifetime Telemetry Summary Banner */}
      <CyberCard style={styles.summaryCard} borderColor={THEME.colors.cyan}>
        <View style={styles.summaryHeader}>
          <Award size={14} color={THEME.colors.cyan} />
          <Text style={styles.summaryTag}>LIFETIME TRAINING TELEMETRY</Text>
        </View>

        <View style={styles.lifetimeGrid}>
          <View style={styles.lifeItem}>
            <Text style={styles.lifeVal}>{user.totalXp}</Text>
            <Text style={styles.lifeLbl}>TOTAL XP</Text>
          </View>
          <View style={styles.lifeItem}>
            <Text style={styles.lifeVal}>{lifetimeReps}</Text>
            <Text style={styles.lifeLbl}>TOTAL REPS</Text>
          </View>
          <View style={styles.lifeItem}>
            <Text style={[styles.lifeVal, { color: THEME.colors.neonGreen }]}>{avgOverallAccuracy}%</Text>
            <Text style={styles.lifeLbl}>AVG ACCURACY</Text>
          </View>
          <View style={styles.lifeItem}>
            <Text style={styles.lifeVal}>{history.length}</Text>
            <Text style={styles.lifeLbl}>SESSIONS</Text>
          </View>
        </View>
      </CyberCard>

      {/* Filter Tabs & Reset Action */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterTabs}>
          {filterTabs.map((t) => (
            <TouchableOpacity
              key={t.id}
              activeOpacity={0.7}
              onPress={() => setFilter(t.id)}
              style={[styles.filterChip, filter === t.id && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === t.id && styles.filterChipTextActive,
                ]}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.resetIconBtn}
          onPress={handleConfirmReset}
          activeOpacity={0.7}
        >
          <Trash2 size={15} color={THEME.colors.electricRed} />
        </TouchableOpacity>
      </View>

      {/* FlatList */}
      <FlatList
        data={filteredHistory}
        keyExtractor={(item) => item.id}
        renderItem={renderSessionItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <History size={40} color={THEME.colors.textMuted} />
            <Text style={styles.emptyTitle}>NO WORKOUT LOGS RECORDED YET</Text>
            <Text style={styles.emptySub}>
              Start a camera or simulator workout session to record kinetic telemetry logs.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bgDark,
    padding: THEME.spacing.md,
  },
  summaryCard: {
    marginBottom: 12,
    padding: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  summaryTag: {
    fontSize: 9,
    fontWeight: '900',
    color: THEME.colors.cyan,
    letterSpacing: 0.8,
  },
  lifetimeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: THEME.colors.bgCardElevated,
    borderRadius: THEME.borderRadius.md,
    padding: 10,
  },
  lifeItem: {
    alignItems: 'center',
    flex: 1,
  },
  lifeVal: {
    fontSize: 16,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  lifeLbl: {
    fontSize: 8,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.bgCard,
    borderWidth: 1,
    borderColor: THEME.colors.bgCardBorder,
  },
  filterChipActive: {
    backgroundColor: THEME.colors.cyan,
    borderColor: THEME.colors.cyanLight,
  },
  filterChipText: {
    fontSize: 9,
    fontWeight: '900',
    color: THEME.colors.textSecondary,
    letterSpacing: 0.5,
  },
  filterChipTextActive: {
    color: '#002B33',
  },
  resetIconBtn: {
    padding: 7,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.bgCard,
    borderWidth: 1,
    borderColor: THEME.colors.bgCardBorder,
  },
  listContainer: {
    paddingBottom: 40,
    gap: 10,
  },
  sessionCard: {
    padding: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionName: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dateText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
  },
  xpBadge: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderWidth: 1,
    borderColor: THEME.colors.cyan,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.full,
  },
  xpText: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME.colors.cyan,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: THEME.colors.bgCardElevated,
    borderRadius: THEME.borderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  sessionMetric: {
    alignItems: 'center',
    flex: 1,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  metricLbl: {
    fontSize: 7,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: THEME.colors.bgCardBorder,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: THEME.colors.textSecondary,
    letterSpacing: 0.8,
  },
  emptySub: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    textAlign: 'center',
    maxWidth: 250,
  },
});
