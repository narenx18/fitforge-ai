import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function MovesScreen() {
  const [goal, setGoal] = useState<'build' | 'fatloss' | 'endurance'>('build');

  // AI Suggestion Engine Matrix
  const workoutPlans = {
    build: [
      { name: 'Forge Squats', target: 'Quads & Glutes', reps: '4 Sets x 12 Reps', xp: '+120 XP' },
      { name: 'Titan Push-ups', target: 'Chest & Triceps', reps: '4 Sets x 15 Reps', xp: '+150 XP' },
      { name: 'Overclock Overhead Press', target: 'Shoulders', reps: '3 Sets x 10 Reps', xp: '+100 XP' },
    ],
    fatloss: [
      { name: 'Hyper Jumping Jacks', target: 'Full Body Cardio', reps: '5 Sets x 45 Sec', xp: '+200 XP' },
      { name: 'Volt Lunges', target: 'Legs & Core Balance', reps: '4 Sets x 16 Reps', xp: '+140 XP' },
      { name: 'Aegis Plank Hold', target: 'Core Stability', reps: '3 Sets x 60 Sec', xp: '+180 XP' },
    ],
    endurance: [
      { name: 'Cyber High Knees', target: 'Lower Body Cardio', reps: '4 Sets x 60 Sec', xp: '+160 XP' },
      { name: 'Forge Squats', target: 'Leg Endurance', reps: '3 Sets x 20 Reps', xp: '+180 XP' },
      { name: 'Titan Push-ups', target: 'Upper Body Stamina', reps: '3 Sets x 18 Reps', xp: '+170 XP' },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AI WORKOUT RECOMMENDER</Text>
      <Text style={styles.subtitle}>Select primary combat goal for custom routine</Text>

      {/* Goal Selector */}
      <View style={styles.goalRow}>
        {(['build', 'fatloss', 'endurance'] as const).map((g) => (
          <TouchableOpacity
            key={g}
            style={[styles.goalBtn, goal === g && styles.activeGoalBtn]}
            onPress={() => setGoal(g)}
          >
            <Text style={[styles.goalTxt, goal === g && styles.activeGoalTxt]}>
              {g.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recommended Exercises */}
      <Text style={styles.sectionHeader}>SUGGESTED COMBAT EXERCISES</Text>
      {workoutPlans[goal].map((move, idx) => (
        <View key={idx} style={styles.card}>
          <View>
            <Text style={styles.moveName}>{move.name}</Text>
            <Text style={styles.moveDetail}>{move.target} • {move.reps}</Text>
          </View>
          <Text style={styles.xpBadge}>{move.xp}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c', padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#d4af37', letterSpacing: 1 },
  subtitle: { fontSize: 13, color: '#a1a1aa', marginBottom: 16 },
  goalRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  goalBtn: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#d4af37', alignItems: 'center' },
  activeGoalBtn: { backgroundColor: '#d4af37' },
  goalTxt: { color: '#d4af37', fontWeight: 'bold', fontSize: 12 },
  activeGoalTxt: { color: '#0a0a0c' },
  sectionHeader: { color: '#f5f5f7', fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  card: { backgroundColor: '#18181f', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  moveName: { color: '#f5f5f7', fontWeight: 'bold', fontSize: 16 },
  moveDetail: { color: '#a1a1aa', fontSize: 12, marginTop: 4 },
  xpBadge: { color: '#ff6b35', fontWeight: 'bold', fontSize: 14 },
});