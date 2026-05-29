import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { colors, fonts, fontSize, radius, spacing } from '@/theme';
import { hapticSelection } from '@/lib/haptics';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export function FilterChip({ label, active, onPress }: Props) {
  return (
    <Pressable
      onPress={() => {
        hapticSelection();
        onPress?.();
      }}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.label, active && styles.labelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.tealSoft, borderColor: colors.teal },
  label: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.textMuted },
  labelActive: { color: colors.teal },
});
