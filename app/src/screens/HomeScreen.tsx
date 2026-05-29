import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ClubHeader } from '@/components/ClubHeader';
import { SectionHeader } from '@/components/design-system/SectionHeader';
import { colors, fonts, spacing, radius, fontSize } from '@/theme';
import { useBookings, useClubMessages } from '@/api/hooks';
import { formatDateLabel } from '@/data/mock';
import { CLUB_ADDRESS } from '@/lib/brand';
import { hapticSelection } from '@/lib/haptics';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { bookings } = useBookings();
  const { unreadCount } = useClubMessages();

  const nextBooking = useMemo(
    () =>
      bookings
        .filter((b) => b.status === 'confirmed')
        .sort((a, b) => a.date.localeCompare(b.date))[0],
    [bookings],
  );

  const quickActions = [
    { icon: 'add-circle' as const, label: 'Nueva reserva', screen: 'NewBooking', color: colors.teal },
    { icon: 'grid' as const, label: 'Ver pistas', tab: 'Pistas', color: '#2A8F7A' },
    { icon: 'chatbubbles' as const, label: 'Mensajes', tab: 'Mensajes', color: '#3DA5D9', badge: unreadCount },
    { icon: 'calendar' as const, label: 'Mis reservas', tab: 'Reservas', color: colors.gold },
  ];

  return (
    <View style={styles.root}>
      <ClubHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {nextBooking ? (
          <Pressable style={styles.nextCard} onPress={() => navigation.navigate('Reservas')}>
            <LinearGradient colors={[colors.tealDark, colors.teal, colors.tealLight]} style={StyleSheet.absoluteFill} />
            <View style={styles.nextContent}>
              <Text style={styles.nextLabel}>PRÓXIMA RESERVA</Text>
              <Text style={styles.nextCourt}>{nextBooking.courtName}</Text>
              <Text style={styles.nextWhen}>
                {formatDateLabel(nextBooking.date)} · {nextBooking.start} – {nextBooking.end}
              </Text>
              <View style={styles.nextPrice}>
                <Text style={styles.priceText}>{nextBooking.price}€</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.textOnDark} />
              </View>
            </View>
          </Pressable>
        ) : (
          <View style={styles.emptyNext}>
            <Ionicons name="calendar-outline" size={28} color={colors.teal} />
            <Text style={styles.emptyTitle}>Sin reservas próximas</Text>
            <Text style={styles.emptySub}>Reserva tu primera pista con el botón central</Text>
          </View>
        )}

        <SectionHeader title="Accesos rápidos" />
        <View style={styles.quickGrid}>
          {quickActions.map((a) => (
            <Pressable
              key={a.label}
              style={styles.quickItem}
              onPress={() => {
                hapticSelection();
                if ('screen' in a && a.screen) navigation.navigate(a.screen);
                else navigation.navigate('Main', { screen: a.tab });
              }}
            >
              <View style={[styles.quickIcon, { backgroundColor: `${a.color}22` }]}>
                <Ionicons name={a.icon} size={22} color={a.color} />
                {'badge' in a && a.badge ? (
                  <View style={styles.quickBadge}>
                    <Text style={styles.quickBadgeText}>{a.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.quickLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        <SectionHeader title="El club" />
        <View style={styles.infoCard}>
          <Ionicons name="location-outline" size={20} color={colors.teal} />
          <Text style={styles.infoText}>{CLUB_ADDRESS}</Text>
        </View>
        <View style={styles.infoCard}>
          <Ionicons name="time-outline" size={20} color={colors.teal} />
          <Text style={styles.infoText}>Horario: 08:00 – 23:00 · Sesiones de 90 min</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgApp },
  scroll: { paddingBottom: spacing.xxxl },
  nextCard: { marginHorizontal: spacing.base, marginBottom: spacing.lg, borderRadius: radius.xl, overflow: 'hidden', minHeight: 140 },
  nextContent: { padding: spacing.lg },
  nextLabel: { fontFamily: fonts.bodyBold, fontSize: fontSize.micro, color: 'rgba(255,255,255,0.8)', letterSpacing: 1 },
  nextCourt: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.textOnDark, marginTop: spacing.xs },
  nextWhen: { fontFamily: fonts.body, fontSize: fontSize.sm, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  nextPrice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md },
  priceText: { fontFamily: fonts.bodyBold, fontSize: fontSize.lg, color: colors.gold },
  emptyNext: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
    backgroundColor: colors.bgLight,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.separator,
  },
  emptyTitle: { fontFamily: fonts.bodyBold, fontSize: fontSize.md, color: colors.text, marginTop: spacing.sm },
  emptySub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.base, gap: spacing.md, marginBottom: spacing.lg },
  quickItem: { width: '47%', backgroundColor: colors.bgLight, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.separator },
  quickIcon: { width: 44, height: 44, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  quickLabel: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.text },
  quickBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  quickBadgeText: { color: '#FFF', fontSize: 9, fontFamily: fonts.bodyBold },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.base,
    marginBottom: spacing.sm,
    backgroundColor: colors.bgLight,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.separator,
  },
  infoText: { flex: 1, fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.text },
});
