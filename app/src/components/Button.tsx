import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius, spacing } from '@/theme';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth,
  disabled,
  loading,
  style,
}: Props) {
  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress?.();
  };

  const heights = { sm: 38, md: 48, lg: 56 };
  const paddings = { sm: spacing.md, md: spacing.lg, lg: spacing.xl };
  const fontSizes = { sm: 13, md: 15, lg: 16 };

  const baseStyle: ViewStyle = {
    height: heights[size],
    paddingHorizontal: paddings[size],
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: fullWidth ? '100%' : undefined,
    opacity: disabled ? 0.4 : 1,
    backgroundColor:
      variant === 'secondary' ? colors.surfaceMuted :
      variant === 'ghost' ? 'transparent' :
      variant === 'gradient' ? undefined : colors.teal,
    borderWidth: variant === 'secondary' ? 1 : 0,
    borderColor: colors.border,
  };

  const textColor =
    variant === 'ghost' ? colors.teal :
    variant === 'secondary' ? colors.text : colors.textOnDark;

  const content = loading ? (
    <ActivityIndicator color={textColor} size="small" />
  ) : (
    <Text style={[styles.label, { color: textColor, fontSize: fontSizes[size] }]}>{label}</Text>
  );

  if (variant === 'gradient') {
    return (
      <Pressable onPress={handlePress} disabled={disabled || loading} style={style}>
        <LinearGradient
          colors={[colors.teal, colors.tealLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={baseStyle}
        >
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={handlePress} disabled={disabled || loading} style={[baseStyle, style]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fonts.bodyBold, letterSpacing: 0.3 },
});
