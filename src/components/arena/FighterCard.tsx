import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Shield, Heart, Zap } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { Fighter, FloatingDamage } from '../../types';

interface FighterCardProps {
  fighter: Fighter;
  isPlayer: boolean;
  isAttacking?: boolean;
  floatingDamages?: FloatingDamage[];
}

export const FighterCard: React.FC<FighterCardProps> = ({
  fighter,
  isPlayer,
  isAttacking = false,
  floatingDamages = [],
}) => {
  const hpPercent = Math.max(0, Math.min(100, (fighter.currentHp / fighter.maxHp) * 100));

  // Animated HP Bar Width
  const animatedHp = useRef(new Animated.Value(hpPercent)).current;

  // Floating damage animation
  const floatAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedHp, {
      toValue: hpPercent,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [hpPercent]);

  const targetDamages = floatingDamages.filter((d) => d.isPlayerTarget === isPlayer);

  useEffect(() => {
    if (targetDamages.length > 0) {
      floatAnim.setValue(0);
      opacityAnim.setValue(1);
      Animated.parallel([
        Animated.timing(floatAnim, {
          toValue: -32,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [targetDamages.length]);

  let hpColor = THEME.colors.neonGreen;
  if (hpPercent <= 30) {
    hpColor = THEME.colors.electricRed;
  } else if (hpPercent <= 60) {
    hpColor = THEME.colors.neonYellow;
  }

  const borderColor = isPlayer ? THEME.colors.cyan : THEME.colors.purple;

  const widthInterpolated = animatedHp.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.card, { borderColor }, isAttacking && styles.attacking]}>
      {/* Floating Damage Number Overlay */}
      {targetDamages.map((dmg) => (
        <Animated.View
          key={dmg.id}
          style={[
            styles.floatingDmgBox,
            {
              opacity: opacityAnim,
              transform: [{ translateY: floatAnim }, { scale: dmg.isCritical ? 1.25 : 1 }],
            },
          ]}
        >
          <Text
            style={[
              styles.floatingDmgText,
              { color: dmg.isCritical ? THEME.colors.neonYellow : THEME.colors.electricRed },
            ]}
          >
            {dmg.text}
          </Text>
        </Animated.View>
      ))}

      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={[styles.badgeText, { color: borderColor }]}>
            {isPlayer ? 'CYBER GLADIATOR' : 'RIVAL COMBAT AI'}
          </Text>
        </View>
        <View style={styles.lvlBadge}>
          <Shield size={10} color={THEME.colors.textSecondary} />
          <Text style={styles.lvlText}>LVL {fighter.level}</Text>
        </View>
      </View>

      {/* Fighter Avatar & Identity */}
      <View style={styles.fighterInfo}>
        <View style={[styles.avatarCircle, { borderColor, shadowColor: borderColor }]}>
          <Text style={styles.avatarEmoji}>{fighter.avatar}</Text>
        </View>
        <View style={styles.nameGroup}>
          <Text style={styles.fighterName} numberOfLines={1}>
            {fighter.name}
          </Text>
          <Text style={styles.fighterTitle} numberOfLines={1}>
            {fighter.title}
          </Text>
        </View>
      </View>

      {/* Animated Smooth Draining Health Bar */}
      <View style={styles.hpSection}>
        <View style={styles.hpHeader}>
          <View style={styles.hpIconGroup}>
            <Heart size={12} color={hpColor} fill={hpColor} />
            <Text style={styles.hpLabel}>SHIELD HEALTH</Text>
          </View>
          <Text style={[styles.hpValue, { color: hpColor }]}>
            {fighter.currentHp} / {fighter.maxHp} HP
          </Text>
        </View>

        {/* Animated Bar Track */}
        <View style={styles.hpTrack}>
          <Animated.View
            style={[
              styles.hpFill,
              {
                width: widthInterpolated,
                backgroundColor: hpColor,
                shadowColor: hpColor,
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1.5,
    padding: THEME.spacing.md,
    flex: 1,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
  },
  attacking: {
    transform: [{ scale: 1.04 }],
    shadowOpacity: 0.9,
    shadowRadius: 14,
  },
  floatingDmgBox: {
    position: 'absolute',
    top: 6,
    alignSelf: 'center',
    zIndex: 99,
    backgroundColor: 'rgba(10, 14, 23, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.electricRed,
  },
  floatingDmgText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  lvlBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  lvlText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.textSecondary,
  },
  fighterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: THEME.colors.bgCardElevated,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  nameGroup: {
    flex: 1,
  },
  fighterName: {
    fontSize: 15,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    letterSpacing: 0.5,
  },
  fighterTitle: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
  hpSection: {
    marginTop: 2,
  },
  hpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  hpIconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  hpLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: THEME.colors.textMuted,
    letterSpacing: 0.5,
  },
  hpValue: {
    fontSize: 11,
    fontWeight: '900',
  },
  hpTrack: {
    width: '100%',
    height: 8,
    backgroundColor: '#1A2333',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hpFill: {
    height: '100%',
    borderRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
});
