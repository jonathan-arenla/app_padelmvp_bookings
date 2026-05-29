import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Button } from '@/components/Button';
import { FilterChip } from '@/components/design-system/FilterChip';
import { colors, fonts, spacing, radius, fontSize } from '@/theme';
import { getUpcomingDates, formatDateLabel, COURTS } from '@/data/mock';
import { useClub, useSlots, createBooking } from '@/api/hooks';
import { hapticSuccess, hapticSelection } from '@/lib/haptics';
import { config } from '@/config';
import { getAuthToken } from '@/api/client';

export function NewBookingScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { courts } = useClub();
  const courtList = courts.length ? courts : COURTS;

  const dates = useMemo(() => getUpcomingDates(14), []);
  const initialCourtId = route.params?.courtId ?? courtList[0]?.id;

  const [courtId, setCourtId] = useState(initialCourtId);
  const [date, setDate] = useState(dates[0]);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'now' | 'club'>('now');
  const [showSuccess, setShowSuccess] = useState(false);

  const court = courtList.find((c) => c.id === courtId) ?? courtList[0];
  const { slots } = useSlots(courtId, date);
  const selectedSlot = slots.find((s) => s.id === slotId);

  const onConfirm = async () => {
    if (!selectedSlot || !court) {
      Alert.alert('Selecciona hora', 'Elige un tramo disponible para continuar.');
      return;
    }
    if (config.useApi && !getAuthToken()) {
      Alert.alert('Inicia sesión', 'Necesitas entrar con Google o demo para reservar.');
      return;
    }

    setConfirming(true);
    try {
      if (config.useApi && getAuthToken()) {
        await createBooking({ courtId: court.id, date, start: selectedSlot.start });
      }
      hapticSuccess();
      setShowSuccess(true);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'No se pudo reservar');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Nueva reserva</Text>
        <View style={{ width: 40 }} />
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.step}>1 · Pista</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.courtsRow}>
          {courtList.map((c) => (
            <Pressable
              key={c.id}
              style={[styles.courtChip, courtId === c.id && styles.courtChipActive]}
              onPress={() => {
                hapticSelection();
                setCourtId(c.id);
                setSlotId(null);
              }}
            >
              <Image source={{ uri: c.imageUrl }} style={styles.courtThumb} />
              <Text style={[styles.courtChipName, courtId === c.id && styles.courtChipNameActive]} numberOfLines={1}>
                {c.name}
              </Text>
              <Text style={styles.courtChipPrice}>{c.pricePer90}€</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.step}>2 · Día</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesRow}>
          {dates.map((d) => (
            <FilterChip key={d} label={formatDateLabel(d)} active={date === d} onPress={() => { setDate(d); setSlotId(null); }} />
          ))}
        </ScrollView>

        <Text style={styles.step}>3 · Hora (90 min)</Text>
        <View style={styles.slotsGrid}>
          {slots.map((slot) => {
            const active = slotId === slot.id;
            const disabled = !slot.available;
            return (
              <Pressable
                key={slot.id}
                style={[styles.slot, active && styles.slotActive, disabled && styles.slotDisabled]}
                disabled={disabled}
                onPress={() => { hapticSelection(); setSlotId(slot.id); }}
              >
                <Text style={[styles.slotTime, active && styles.slotTimeActive, disabled && styles.slotTimeDisabled]}>{slot.start}</Text>
                <Text style={[styles.slotEnd, disabled && styles.slotTimeDisabled]}>{slot.end}</Text>
                {!slot.available && <Text style={styles.slotBusy}>Ocupado</Text>}
              </Pressable>
            );
          })}
        </View>

        {selectedSlot && court && (
          <>
            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Resumen</Text>
              <Text style={styles.summaryLine}>{court.name}</Text>
              <Text style={styles.summaryLine}>
                {formatDateLabel(date)} · {selectedSlot.start} – {selectedSlot.end}
              </Text>
              <Text style={styles.summaryPrice}>{court.pricePer90}€</Text>
            </View>

            <Text style={styles.step}>4 · Método de pago</Text>
            <View style={styles.paymentRow}>
              <Pressable
                style={[styles.paymentOption, paymentMethod === 'now' && styles.paymentOptionActive]}
                onPress={() => { hapticSelection(); setPaymentMethod('now'); }}
              >
                <Ionicons name="card-outline" size={24} color={paymentMethod === 'now' ? colors.teal : colors.textMuted} />
                <Text style={[styles.paymentOptionText, paymentMethod === 'now' && styles.paymentOptionTextActive]}>Pagar ahora</Text>
              </Pressable>
              <Pressable
                style={[styles.paymentOption, paymentMethod === 'club' && styles.paymentOptionActive]}
                onPress={() => { hapticSelection(); setPaymentMethod('club'); }}
              >
                <Ionicons name="cash-outline" size={24} color={paymentMethod === 'club' ? colors.teal : colors.textMuted} />
                <Text style={[styles.paymentOptionText, paymentMethod === 'club' && styles.paymentOptionTextActive]}>En el club</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <Button
          label={confirming ? 'Confirmando...' : 'Confirmar reserva'}
          variant="gradient"
          size="lg"
          fullWidth
          disabled={!selectedSlot || confirming}
          loading={confirming}
          onPress={onConfirm}
        />
      </SafeAreaView>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={64} color={colors.teal} style={{ marginBottom: spacing.sm }} />
            <Text style={styles.modalTitle}>¡Reserva confirmada!</Text>
            <Text style={styles.modalText}>
              {court?.name}{'\n'}
              {formatDateLabel(date)} · {selectedSlot?.start} – {selectedSlot?.end}{'\n'}
              Método de pago: {paymentMethod === 'now' ? 'Tarjeta' : 'En el club'}
            </Text>
            <Button
              label="Ver mis reservas"
              variant="gradient"
              fullWidth
              onPress={() => {
                setShowSuccess(false);
                navigation.replace('Main', { screen: 'Reservas' });
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgApp },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bgLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.separator,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.text },
  scroll: { padding: spacing.base, paddingBottom: 120 },
  step: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.teal, marginBottom: spacing.sm, marginTop: spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  courtsRow: { gap: spacing.sm, paddingBottom: spacing.sm },
  courtChip: { width: 100, backgroundColor: colors.bgLight, borderRadius: radius.md, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  courtChipActive: { borderColor: colors.teal },
  courtThumb: { width: '100%', height: 56 },
  courtChipName: { fontFamily: fonts.bodyBold, fontSize: fontSize.micro, color: colors.text, padding: 6 },
  courtChipNameActive: { color: colors.teal },
  courtChipPrice: { fontFamily: fonts.body, fontSize: fontSize.micro, color: colors.textMuted, paddingHorizontal: 6, paddingBottom: 6 },
  datesRow: { paddingBottom: spacing.sm },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  slot: { width: '30%', minWidth: 96, backgroundColor: colors.bgLight, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', borderWidth: 2, borderColor: colors.separator },
  slotActive: { borderColor: colors.teal, backgroundColor: colors.tealSoft },
  slotDisabled: { opacity: 0.45 },
  slotTime: { fontFamily: fonts.bodyBold, fontSize: fontSize.md, color: colors.text },
  slotTimeActive: { color: colors.teal },
  slotTimeDisabled: { color: colors.textMuted },
  slotEnd: { fontFamily: fonts.body, fontSize: fontSize.micro, color: colors.textMuted, marginTop: 2 },
  slotBusy: { fontFamily: fonts.bodyBold, fontSize: 9, color: colors.loss, marginTop: 4 },
  summary: { marginTop: spacing.lg, backgroundColor: colors.tealSoft, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.teal },
  summaryTitle: { fontFamily: fonts.bodyBold, fontSize: fontSize.xs, color: colors.teal, letterSpacing: 0.5 },
  summaryLine: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.text, marginTop: 4 },
  summaryPrice: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.teal, marginTop: spacing.sm },
  paymentRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.sm, paddingBottom: spacing.lg },
  paymentOption: { flex: 1, backgroundColor: colors.bgLight, borderWidth: 2, borderColor: colors.separator, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  paymentOptionActive: { borderColor: colors.teal, backgroundColor: colors.tealSoft },
  paymentOptionText: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.textMuted },
  paymentOptionTextActive: { color: colors.teal },
  footer: { padding: spacing.base, backgroundColor: colors.bgLight, borderTopWidth: 1, borderTopColor: colors.separator },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 46, 40, 0.7)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalContent: { backgroundColor: colors.bgLight, borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', width: '100%', maxWidth: 360 },
  modalTitle: { fontFamily: fonts.heading, fontSize: fontSize.xl, color: colors.text, marginBottom: spacing.md, textAlign: 'center' },
  modalText: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.textMuted, textAlign: 'center', lineHeight: 24, marginBottom: spacing.xl },
});
