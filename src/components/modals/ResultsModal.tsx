import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { Trophy, Skull, Zap, Activity, CheckCircle2, Flame } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { CyberButton } from '../common/CyberButton';
import { RewardsData } from '../../types';

export const ResultsModal: React.FC = () => {
  const { activeModal, modalData, closeModal, setActiveTab } = useApp();

  if (activeModal !== 'results' || !modalData) {
    return null;
  }

  const rewards = modalData as RewardsData;
  const isWorkout = rewards.type === 'workout';
  const isVictory = rewards.isVictory !== false;

  const handleContinue = () => {
    closeModal();
    if (isWorkout) {
      setActiveTab('dashboard');
    }
  };

  const handleGoToArena = () => {
    closeModal();
    setActiveTab('arena');
  };

  const getHeaderIcon = () => {
    if (isWorkout) {
      return <Trophy size={48} color={THEME.colors.neonYellow} />;
    }
    return isVictory ? (
      <Trophy size={48} color={THEME.colors.neonGreen} />
    ) : (
      <Skull size={48} color={THEME.colors.electricRed} />
    );
  };

  const headerColor = isWorkout
    ? THEME.colors.neonYellow
    : isVictory
    ? THEME.colors.neonGreen
    : THEME.colors.electricRed;

  return (
    <Modal
      visible={true}
      transparent
      animationType="fade"
      onRequestClose={closeModal}
    >
      <View style={styles.backdrop}>
        <View style={[styles.modalBox, { borderColor: headerColor }]}>
          <View style={[styles.notchTL, { borderColor: headerColor }]} />
          <View style={[styles.notchBR, { borderColor: headerColor }]} />

          <View style={styles.iconWrapper}>{getHeaderIcon()}</View>

          <Text style={[styles.modalTitle, { color: headerColor }]}>
            {rewards.title}
          </Text>
          <Text style={styles.modalSubtitle}>{rewards.subtitle}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconRow}>
                <Zap size={14} color={THEME.colors.neonYellow} />
                <Text style={styles.statLabel}>EXPERIENCE</Text>
              </View>
              <Text style={[styles.statValue, { color: THEME.colors.neonYellow }]}>
                +{rewards.xpEarned} XP
              </Text>
            </View>

            {rewards.repsDone !== undefined ? (
              <View style={styles.statCard}>
                <View style={styles.statIconRow}>
                  <Activity size={14} color={THEME.colors.cyan} />
                  <Text style={styles.statLabel}>VALID REPS/HOLD</Text>
                </View>
                <Text style={[styles.statValue, { color: THEME.colors.cyan }]}>
                  {rewards.repsDone}
                </Text>
              </View>
            ) : (
              <View style={styles.statCard}>
                <View style={styles.statIconRow}>
                  <Flame size={14} color={headerColor} />
                  <Text style={styles.statLabel}>STATUS</Text>
                </View>
                <Text style={[styles.statValue, { color: headerColor }]}>
                  {isVictory ? 'VICTORY KO' : 'BREACHED'}
                </Text>
              </View>
            )}

            {rewards.accuracyScore !== undefined && (
              <View style={[styles.statCard, { width: '100%' }]}>
                <View style={styles.statIconRow}>
                  <CheckCircle2 size={14} color={THEME.colors.neonGreen} />
                  <Text style={styles.statLabel}>AVERAGE FORM SCORE</Text>
                </View>
                <Text style={[styles.statValue, { color: THEME.colors.neonGreen }]}>
                  {rewards.accuracyScore}%
                </Text>
              </View>
            )}
          </View>

          {rewards.moveUpgrades && rewards.moveUpgrades.length > 0 && (
            <View style={styles.upgradesBox}>
              <Text style={styles.upgradesTitle}>COMBAT MASTERY UPGRADES</Text>
              {rewards.moveUpgrades.map((upg, idx) => (
                <View key={idx} style={styles.upgradeRow}>
                  <Text style={styles.upgradeName}>{upg.name}</Text>
                  <Text style={styles.upgradeVal}>
                    {upg.oldMastery}% → <Text style={{ color: THEME.colors.neonGreen }}>{upg.newMastery}%</Text>
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.buttonGroup}>
            <CyberButton
              title="CLAIM REWARDS & SYNC"
              variant={isVictory || isWorkout ? 'cyan' : 'crimson'}
              size="lg"
              onPress={handleContinue}
              style={{ width: '100%' }}
            />

            {isWorkout && (
              <CyberButton
                title="DEPLOY TO AI COMBAT ARENA"
                variant="yellow"
                size="md"
                onPress={handleGoToArena}
                style={{ width: '100%', marginTop: 8 }}
              />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 23, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: THEME.spacing.lg,
  },
  modalBox: {
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 2,
    width: '100%',
    maxWidth: 380,
    padding: THEME.spacing.lg,
    alignItems: 'center',
    position: 'relative',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 18,
    elevation: 8,
  },
  notchTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 14,
    height: 14,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  notchBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  iconWrapper: {
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    minWidth: 120,
    backgroundColor: THEME.colors.bgCardElevated,
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1,
    borderColor: THEME.colors.bgCardBorder,
    padding: 10,
    alignItems: 'center',
  },
  statIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
  },
  upgradesBox: {
    width: '100%',
    backgroundColor: 'rgba(0, 255, 102, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
    borderRadius: THEME.borderRadius.md,
    padding: 10,
    marginBottom: 16,
  },
  upgradesTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: THEME.colors.neonGreen,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  upgradeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upgradeName: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  upgradeVal: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.colors.textSecondary,
  },
  buttonGroup: {
    width: '100%',
    marginTop: 4,
  },
});
