import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';

export interface RepCounterHUDProps {
  reps?: number;
  validReps?: number;
  count?: number;
  phase?: string;
  [key: string]: any;
}

export const RepCounterHUD: React.FC<RepCounterHUDProps> = (props = {}) => {
  const reps = props.reps ?? props.count ?? 0;
  const validReps = props.validReps ?? reps;
  const phase = props.phase ?? 'READY';

  return (
    <View style={styles.card}>
      <View style={styles.stat}>
        <Text style={styles.number}>{reps}</Text>
        <Text style={styles.label}>TOTAL REPS</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.stat}>
        <Text style={[styles.number, { color: '#4edf75' }]}>{validReps}</Text>
        <Text style={styles.label}>VALID FORM</Text>
      </View>
      <View style={styles.divider} />
      <View style={styles.stat}>
        <Text style={[styles.number, { color: THEME?.colors?.goldPrimary || '#d4af37', fontSize: 14 }]}>
          {phase}
        </Text>
        <Text style={styles.label}>PHASE</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: THEME?.colors?.bgSecondary || '#18181f',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME?.colors?.border || 'rgba(212, 175, 55, 0.25)',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  number: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: THEME?.colors?.textMuted || '#a1a1aa',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: THEME?.colors?.border || 'rgba(212, 175, 55, 0.25)',
  },
});