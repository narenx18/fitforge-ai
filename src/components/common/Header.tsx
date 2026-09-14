import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Flame, Shield, Zap, RotateCcw } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { CHARACTER_CLASSES } from '../../constants/characters';
import { ProgressBar } from './ProgressBar';

export const Header: React.FC = () => {
  const { user, resetAllUserData, setActiveTab } = useApp();

  const xpProgress = Math.min(100, Math.round((user.currentLevelXp / user.nextLevelXpThreshold) * 100));
  const character = CHARACTER_CLASSES[user.characterClass] || CHARACTER_CLASSES.titan;

  const handleResetPress = () => {
    Alert.alert(
      'RESET SYSTEM TELEMETRY',
      'Reset all XP, Reps, and historical data to 0?',
      [
        { text: 'CANCEL', style: 'cancel' },
        { text: 'RESET DATA', style: 'destructive', onPress: resetAllUserData },
      ]
    );
  };

  return (
    <View style={styles.header}>
      {/* Top Bar: Title & Avatar/Streak */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.titleContainer}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.8}
        >
          <View style={styles.appNameRow}>
            <Text style={styles.avatarEmoji}>{character.avatar}</Text>
            <Text style={styles.appName}>
              FITFORGE<Text style={styles.appNameAccent}> AI</Text>
            </Text>
          </View>
          <View style={styles.badgeRow}>
            <Shield size={11} color={character.color} />
            <Text style={[styles.levelBadge, { color: character.color }]}>
              LVL {user.level} // {character.name.toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.rightStats}>
          {/* Radiant Amber/Fire Gold Streak Counter */}
          <View style={styles.streakBadge}>
            <Flame size={14} color={THEME.colors.streakFire} fill={THEME.colors.streakFire} />
            <Text style={styles.streakText}>{user.streakDays}D STREAK</Text>
          </View>

          {/* Reset Action */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetPress}
            activeOpacity={0.7}
          >
            <RotateCcw size={13} color={THEME.colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Level XP Progress Bar (Neon Yellow) */}
      <View style={styles.xpContainer}>
        <View style={styles.xpTextRow}>
          <View style={styles.xpLabelGroup}>
            <Zap size={10} color={THEME.colors.neonYellow} />
            <Text style={styles.xpLabel}>OVERCLOCK XP</Text>
          </View>
          <Text style={styles.xpValues}>
            {user.currentLevelXp} / {user.nextLevelXpThreshold} XP
          </Text>
        </View>
        <ProgressBar
          progress={xpProgress}
          height={5}
          color={THEME.colors.neonYellow}
          backgroundColor="#1A2333"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: THEME.colors.bgDark,
    paddingHorizontal: THEME.spacing.md,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: THEME.colors.bgCardBorder,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleContainer: {
    flex: 1,
  },
  appNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  avatarEmoji: {
    fontSize: 18,
  },
  appName: {
    fontSize: 19,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    letterSpacing: 1.2,
  },
  appNameAccent: {
    color: THEME.colors.cyan,
    textShadowColor: THEME.colors.cyanGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
    gap: 4,
  },
  levelBadge: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  rightStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.streakGlow,
    borderWidth: 1,
    borderColor: THEME.colors.streakFire,
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 3,
  },
  streakText: {
    color: THEME.colors.streakFire,
    fontSize: 10,
    fontWeight: '900',
  },
  resetButton: {
    padding: 6,
    borderRadius: THEME.borderRadius.sm,
    backgroundColor: THEME.colors.bgCard,
    borderWidth: 1,
    borderColor: THEME.colors.bgCardBorder,
  },
  xpContainer: {
    marginTop: 1,
  },
  xpTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  xpLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  xpLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.neonYellow,
    letterSpacing: 0.5,
  },
  xpValues: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
});
