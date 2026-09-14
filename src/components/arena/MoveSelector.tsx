import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Footprints, ShieldAlert, Flame, Zap, Swords, Lock, Shield, Sparkles } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { CombatMove } from '../../types';

interface MoveSelectorProps {
  moves: CombatMove[];
  selectedMoveId: string;
  onSelectMove: (id: string) => void;
  disabled?: boolean;
}

export const MoveSelector: React.FC<MoveSelectorProps> = ({
  moves,
  selectedMoveId,
  onSelectMove,
  disabled = false,
}) => {
  const getIcon = (iconName: string, color: string) => {
    const size = 16;
    switch (iconName) {
      case 'Footprints':
        return <Footprints size={size} color={color} />;
      case 'ShieldAlert':
        return <ShieldAlert size={size} color={color} />;
      case 'Flame':
        return <Flame size={size} color={color} />;
      case 'Zap':
        return <Zap size={size} color={color} />;
      case 'Shield':
        return <Shield size={size} color={color} />;
      case 'Sparkles':
        return <Sparkles size={size} color={color} />;
      case 'Swords':
      default:
        return <Swords size={size} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerLabel}>ARMED COMBAT PROTOCOLS (SELECT MOVE)</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {moves.map((move) => {
          const isSelected = move.id === selectedMoveId;
          const isLocked = !move.unlocked;
          const calculatedDmg = Math.round(move.baseDamage * (1 + (move.masteryPercent / 100) * 0.5));

          return (
            <TouchableOpacity
              key={move.id}
              activeOpacity={0.8}
              disabled={disabled || isLocked}
              onPress={() => onSelectMove(move.id)}
              style={[
                styles.moveCard,
                isSelected && styles.selectedCard,
                isLocked && styles.lockedCard,
                { borderColor: isSelected ? THEME.colors.cyan : THEME.colors.bgCardBorder },
              ]}
            >
              {/* Header: Icon & Damage */}
              <View style={styles.cardHeader}>
                {isLocked ? (
                  <Lock size={14} color={THEME.colors.textMuted} />
                ) : (
                  getIcon(move.iconName, isSelected ? THEME.colors.cyan : move.color)
                )}
                <Text
                  style={[
                    styles.dmgTag,
                    { color: isLocked ? THEME.colors.textMuted : THEME.colors.neonYellow },
                  ]}
                >
                  {isLocked ? `REQ: ${move.requiredReps}` : `${calculatedDmg} DMG`}
                </Text>
              </View>

              {/* Move Name */}
              <Text
                style={[
                  styles.moveName,
                  { color: isLocked ? THEME.colors.textMuted : THEME.colors.textPrimary },
                ]}
                numberOfLines={1}
              >
                {move.name}
              </Text>

              {/* Mastery Indicator */}
              <View style={styles.masteryRow}>
                <Text style={styles.masteryText}>
                  {isLocked ? 'LOCKED' : `MASTERY ${move.masteryPercent}%`}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  headerLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: THEME.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  scrollContent: {
    gap: 8,
    paddingVertical: 2,
  },
  moveCard: {
    backgroundColor: THEME.colors.bgCard,
    borderWidth: 1.5,
    borderRadius: THEME.borderRadius.md,
    padding: 10,
    width: 140,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: THEME.colors.bgCardElevated,
    shadowColor: THEME.colors.cyan,
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  lockedCard: {
    opacity: 0.5,
    backgroundColor: '#0E131E',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dmgTag: {
    fontSize: 10,
    fontWeight: '900',
  },
  moveName: {
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 4,
  },
  masteryRow: {
    marginTop: 2,
  },
  masteryText: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.colors.textSecondary,
  },
});
