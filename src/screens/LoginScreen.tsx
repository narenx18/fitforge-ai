import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Zap, Shield, Crown, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { CharacterClass } from '../types';
import { CHARACTER_CLASSES } from '../constants/characters';
import { THEME } from '../constants/theme';

export const LoginScreen: React.FC = () => {
  const { login, signup, guestLogin } = useAuth();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState<CharacterClass>('titan');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);
    try {
      let result: { success: boolean; error?: string };
      if (isLoginMode) {
        result = await login(email, password, name);
      } else {
        result = await signup(email, password, name, selectedClass);
      }
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (e) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = async () => {
    setIsLoading(true);
    await guestLogin();
    setIsLoading(false);
  };

  const classIcons: Record<CharacterClass, React.ReactNode> = {
    titan: <Shield size={22} color={CHARACTER_CLASSES.titan.color} />,
    ninja: <Zap size={22} color={CHARACTER_CLASSES.ninja.color} />,
    valkyrie: <Crown size={22} color={CHARACTER_CLASSES.valkyrie.color} />,
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.brandIconCircle}>
            <Zap size={34} color={THEME.colors.cyan} />
          </View>
          <Text style={styles.brandTitle}>FITFORGE AI</Text>
          <Text style={styles.brandSubtitle}>CYBERNETIC COMBAT TRAINING SYSTEM</Text>
        </View>

        {/* Mode Toggle */}
        <View style={styles.modeToggleRow}>
          <TouchableOpacity
            style={[styles.modeBtn, isLoginMode && styles.modeBtnActive]}
            onPress={() => { setIsLoginMode(true); setError(''); }}
            activeOpacity={0.8}
          >
            <LogIn size={14} color={isLoginMode ? '#002B33' : THEME.colors.textSecondary} />
            <Text style={[styles.modeBtnText, isLoginMode && styles.modeBtnTextActive]}>CYBER CONNECT</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, !isLoginMode && styles.modeBtnActiveRed]}
            onPress={() => { setIsLoginMode(false); setError(''); }}
            activeOpacity={0.8}
          >
            <UserPlus size={14} color={!isLoginMode ? '#002B33' : THEME.colors.textSecondary} />
            <Text style={[styles.modeBtnText, !isLoginMode && styles.modeBtnTextActive]}>FORGE IDENTITY</Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Name field (signup only) */}
          {!isLoginMode && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>GLADIATOR NAME</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your callsign..."
                placeholderTextColor={THEME.colors.textMuted}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>NEURAL LINK ID (EMAIL)</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="pilot@fitforge.ai"
              placeholderTextColor={THEME.colors.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SECURITY CIPHER (PASSWORD)</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Min 6 characters..."
                placeholderTextColor={THEME.colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword((v) => !v)}
              >
                {showPassword
                  ? <EyeOff size={18} color={THEME.colors.textMuted} />
                  : <Eye size={18} color={THEME.colors.textMuted} />
                }
              </TouchableOpacity>
            </View>
          </View>

          {/* Character Class Selector (signup only) */}
          {!isLoginMode && (
            <View style={styles.classSection}>
              <Text style={styles.inputLabel}>SELECT COMBAT CLASS</Text>
              <View style={styles.classGrid}>
                {(['titan', 'ninja', 'valkyrie'] as CharacterClass[]).map((cls) => {
                  const config = CHARACTER_CLASSES[cls];
                  const isSelected = selectedClass === cls;
                  return (
                    <TouchableOpacity
                      key={cls}
                      style={[
                        styles.classCard,
                        { borderColor: isSelected ? config.color : THEME.colors.bgCardBorder },
                        isSelected && { backgroundColor: `${config.color}18` },
                      ]}
                      onPress={() => setSelectedClass(cls)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.classAvatar}>{config.avatar}</Text>
                      <Text style={[styles.className, isSelected && { color: config.color }]}>
                        {config.name}
                      </Text>
                      <Text style={styles.classTrait}>{config.specialTrait}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Error Message */}
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Primary Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isLoginMode ? styles.submitCyan : styles.submitRed]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading
              ? <ActivityIndicator color="#000" size="small" />
              : <>
                  {isLoginMode
                    ? <LogIn size={18} color="#002B33" />
                    : <UserPlus size={18} color="#1A0000" />
                  }
                  <Text style={[styles.submitText, isLoginMode ? styles.submitTextCyan : styles.submitTextRed]}>
                    {isLoginMode ? 'CYBER CONNECT' : 'FORGE IDENTITY'}
                  </Text>
                </>
            }
          </TouchableOpacity>

          {/* Guest Login */}
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={handleGuest}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Text style={styles.guestText}>⚡ GUEST PILOT — Enter Without Auth</Text>
          </TouchableOpacity>

          {/* Toggle Mode Link */}
          <TouchableOpacity
            onPress={() => { setIsLoginMode((v) => !v); setError(''); }}
            style={styles.toggleLink}
          >
            <Text style={styles.toggleLinkText}>
              {isLoginMode
                ? 'New gladiator? → FORGE IDENTITY'
                : 'Already registered? → CYBER CONNECT'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.colors.bgDark,
  },
  scroll: {
    flexGrow: 1,
    padding: THEME.spacing.lg,
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  brandIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderWidth: 2,
    borderColor: THEME.colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: THEME.colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 14,
    elevation: 8,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    letterSpacing: 4,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.colors.textMuted,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
    width: '100%',
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: THEME.borderRadius.md,
    backgroundColor: THEME.colors.bgCard,
    borderWidth: 1.5,
    borderColor: THEME.colors.bgCardBorder,
  },
  modeBtnActive: {
    backgroundColor: THEME.colors.cyan,
    borderColor: THEME.colors.cyanLight,
  },
  modeBtnActiveRed: {
    backgroundColor: THEME.colors.electricRed,
    borderColor: THEME.colors.electricRedLight,
  },
  modeBtnText: {
    fontSize: 10,
    fontWeight: '900',
    color: THEME.colors.textSecondary,
    letterSpacing: 0.6,
  },
  modeBtnTextActive: {
    color: '#002B33',
  },
  formCard: {
    width: '100%',
    backgroundColor: THEME.colors.bgCard,
    borderRadius: THEME.borderRadius.xl,
    borderWidth: 1.5,
    borderColor: THEME.colors.bgCardBorder,
    padding: THEME.spacing.lg,
    gap: 14,
  },
  inputGroup: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: THEME.colors.textMuted,
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: THEME.colors.bgCardElevated,
    borderWidth: 1.5,
    borderColor: THEME.colors.bgCardBorder,
    borderRadius: THEME.borderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: THEME.colors.textPrimary,
    fontWeight: '700',
  },
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 46,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    top: 11,
    padding: 2,
  },
  classSection: {
    gap: 8,
  },
  classGrid: {
    gap: 8,
  },
  classCard: {
    backgroundColor: THEME.colors.bgCardElevated,
    borderWidth: 1.5,
    borderRadius: THEME.borderRadius.lg,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  classAvatar: {
    fontSize: 22,
  },
  className: {
    fontSize: 13,
    fontWeight: '900',
    color: THEME.colors.textPrimary,
    width: 110,
  },
  classTrait: {
    flex: 1,
    fontSize: 10,
    color: THEME.colors.textSecondary,
    fontWeight: '700',
    lineHeight: 13,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 0, 85, 0.12)',
    borderWidth: 1,
    borderColor: THEME.colors.electricRed,
    borderRadius: THEME.borderRadius.md,
    padding: 10,
  },
  errorText: {
    fontSize: 12,
    color: THEME.colors.electricRed,
    fontWeight: '700',
    textAlign: 'center',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: THEME.borderRadius.lg,
    marginTop: 4,
  },
  submitCyan: {
    backgroundColor: THEME.colors.cyan,
    shadowColor: THEME.colors.cyan,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  submitRed: {
    backgroundColor: THEME.colors.electricRed,
    shadowColor: THEME.colors.electricRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
  },
  submitText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  submitTextCyan: { color: '#002B33' },
  submitTextRed: { color: '#1A0000' },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  guestText: {
    fontSize: 12,
    color: THEME.colors.neonYellow,
    fontWeight: '800',
  },
  toggleLink: {
    alignItems: 'center',
  },
  toggleLinkText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '700',
  },
});
