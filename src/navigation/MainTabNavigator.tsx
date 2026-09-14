import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useApp } from '../context/AppContext';
import { THEME } from '../constants/theme';
import { Header } from '../components/common/Header';
import { BottomTabBar } from './BottomTabBar';

import * as DashboardMod from '../screens/DashboardScreen';
import * as DietMod from '../screens/DietScreen';
import * as WorkoutMod from '../screens/CameraWorkoutScreen';
import * as MovesMod from '../screens/MovesScreen';
import * as ArenaMod from '../screens/ArenaScreen';
import * as HistoryMod from '../screens/HistoryScreen';
import * as ProfileMod from '../screens/ProfileScreen';

import { ResultsModal } from '../components/modals/ResultsModal';
import { ExerciseDetailModal } from '../components/modals/ExerciseDetailModal';

// Robust helper to resolve either named or default exports automatically
const getComponent = (mod: any, fallbackName: string) => {
  if (mod && typeof mod.default === 'function') return mod.default;
  if (mod && typeof mod[fallbackName] === 'function') return mod[fallbackName];
  const firstFuncKey = Object.keys(mod).find((k) => typeof mod[k] === 'function');
  if (firstFuncKey) return mod[firstFuncKey];
  return () => null;
};

const DashboardScreen = getComponent(DashboardMod, 'DashboardScreen');
const DietScreen = getComponent(DietMod, 'DietScreen');
const CameraWorkoutScreen = getComponent(WorkoutMod, 'CameraWorkoutScreen');
const MovesScreen = getComponent(MovesMod, 'MovesScreen');
const ArenaScreen = getComponent(ArenaMod, 'ArenaScreen');
const HistoryScreen = getComponent(HistoryMod, 'HistoryScreen');
const ProfileScreen = getComponent(ProfileMod, 'ProfileScreen');

export const MainTabNavigator: React.FC = () => {
  const { activeTab } = useApp();

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'diet':
        return <DietScreen />;
      case 'workout':
        return <CameraWorkoutScreen />;
      case 'moves':
        return <MovesScreen />;
      case 'arena':
        return <ArenaScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'dashboard':
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Luxury Header with Streak & Level Status */}
      <Header />

      {/* Screen Content Viewport */}
      <View style={styles.screenContainer}>{renderActiveScreen()}</View>

      {/* 5-Tab Navigation Bar with Elevated Gold Camera Button */}
      <BottomTabBar />

      {/* Global Results & Exercise Detail Modals */}
      <ResultsModal />
      <ExerciseDetailModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bgPrimary,
  },
  screenContainer: {
    flex: 1,
    backgroundColor: THEME.colors.bgPrimary,
  },
});