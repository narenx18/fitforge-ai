import React from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AppProvider, useApp } from './src/context/AppContext';
import { THEME } from './src/constants/theme';
import { LoginScreen } from './src/screens/LoginScreen';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';

const MainNavigator: React.FC = () => {
  const { isLoading } = useApp();
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.colors.goldPrimary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <ExpoStatusBar style="light" />
        <LoginScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ExpoStatusBar style="light" />
      <MainTabNavigator />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppProvider>
          <MainNavigator />
        </AppProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.bgPrimary,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: THEME.colors.bgPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
