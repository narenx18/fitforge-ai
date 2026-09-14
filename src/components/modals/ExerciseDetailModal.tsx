import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { X, Target, Zap, ShieldCheck } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { CyberButton } from '../common/CyberButton';
import { ExerciseConfig } from '../../types';

export const ExerciseDetailModal: React.FC = () => {
  const { activeModal, modalData, closeModal, setActiveExercise, setActiveTab } = useApp();

  if (activeModal !== 'exercise_detail' || !modalData) {
    return null;
  }

  const exercise = modalData as ExerciseConfig;

  const handleStartWorkout = () => {
    setActiveExercise(exercise.slug);
    closeModal();
    setActiveTab('workout');
  };

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={closeModal}>
      <View style={styles.backdrop}>
        <View style={[styles.modalBox, { borderColor: exercise.color }]}>
          {/* Header Bar */}
          <View style={styles.headerRow}>
            <View style={styles.titleArea}>
              <Text style={[styles.categoryLabel, { color: exercise.color }]}>
                {exercise.category.toUpperCase()}
              </Text>
              <Text style={styles.exerciseTitle}>{exercise.name}</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
              <X size={18} color={THEME.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <Text style={styles.descriptionText}>{exercise.description}</Text>

            {/* Target Muscle Groups */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Target size={14} color={THEME.colors.cyan} />
                <Text style={styles.sectionTitle}>TARGET MUSCLE ACTIVATION</Text>
              </View>
              <View style={styles.musclePillWrap}>
                {exercise.targetMuscles.map((muscle, idx) => (
                  <View key={idx} style={styles.musclePill}>
                    <Text style={styles.musclePillText}>{muscle}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Joint Angle Criteria Card */}
            <View style={styles.angleGuideCard}>
              <View style={styles.sectionHeader}>
                <ShieldCheck size={14} color={THEME.colors.neonGreen} />
                <Text style={[styles.sectionTitle, { color: THEME.colors.neonGreen }]}>
                  POSE ANGLE DETECTION CRITERIA
                </Text>
              </View>
              <View style={styles.angleRow}>
                <View style={styles.angleItem}>
                  <Text style={styles.angleVal}>
                    {exercise.isTimed ? '≥ 160°' : `≤ ${exercise.targetAngleDown}°`}
                  </Text>
                  <Text style={styles.angleDesc}>
                    {exercise.isTimed ? 'Rigid Alignment' : 'Flexion (Bottom Rep)'}
                  </Text>
                </View>
                <View style={styles.angleDivider} />
                <View style={styles.angleItem}>
                  <Text style={styles.angleVal}>
                    {exercise.isTimed ? 'Hold' : `≥ ${exercise.targetAngleUp}°`}
                  </Text>
                  <Text style={styles.angleDesc}>
                    {exercise.isTimed ? 'Isometric Hold' : 'Extension (Top Rep)'}
                  </Text>
                </View>
              </View>
              <Text style={styles.formDetailText}>{exercise.properFormDescription}</Text>
            </View>

            {/* Combat Power Unlock */}
            <View style={styles.unlockCard}>
              <View style={styles.sectionHeader}>
                <Zap size={14} color={THEME.colors.neonYellow} />
                <Text style={[styles.sectionTitle, { color: THEME.colors.neonYellow }]}>
                  COMBAT MOVE UNLOCK PROTOCOL
                </Text>
              </View>
              <Text style={styles.unlockText}>
                Complete <Text style={{ color: '#FFFFFF', fontWeight: '900' }}>{exercise.unlockRequirementReps} {exercise.isTimed ? 'seconds' : 'valid reps'}</Text> to arm your combat moves!
              </Text>
            </View>
          </ScrollView>

          {/* Action Button */}
          <CyberButton
            title={`TRAIN ${exercise.name.toUpperCase()}`}
            variant="cyan"
            size="lg"
            onPress={handleStartWorkout}
            style={styles.actionBtn}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 14, 23, 0.88)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: THEME.colors.bgCard,
    borderTopLeftRadius: THEME.borderRadius.xl,
    borderTopRightRadius: THEME.borderRadius.xl,
    borderTopWidth: 2,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    maxHeight: '85%',
    padding: THEME.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleArea: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  exerciseTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: THEME.borderRadius.full,
    backgroundColor: THEME.colors.bgCardElevated,
  },
  scrollArea: {
    marginVertical: 8,
  },
  descriptionText: {
    fontSize: 13,
    color: THEME.colors.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME.colors.textSecondary,
    letterSpacing: 0.8,
  },
  musclePillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  musclePill: {
    backgroundColor: THEME.colors.bgCardElevated,
    borderWidth: 1,
    borderColor: THEME.colors.bgCardBorder,
    borderRadius: THEME.borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  musclePillText: {
    fontSize: 11,
    color: THEME.colors.textPrimary,
    fontWeight: '700',
  },
  angleGuideCard: {
    backgroundColor: 'rgba(0, 255, 102, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 102, 0.3)',
    borderRadius: THEME.borderRadius.md,
    padding: 12,
    marginBottom: 16,
  },
  angleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  angleItem: {
    alignItems: 'center',
  },
  angleVal: {
    fontSize: 18,
    fontWeight: '900',
    color: THEME.colors.neonGreen,
  },
  angleDesc: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  angleDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(0, 255, 102, 0.2)',
  },
  formDetailText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
    marginTop: 6,
  },
  unlockCard: {
    backgroundColor: 'rgba(255, 230, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 230, 0, 0.3)',
    borderRadius: THEME.borderRadius.md,
    padding: 12,
    marginBottom: 16,
  },
  unlockText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    lineHeight: 16,
  },
  actionBtn: {
    marginTop: 8,
    width: '100%',
  },
});
