import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useApp } from '../context/AppContext';
import { THEME } from '../constants/theme';
import { RIVAL_BOSSES } from '../constants/exercises';
import { ArenaFightCanvas } from '../components/arena/ArenaFightCanvas';

export function ArenaScreen() {
  const { battle, moves, startBattle, selectCombatMove, executeCombatTurn, toggleAutoBattle, resetBattle } = useApp();

  // 1. Idle state: show rival selection list (prevents canvas from rendering with empty battle data)
  if (!battle || battle.status === 'idle') {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>CYBER ARENA</Text>
        <Text style={styles.subtitle}>Select a combat rival to initialize battle protocol:</Text>
        {RIVAL_BOSSES.map((boss) => (
          <TouchableOpacity
            key={boss.id}
            style={styles.bossCard}
            onPress={() => startBattle(boss.id)}
          >
            <Text style={styles.bossAvatar}>{boss.avatar}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.bossName}>{boss.name}</Text>
              <Text style={styles.bossTitle}>{boss.title} (Level {boss.level})</Text>
            </View>
            <Text style={styles.fightButtonText}>FIGHT ➔</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  // 2. Active battle state: show fight canvas, moves selector, and combat log
  return (
    <View style={styles.container}>
      {/* Stickman Combat Animation Stage */}
      <View style={styles.stageWrapper}>
        <ArenaFightCanvas battle={battle} />
      </View>

      {/* Interactive Moves Selection */}
      <View style={styles.movesContainer}>
        <Text style={styles.movesHeader}>SELECT COMBAT MOVE:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.movesScroll}>
          {moves.map((move) => {
            const isSelected = battle.selectedMoveId === move.id;
            return (
              <TouchableOpacity
                key={move.id}
                style={[
                  styles.moveCard,
                  !move.unlocked && styles.moveLocked,
                  isSelected && styles.moveSelected,
                ]}
                disabled={!move.unlocked}
                onPress={() => selectCombatMove(move.id)}
              >
                <Text style={[styles.moveName, !move.unlocked && styles.textLocked]}>{move.name}</Text>
                <Text style={styles.moveDmg}>DMG: {move.baseDamage}</Text>
                <Text style={styles.moveMastery}>
                  {move.unlocked ? `${move.masteryPercent || 100}% Mastery` : 'LOCKED'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Combat Log */}
      <ScrollView style={styles.logContainer}>
        {(battle.combatLogs || []).map((log) => (
          <Text key={log.id} style={styles.logText}>{log.narrative}</Text>
        ))}
      </ScrollView>

      {/* Battle Control Buttons */}
      <View style={styles.actionPanel}>
        <TouchableOpacity style={styles.actionButton} onPress={executeCombatTurn}>
          <Text style={styles.buttonText}>EXECUTE STRIKE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#333' }]} onPress={toggleAutoBattle}>
          <Text style={styles.buttonText}>{battle.autoBattle ? 'STOP AUTO' : 'AUTO BATTLE'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#444' }]} onPress={resetBattle}>
          <Text style={styles.buttonText}>EXIT</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: THEME.colors?.bgPrimary || '#0b0f19',
    padding: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FFCC',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 20,
  },
  bossCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161b22',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#30363d',
  },
  bossAvatar: {
    fontSize: 32,
  },
  bossName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bossTitle: {
    color: '#8b949e',
    fontSize: 12,
  },
  fightButtonText: {
    color: '#00FFCC',
    fontWeight: 'bold',
  },
  stageWrapper: {
    height: 180,
    backgroundColor: '#111622',
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#30363d',
    overflow: 'hidden',
  },
  movesContainer: {
    marginBottom: 8,
  },
  movesHeader: {
    color: '#8b949e',
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  movesScroll: {
    gap: 8,
  },
  moveCard: {
    backgroundColor: '#161b22',
    borderWidth: 1,
    borderColor: '#30363d',
    padding: 8,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  moveSelected: {
    borderColor: '#00FFCC',
    backgroundColor: '#1f2937',
  },
  moveLocked: {
    opacity: 0.35,
  },
  moveName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 11,
    marginBottom: 2,
    textAlign: 'center',
  },
  textLocked: {
    color: '#777',
  },
  moveDmg: {
    color: '#00FFCC',
    fontSize: 10,
    marginBottom: 1,
  },
  moveMastery: {
    color: '#8b949e',
    fontSize: 9,
  },
  logContainer: {
    height: 90,
    backgroundColor: '#0d1117',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  logText: {
    color: '#c9d1d9',
    fontSize: 11,
    marginBottom: 3,
  },
  actionPanel: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#238636',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});