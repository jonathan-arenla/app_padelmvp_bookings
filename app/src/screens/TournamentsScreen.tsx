import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, fontSize } from '@/theme';
import { useTournaments } from '@/api/hooks';
import { getCurrentUser, joinTournament } from '@/api/client';
import { SectionHeader } from '@/components/design-system/SectionHeader';
import { ClubHeader } from '@/components/ClubHeader';
import { formatDateLabel } from '@/data/mock';

export function TournamentsScreen() {
  const navigation = useNavigation<any>();
  const { tournaments, loading, refresh } = useTournaments();
  const user = getCurrentUser();

  const handleJoin = async (id: string) => {
    try {
      await joinTournament(id);
      refresh();
    } catch (e: any) {
      alert(e.message || 'Error al inscribirse');
    }
  };

  return (
    <View style={styles.root}>
      <ClubHeader />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <SectionHeader title="Torneos y Ligas" />
          {user?.isAdmin && (
            <Pressable
              style={styles.createBtn}
              onPress={() => navigation.navigate('NewTournament')}
            >
              <Ionicons name="add" size={20} color={colors.textOnDark} />
              <Text style={styles.createBtnText}>Crear</Text>
            </Pressable>
          )}
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.teal} style={{ marginTop: spacing.xl }} />
        ) : tournaments.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="trophy-outline" size={40} color={colors.teal} />
            <Text style={styles.emptyText}>No hay torneos disponibles en este momento.</Text>
          </View>
        ) : (
          tournaments.map((t) => {
            const isJoined = t.participants.some((p) => p.userId === user?.id);
            const isFull = t.participants.length >= t.maxPlayers;
            return (
              <Pressable 
                key={t.id} 
                style={styles.card}
                onPress={() => navigation.navigate('TournamentDetails', { id: t.id })}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{t.name}</Text>
                  <View style={[styles.statusBadge, t.status === 'ongoing' && styles.statusOngoing]}>
                    <Text style={styles.statusText}>{t.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.dates}>
                  {formatDateLabel(t.startDate)} - {formatDateLabel(t.endDate)}
                </Text>
                {t.description && <Text style={styles.description}>{t.description}</Text>}

                <View style={styles.footer}>
                  <View style={styles.stats}>
                    <Ionicons name="people" size={16} color={colors.textMuted} />
                    <Text style={styles.statsText}>
                      {t.participants.length} / {t.maxPlayers}
                    </Text>
                    <Ionicons name="cash-outline" size={16} color={colors.textMuted} style={{ marginLeft: spacing.sm }} />
                    <Text style={styles.statsText}>{t.price}€</Text>
                  </View>
                  {!isJoined ? (
                    <Pressable
                      style={[styles.joinBtn, isFull && styles.joinBtnDisabled]}
                      disabled={isFull}
                      onPress={() => handleJoin(t.id)}
                    >
                      <Text style={styles.joinBtnText}>{isFull ? 'Completo' : 'Inscribirse'}</Text>
                    </Pressable>
                  ) : (
                    <View style={styles.joinedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.teal} />
                      <Text style={styles.joinedText}>Inscrito</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgApp },
  scroll: { paddingBottom: spacing.xxxl },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: spacing.base },
  createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.teal, paddingHorizontal: spacing.sm, paddingVertical: 6, borderRadius: radius.sm },
  createBtnText: { color: colors.textOnDark, fontFamily: fonts.bodyBold, marginLeft: 4, fontSize: fontSize.sm },
  empty: { padding: spacing.xl, alignItems: 'center', marginTop: spacing.xl },
  emptyText: { fontFamily: fonts.body, color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' },
  card: { backgroundColor: colors.surface, marginHorizontal: spacing.base, marginBottom: spacing.md, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.separator },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.text, flex: 1 },
  statusBadge: { backgroundColor: colors.separator, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: spacing.sm },
  statusOngoing: { backgroundColor: colors.goldSoft },
  statusText: { fontFamily: fonts.bodyBold, fontSize: 10, color: colors.textMuted },
  dates: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.teal, marginTop: spacing.xs },
  description: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.separator },
  stats: { flexDirection: 'row', alignItems: 'center' },
  statsText: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted, marginLeft: 4 },
  joinBtn: { backgroundColor: colors.teal, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.sm },
  joinBtnDisabled: { backgroundColor: colors.separator },
  joinBtnText: { fontFamily: fonts.bodyBold, color: colors.textOnDark, fontSize: fontSize.sm },
  joinedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.tealSoft, paddingHorizontal: spacing.sm, paddingVertical: 8, borderRadius: radius.sm },
  joinedText: { fontFamily: fonts.bodyBold, color: colors.teal, fontSize: fontSize.sm, marginLeft: 4 },
});
