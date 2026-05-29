import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, fontSize } from '@/theme';
import { usePlayerStats } from '@/api/hooks';
import { formatDateLabel } from '@/data/mock';

export function StatsScreen() {
  const navigation = useNavigation<any>();
  const { stats, loading } = usePlayerStats();

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Mis Estadísticas</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.teal} style={{ marginTop: spacing.xxxl }} />
        ) : !stats ? (
          <View style={styles.emptyState}>
            <Ionicons name="stats-chart-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>Aún no hay datos. ¡Apúntate a algún torneo!</Text>
          </View>
        ) : (
          <>
            {/* Top Grid: Matches */}
            <View style={styles.gridRow}>
              <View style={[styles.gridCard, { backgroundColor: colors.surface }]}>
                <Text style={styles.gridVal}>{stats.matchesPlayed}</Text>
                <Text style={styles.gridLbl}>Jugados</Text>
              </View>
              <View style={[styles.gridCard, { backgroundColor: colors.tealSoft }]}>
                <Text style={[styles.gridVal, { color: colors.teal }]}>{stats.matchesWon}</Text>
                <Text style={styles.gridLbl}>Ganados</Text>
              </View>
            </View>
            <View style={styles.gridRow}>
              <View style={[styles.gridCard, { backgroundColor: colors.lossSoft }]}>
                <Text style={[styles.gridVal, { color: colors.loss }]}>{stats.matchesLost}</Text>
                <Text style={styles.gridLbl}>Perdidos</Text>
              </View>
              <View style={[styles.gridCard, { backgroundColor: colors.goldSoft }]}>
                <Text style={[styles.gridVal, { color: colors.gold }]}>{stats.winRate}%</Text>
                <Text style={styles.gridLbl}>Win Rate</Text>
              </View>
            </View>

            {/* Rivals and Partners */}
            <Text style={styles.sectionTitle}>Curiosidades</Text>
            
            <View style={styles.curiosityCard}>
              <View style={[styles.iconBox, { backgroundColor: colors.tealSoft }]}>
                <Ionicons name="people-outline" size={24} color={colors.teal} />
              </View>
              <View style={styles.curiosityCopy}>
                <Text style={styles.curiosityTitle}>Compañero Frecuente</Text>
                <Text style={styles.curiosityDesc}>
                  {stats.frequentPartner ? stats.frequentPartner.name : "Nadie todavía"}
                </Text>
              </View>
            </View>

            <View style={styles.curiosityCard}>
              <View style={[styles.iconBox, { backgroundColor: colors.lossSoft }]}>
                <Ionicons name="skull-outline" size={24} color={colors.loss} />
              </View>
              <View style={styles.curiosityCopy}>
                <Text style={styles.curiosityTitle}>Mi Bestia Negra</Text>
                <Text style={styles.curiosityDesc}>
                  {stats.nemesis ? stats.nemesis.name : "¡Eres invencible!"}
                </Text>
              </View>
            </View>

            {/* History */}
            <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Historial de Partidos</Text>
            {stats.history.length === 0 ? (
              <Text style={styles.emptyHistory}>No tienes historial de torneos.</Text>
            ) : (
              stats.history.map(match => (
                <View key={match.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <View style={[styles.resultBadge, match.won ? styles.resultWon : styles.resultLost]}>
                      <Text style={[styles.resultText, match.won ? styles.resultTextWon : styles.resultTextLost]}>
                        {match.won ? 'VICTORIA' : 'DERROTA'}
                      </Text>
                    </View>
                    <Text style={styles.historyDate}>{new Date(match.date).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.historyTournament}>{match.tournamentName} - {match.roundName}</Text>
                  
                  <View style={styles.matchup}>
                    <Text style={[styles.matchupTeam, match.won && styles.matchupTeamWinner]}>
                      {match.myPairName}
                    </Text>
                    <Text style={styles.matchupVs}>vs</Text>
                    <Text style={[styles.matchupTeam, !match.won && styles.matchupTeamWinner]}>
                      {match.opponentName}
                    </Text>
                  </View>
                  
                  <Text style={styles.historyScore}>Resultado: {match.score || "S/R"}</Text>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgApp },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.base, paddingTop: spacing.xl, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.separator },
  backBtn: { padding: 4 },
  title: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.text, flex: 1, textAlign: 'center' },
  content: { padding: spacing.base, paddingBottom: spacing.xxxl },
  
  gridRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  gridCard: { flex: 1, borderRadius: radius.md, padding: spacing.lg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.separator },
  gridVal: { fontFamily: fonts.heading, fontSize: 32, color: colors.text },
  gridLbl: { fontFamily: fonts.bodyBold, fontSize: fontSize.xs, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },

  sectionTitle: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.text, marginTop: spacing.xl, marginBottom: spacing.md },
  
  curiosityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.separator },
  iconBox: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  curiosityCopy: { flex: 1 },
  curiosityTitle: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  curiosityDesc: { fontFamily: fonts.bodyBold, fontSize: fontSize.lg, color: colors.text, marginTop: 2 },

  historyCard: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.separator },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  resultBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  resultWon: { backgroundColor: colors.tealSoft },
  resultLost: { backgroundColor: colors.lossSoft },
  resultText: { fontFamily: fonts.bodyBold, fontSize: 10 },
  resultTextWon: { color: colors.teal },
  resultTextLost: { color: colors.loss },
  historyDate: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted },
  historyTournament: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.text, marginBottom: spacing.md },
  
  matchup: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.bgLight, padding: spacing.sm, borderRadius: radius.sm },
  matchupTeam: { flex: 1, fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.text },
  matchupTeamWinner: { fontFamily: fonts.bodyBold, color: colors.text },
  matchupVs: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, marginHorizontal: spacing.sm },
  
  historyScore: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.teal, marginTop: spacing.md, textAlign: 'center' },

  emptyState: { alignItems: 'center', padding: spacing.xl, marginTop: spacing.xl },
  emptyText: { fontFamily: fonts.body, color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' },
  emptyHistory: { fontFamily: fonts.body, color: colors.textMuted, textAlign: 'center', marginVertical: spacing.xl },
});
