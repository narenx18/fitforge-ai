import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Swords } from 'lucide-react-native';
import { THEME } from '../../constants/theme';
import { CombatAction } from '../../types';

interface CombatLogFeedProps {
  logs: CombatAction[];
}

export const CombatLogFeed: React.FC<CombatLogFeedProps> = ({ logs }) => {
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (logs.length > 0 && flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [logs.length]);

  const renderLogItem = ({ item }: { item: CombatAction }) => {
    const isPlayer = item.isPlayerAttacker;
    const isCritical = item.isCritical;
    const isKO = item.moveName === 'KNOCKOUT' || item.moveName === 'DEFEAT';

    let tagColor = isPlayer ? THEME.colors.cyan : THEME.colors.purple;
    if (isCritical) tagColor = THEME.colors.neonYellow;
    if (isKO) tagColor = item.moveName === 'KNOCKOUT' ? THEME.colors.neonGreen : THEME.colors.electricRed;

    return (
      <View style={[styles.logCard, { borderLeftColor: tagColor }]}>
        <View style={styles.logHeader}>
          <View style={styles.leftMeta}>
            <Text style={[styles.turnBadge, { color: tagColor }]}>T+{item.turn}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>
          {item.damageDealt > 0 && (
            <View
              style={[
                styles.dmgBadge,
                {
                  backgroundColor: isCritical
                    ? 'rgba(255, 230, 0, 0.2)'
                    : 'rgba(255, 0, 85, 0.2)',
                  borderColor: isCritical ? THEME.colors.neonYellow : THEME.colors.electricRed,
                },
              ]}
            >
              <Text
                style={[
                  styles.dmgText,
                  { color: isCritical ? THEME.colors.neonYellow : THEME.colors.electricRedLight },
                ]}
              >
                -{item.damageDealt} DMG {isCritical ? '⚡CRIT!' : ''}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.narrativeText}>{item.narrative}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.feedHeader}>
        <Swords size={14} color={THEME.colors.cyan} />
        <Text style={styles.feedTitle}>LIVE COMBAT TELEMETRY FEED</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={renderLogItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>Combat ready. Strike or toggle auto battle to engage.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: THEME.colors.bgCardBorder,
    padding: THEME.spacing.sm,
    flex: 1,
    minHeight: 170,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.bgCardBorder,
    marginBottom: 6,
  },
  feedTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME.colors.textSecondary,
    letterSpacing: 0.8,
  },
  listContent: {
    paddingVertical: 4,
    gap: 6,
  },
  logCard: {
    backgroundColor: THEME.colors.bgCardElevated,
    borderRadius: THEME.borderRadius.sm,
    borderLeftWidth: 3.5,
    padding: 8,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  leftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  turnBadge: {
    fontSize: 10,
    fontWeight: '900',
  },
  timestamp: {
    fontSize: 9,
    color: THEME.colors.textMuted,
  },
  dmgBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.borderRadius.sm,
    borderWidth: 1,
  },
  dmgText: {
    fontSize: 10,
    fontWeight: '900',
  },
  narrativeText: {
    fontSize: 12,
    color: THEME.colors.textPrimary,
    lineHeight: 16,
  },
  emptyView: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
