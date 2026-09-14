import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { THEME } from '../constants/theme';

export const DietScreen: React.FC = () => {
  const [loggedCalories, setLoggedCalories] = useState(1450);
  const [loggedProtein, setLoggedProtein] = useState(110);
  const [mealImage, setMealImage] = useState<string | null>(null);

  // Targets calculated from user BMR/TDEE
  const targetCalories = 2200;
  const targetProtein = 160;

  const fuelScore = Math.min(Math.round((loggedCalories / targetCalories) * 100), 100);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setMealImage(result.assets[0].uri);
      // Simulate AI Macro Analysis
      setLoggedCalories((prev) => prev + 450);
      setLoggedProtein((prev) => prev + 35);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>AI NUTRITION & MACRO SNAP</Text>

      {/* Fuel Efficiency Gauge */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>DAILY FUEL EFFICIENCY</Text>
        <Text style={styles.scoreText}>{fuelScore}%</Text>
        <Text style={styles.subText}>
          {loggedCalories} / {targetCalories} kcal • {loggedProtein}g / {targetProtein}g Protein
        </Text>
      </View>

      {/* AI Meal Scanner */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>MEAL SCANNER</Text>
        {mealImage ? (
          <Image source={{ uri: mealImage }} style={styles.previewImage} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>No Meal Scanned Yet</Text>
          </View>
        )}

        <TouchableOpacity style={styles.scanBtn} onPress={pickImage} activeOpacity={0.8}>
          <Text style={styles.scanBtnText}>📸 SCAN & ANALYZE MEAL</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0c', padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#d4af37', marginBottom: 16 },
  card: {
    backgroundColor: '#18181f',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    marginBottom: 16,
    alignItems: 'center',
  },
  cardTitle: { color: '#f5f5f7', fontWeight: 'bold', fontSize: 13, alignSelf: 'flex-start' },
  scoreText: { color: '#ff6b35', fontSize: 36, fontWeight: '900', marginVertical: 8 },
  subText: { color: '#a1a1aa', fontSize: 12 },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#0a0a0c',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d4af37',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 12,
  },
  placeholderText: { color: '#a1a1aa', fontSize: 12 },
  previewImage: { width: '100%', height: 140, borderRadius: 8, marginVertical: 12 },
  scanBtn: {
    backgroundColor: '#d4af37',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  scanBtnText: { color: '#0a0a0c', fontWeight: 'bold', fontSize: 13 },
});