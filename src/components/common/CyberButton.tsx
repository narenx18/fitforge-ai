import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
  View,
} from 'react-native';
import { THEME } from '../../constants/theme';
import { safeHaptic } from '../../services/haptics';

interface CyberButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'cyan' | 'green' | 'crimson' | 'yellow' | 'purple' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const CyberButton: React.FC<CyberButtonProps> = ({
  title,
  onPress,
  variant = 'cyan',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
}) => {
  const handlePress = () => {
    if (disabled || loading) return;
    safeHaptic.light();
    onPress();
  };

  const getColors = () => {
    if (disabled) {
      return {
        bg: '#18181F',
        border: '#2E2E38',
        text: '#52525B',
      };
    }
    switch (variant) {
      case 'green':
        return {
          bg: THEME.colors.btnAccentEmerald,
          border: THEME.colors.btnAccentEmeraldLight,
          text: '#002E1C',
        };
      case 'crimson':
        return {
          bg: THEME.colors.electricRed,
          border: THEME.colors.electricRedLight,
          text: '#FFFFFF',
        };
      case 'yellow':
        return {
          bg: THEME.colors.goldPrimary,
          border: THEME.colors.goldLight,
          text: '#0A0A0C',
        };
      case 'purple':
        return {
          bg: THEME.colors.purple,
          border: THEME.colors.purpleLight,
          text: '#FFFFFF',
        };
      case 'outline':
        return {
          bg: 'transparent',
          border: THEME.colors.goldPrimary,
          text: THEME.colors.goldPrimary,
        };
      case 'ghost':
        return {
          bg: 'transparent',
          border: 'transparent',
          text: THEME.colors.textSecondary,
        };
      case 'cyan':
      default:
        return {
          bg: THEME.colors.goldPrimary,
          border: THEME.colors.goldLight,
          text: '#0A0A0C',
        };
    }
  };

  const colors = getColors();

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 6, paddingHorizontal: 12 };
      case 'lg':
        return { paddingVertical: 14, paddingHorizontal: 24 };
      case 'md':
      default:
        return { paddingVertical: 10, paddingHorizontal: 18 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return 12;
      case 'lg':
        return 16;
      case 'md':
      default:
        return 14;
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.button,
        getPadding(),
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          shadowColor: !disabled && variant !== 'ghost' ? colors.border : 'transparent',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text
            style={[
              styles.text,
              {
                color: colors.text,
                fontSize: getFontSize(),
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: THEME.borderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 6,
  },
  text: {
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
