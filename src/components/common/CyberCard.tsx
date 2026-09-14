import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { THEME } from '../../constants/theme';

interface CyberCardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  borderColor?: string;
  glow?: boolean;
  variant?: 'default' | 'elevated' | 'glass';
}

export const CyberCard: React.FC<CyberCardProps> = ({
  children,
  style,
  borderColor = THEME.colors.bgCardBorder,
  glow = false,
  variant = 'default',
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'elevated':
        return THEME.colors.bgCardElevated;
      case 'glass':
        return 'rgba(18, 24, 36, 0.85)';
      default:
        return THEME.colors.bgCard;
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: borderColor,
          shadowColor: glow ? borderColor : 'transparent',
        },
        glow && styles.glow,
        style,
      ]}
    >
      {/* Electric Neon Cyber Notches */}
      <View style={[styles.cornerTopLeft, { borderColor }]} />
      <View style={[styles.cornerBottomRight, { borderColor }]} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: THEME.borderRadius.lg,
    borderWidth: 1.5,
    padding: THEME.spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  },
});
