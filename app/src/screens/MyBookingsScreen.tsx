import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ClubHeader } from '@/components/ClubHeader';
import { EmptyState } from '@/components/design-system/EmptyState';
import { colors, fonts, spacing, radius, fontSize } from '@/theme';
import { formatDateLabel } from '@/data/mock';
import { useBookings, cancelBookingApi } from '@/api/hooks';
import { config } from '@/config';
import { getAuthToken } from '@/api/client';

export function MyBookingsScreen() {
  const navigation = useNavigation<any>();
  const { bookings, loading, refresh } = useBookings();

  const { upcoming, past } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const confirmed = bookings.filter((b) => b.status === 'confirmed');
    const cancelled = bookings.filter((b) => b.status === 'cancelled');
    return {
      upcoming: confirmed.filter((b) => b.date >= today),
      past: [...confirmed.filter((b) => b.date < today), ...cancelled],
    };
  }, [bookings]);

  const onCancel = (id: string, name: string) => {
    Alert.alert('Cancelar reserva', `¿Cancelar ${name}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          if (config.useApi && getAuthToken()) {
            await cancelBookingApi(id);
            await refresh();
          }
        },
      },
    ]);
  };

  if (loading && config.useApi && getAuthToken()) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ClubHeader subtitle="Tus partidos reservados" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {bookings.length === 0 ? (
          <EmptyState
            title="Sin reservas"
            message="Cuando reserves una pista aparecerá aquí"
            actionLabel="Reservar ahora"
            onAction={() => navigation.navigate('NewBooking')}
          />
        ) : (
          <>
            {upcoming.length > 0 && (
              <>
                <Text style={styles.section}>Próximas</Text>
                {upcoming.map((b) => (
                  <BookingCard key={b.id} booking={b} onCancel={() => onCancel(b.id, b.courtName)} />
                ))}
              </>
            )}
            {past.length > 0 && (
              <>
                <Text style={styles.section}>Historial</Text>
                {past.map((b) => (
                  <BookingCard key={b.id} booking={b} muted />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function BookingCard({
  booking,
  onCancel,
  muted,
}: {
  booking: { id: string; courtName: string; date: string; start: string; end: string; price: number; status: string };
  onCancel?: () => void;
  muted?: boolean;
}) {
  const cancelled = booking.status === 'cancelled';
  return (
    <View style={[styles.card, muted && styles.cardMuted]}>
      <View style={styles.cardIcon}>
        <Ionicons name="tennisball" size={22} color={cancelled ? colors.textMuted : colors.teal} />
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, cancelled && styles.strike]}>{booking.courtName}</Text>
        <Text style={styles.cardSub}>
          {formatDateLabel(booking.date)} · {booking.start} – {booking.end}
        </Text>
        <Text style={styles.cardPrice}>{booking.price}€ · 90 min</Text>
        {cancelled ? (
          <Text style={styles.cancelledLabel}>Cancelada</Text>
        ) : onCancel ? (
          <Pressable onPress={onCancel} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancelar reserva</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgApp },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scroll: { padding: spacing.base, paddingBottom: spacing.xxxl },
  section: { fontFamily: fonts.heading, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.md, marginTop: spacing.sm },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.bgLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.separator,
    gap: spacing.md,
  },
  cardMuted: { opacity: 0.75 },
  cardIcon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.tealSoft, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: fontSize.md, color: colors.text },
  strike: { textDecorationLine: 'line-through', color: colors.textMuted },
  cardSub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  cardPrice: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.teal, marginTop: 4 },
  cancelBtn: { marginTop: spacing.sm },
  cancelText: { fontFamily: fonts.bodyBold, fontSize: fontSize.xs, color: colors.loss },
  cancelledLabel: { fontFamily: fonts.bodyBold, fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.sm },
});
