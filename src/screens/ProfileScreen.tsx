import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';

export const ProfileScreen: React.FC = () => {
  const context = useApp() as any;
  const setContextXP = context?.setUserXP || context?.setXp || (() => {});
  
  // Look for common auth setters in your AppContext
  const setIsLoggedIn = context?.setIsLoggedIn || context?.setLoggedIn || (() => {});
  const logoutUser = context?.logout || (() => {});

  const [weight, setWeight] = useState('75');
  const [height, setHeight] = useState('178');
  const [age, setAge] = useState('24');

  const w = parseFloat(weight) || 70;
  const h = parseFloat(height) || 170;
  const a = parseFloat(age) || 25;

  const bmr = Math.round(10 * w + 6.25 * h - 5 * a + 5);
  const tdee = Math.round(bmr * 1.4);
  const protein = Math.round(w * 2.0);
  const carbs = Math.round((tdee * 0.45) / 4);
  const fats = Math.round((tdee * 0.25) / 9);

  const handleLogout = () => {
    // 1. Reset user data in context
    setContextXP(0);
    
    // 2. Trigger global login state change if available in context
    setIsLoggedIn(false);
    logoutUser();

    // 3. Clear local storage tokens (if web or mobile storage)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('user_token');
      localStorage.clear();
      // Optional: force a reload if navigation state gets stuck on web
      window.location.reload();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>ATHLETE PROFILE & METRICS</Text>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>PHYSICAL PARAMETERS</Text>
        <View style={styles.inputRow}>
          <View style={styles.inputBox}>
            <Text style={styles.label}>WEIGHT (KG)</Text>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.label}>HEIGHT (CM)</Text>
            <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="numeric" />
          </View>
          <View style={styles.inputBox}>
            <Text style={styles.label}>AGE</Text>
            <TextInput style={styles.input} value={age} onChangeText={setAge} keyboardType="numeric" />
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>AI NUTRITION & DAILY TARGETS</Text>
        <View style={styles.metricGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{tdee} kcal</Text>
            <Text style={styles.metricLbl}>DAILY TDEE</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{protein}g</Text>
            <Text style={styles.metricLbl}>PROTEIN</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{carbs}g</Text>
            <Text style={styles.metricLbl}>CARBS</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{fats}g</Text>
            <Text style={styles.metricLbl}>FATS</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutButtonText}>LOG OUT SESSION</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#d4af37', marginBottom: 16 },
  card: { backgroundColor: '#18181f', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212, 175, 55, 0.2)', marginBottom: 16 },
  cardHeader: { color: '#f5f5f7', fontWeight: 'bold', fontSize: 13, marginBottom: 12 },
  inputRow: { flexDirection: 'row', gap: 10 },
  inputBox: { flex: 1 },
  label: { color: '#a1a1aa', fontSize: 10, fontWeight: 'bold', marginBottom: 4 },
  input: { backgroundColor: '#0a0a0c', borderColor: '#d4af37', borderWidth: 1, borderRadius: 6, color: '#f5f5f7', padding: 8, textAlign: 'center', fontWeight: 'bold' },
  metricGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  metricItem: { alignItems: 'center' },
  metricVal: { color: '#d4af37', fontWeight: 'bold', fontSize: 15 },
  metricLbl: { color: '#a1a1aa', fontSize: 10, marginTop: 2 },
  logoutButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#ef4444', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 30, marginTop: 8 },
  logoutButtonText: { color: '#ef4444', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
});