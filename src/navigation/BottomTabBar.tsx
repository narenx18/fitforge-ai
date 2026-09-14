import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LayoutDashboard, Utensils, Camera, Swords, User } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { useApp } from '../context/AppContext';
import { AppTab } from '../types';

export const BottomTabBar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  // 5 Refactored Bottom Tabs: [Dashboard, Diet, Workout (Elevated Gold Camera Button), AI Arena, Profile]
  const tabs: { id: AppTab; label: string; icon: any; isSpecial?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'diet', label: 'Diet', icon: Utensils },
    { id: 'workout', label: 'Workout', icon: Camera, isSpecial: true },
    { id: 'arena', label: 'AI Arena', icon: Swords },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const IconComponent = tab.icon;

        if (tab.isSpecial) {
          return (
            <TouchableOpacity
              key={tab.id}
              activeOpacity={0.85}
              onPress={() => setActiveTab(tab.id)}
              style={styles.specialTabItem}
            >
              <View style={[styles.specialIconCircle, isActive && styles.specialIconActive]}>
                <IconComponent size={25} color="#0A0A0C" />
              </View>
              <Text style={[styles.tabLabel, styles.specialLabel]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.75}
            onPress={() => setActiveTab(tab.id)}
            style={styles.tabItem}
          >
            <View style={styles.iconContainer}>
              <IconComponent
                size={20}
                color={isActive ? THEME.colors.goldPrimary : THEME.colors.textMuted}
              />
              {isActive && <View style={styles.activeDot} />}
            </View>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? THEME.colors.goldLight : THEME.colors.textMuted },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingBottom: 22,
    paddingTop: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    height: 24,
  },
  activeDot: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.goldPrimary,
    shadowColor: THEME.colors.goldPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
  },
  tabLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 0.4,
  },
  specialTabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  specialIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: THEME.colors.goldPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: THEME.colors.bgPrimary,
    shadowColor: THEME.colors.goldPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.75,
    shadowRadius: 10,
    elevation: 8,
  },
  specialIconActive: {
    backgroundColor: THEME.colors.goldLight,
    shadowColor: THEME.colors.goldLight,
    shadowOpacity: 0.9,
    shadowRadius: 14,
  },
  specialLabel: {
    color: THEME.colors.goldLight,
    fontWeight: '900',
    marginTop: 3,
    fontSize: 9.5,
  },
});
