import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, fontSize, radius } from '@/theme';
import { CLUB_NAME, CLUB_TAGLINE } from '@/lib/brand';
import { CLUB_INFO } from '@/data/mock';

interface Props {
  subtitle?: string;
  onInfoPress?: () => void;
}

export function ClubHeader({ subtitle, onInfoPress }: Props) {
  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.row}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.copy}>
          <Text style={styles.clubName}>{CLUB_NAME}</Text>
          <Text style={styles.tagline}>{subtitle || CLUB_TAGLINE}</Text>
        </View>
        <Pressable onPress={onInfoPress} style={styles.infoBtn} hitSlop={12}>
          <Ionicons name="information-circle-outline" size={24} color={colors.teal} />
        </Pressable>
      </View>
      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <Ionicons name="tennisball" size={12} color={colors.teal} />
          <Text style={styles.metaText}>{CLUB_INFO.courtsCount} pistas</Text>
        </View>
        <View style={styles.metaChip}>
          <Ionicons name="time-outline" size={12} color={colors.teal} />
          <Text style={styles.metaText}>
            {CLUB_INFO.openFrom} – {CLUB_INFO.openTo}
          </Text>
        </View>
        <View style={styles.metaChip}>
          <Ionicons name="star" size={12} color={colors.gold} />
          <Text style={styles.metaText}>{CLUB_INFO.rating}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.bgLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingTop: spacing.sm },
  logo: { width: 48, height: 48, borderRadius: radius.full },
  copy: { flex: 1 },
  clubName: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.text, letterSpacing: 0.5 },
  tagline: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  infoBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tealSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tealSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  metaText: { fontFamily: fonts.bodyBold, fontSize: fontSize.micro, color: colors.tealDark },
});
