import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../../constants/theme';

export interface AngleGaugeHUDProps {
  angle?: number;
  targetAngle?: number;
  label?: string;
  targetDepthReached?: boolean;
  [key: string]: any; // Allow extra props safely
}

export const AngleGaugeHUD: React.FC<AngleGaugeHUDProps> = (props = {}) => {
  // Extract props with safe default fallbacks so undefined properties never crash render
  const angle = props.angle ?? 170;
  const targetAngle = props.targetAngle ?? 90;
  const label = props.label ?? 'KNEE ANGLE';
  const targetDepthReached = props.targetDepthReached ?? (angle <= targetAngle);

  return (
    <View style={styles.container}>
      <View style={[styles.gaugeRing, targetDepthReached && styles.gaugeRingActive]}>
        <Text style={styles.angleText}>{Math.round(angle)}°</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
      {targetDepthReached && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>TARGET DEPTH</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  gaugeRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: THEME?.colors?.border || 'rgba(212, 175, 55, 0.3)',
    backgroundColor: '#121218',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeRingActive: {
    borderColor: '#4edf75',
    boxShadow: '0px 0px 12px rgba(78, 223, 117, 0.4)',
  },
  angleText: {
    fontSize: 40,
    fontWeight: '900',
    color: THEME?.colors?.goldPrimary || '#d4af37',
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME?.colors?.textMuted || '#a1a1aa',
    marginTop: 4,
    letterSpacing: 1,
  },
  badge: {
    backgroundColor: '#4edf75',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  badgeText: {
    color: '#0a0a0c',
    fontSize: 10,
    fontWeight: '900',
  },
});