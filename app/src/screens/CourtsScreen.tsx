import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ClubHeader } from '@/components/ClubHeader';
import { FilterChip } from '@/components/design-system/FilterChip';
import { colors, fonts, spacing, radius, fontSize } from '@/theme';
import type { CourtSurface } from '@/data/mock';
import { hapticSelection } from '@/lib/haptics';
import { useClub } from '@/api/hooks';

type Filter = 'all' | CourtSurface;

export function CourtsScreen() {
  const navigation = useNavigation<any>();
  const { courts, loading } = useClub();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = courts.filter((c) => filter === 'all' || c.surface === filter);

  return (
    <View style={styles.root}>
      <ClubHeader subtitle="Elige tu pista" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.filtersContent}>
        <FilterChip label="Todas" active={filter === 'all'} onPress={() => setFilter('all')} />
        <FilterChip label="Cristal" active={filter === 'cristal'} onPress={() => setFilter('cristal')} />
        <FilterChip label="Moqueta" active={filter === 'moqueta'} onPress={() => setFilter('moqueta')} />
      </ScrollView>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.teal} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {filtered.map((court) => (
            <Pressable
              key={court.id}
              style={styles.card}
              onPress={() => {
                hapticSelection();
                navigation.navigate('NewBooking', { courtId: court.id });
              }}
            >
              <Image source={{ uri: court.imageUrl }} style={styles.cardImg} resizeMode="cover" />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardName}>{court.name}</Text>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>{court.pricePer90}€</Text>
                  </View>
                </View>
                <Text style={styles.cardMeta}>
                  Pista {court.number} · {court.surface} · {court.type === 'indoor' ? 'Interior' : 'Exterior'}
                </Text>
                <View style={styles.tags}>
                  {court.features.slice(0, 2).map((f) => (
                    <View key={f} style={styles.tag}>
                      <Text style={styles.tagText}>{f}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.bookRow}>
                  <Text style={styles.bookLabel}>Reservar</Text>
                  <Ionicons name="arrow-forward-circle" size={22} color={colors.teal} />
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgApp },
  filters: { marginBottom: spacing.sm, flexGrow: 0 },
  filtersContent: { paddingHorizontal: spacing.base, paddingVertical: spacing.xs },
  list: { padding: spacing.base, paddingBottom: spacing.xxxl, gap: spacing.md },
  card: { backgroundColor: colors.bgLight, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.separator },
  cardImg: { width: '100%', height: 140 },
  cardBody: { padding: spacing.md },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardName: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.text },
  priceBadge: { backgroundColor: colors.tealSoft, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.sm },
  priceText: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.teal },
  cardMeta: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  tag: { backgroundColor: colors.surfaceMuted, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  tagText: { fontFamily: fonts.body, fontSize: fontSize.micro, color: colors.textMuted },
  bookRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.separator },
  bookLabel: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.teal },
});
