import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, fontSize } from '@/theme';
import { useTournament } from '@/api/hooks';
import { getCurrentUser, joinTournament } from '@/api/client';
import { formatDateLabel } from '@/data/mock';

type Tab = 'info' | 'pairs' | 'bracket';

export function TournamentDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  const { tournament, loading, refresh } = useTournament(id);
  const user = getCurrentUser();

  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [joining, setJoining] = useState(false);

  const isJoined = tournament?.participants?.some(p => p.userId === user?.id);
  const isFull = tournament ? tournament.participants.length >= tournament.maxPlayers : false;

  const handleJoin = async () => {
    try {
      setJoining(true);
      await joinTournament(id);
      refresh();
      Alert.alert('Éxito', 'Te has inscrito en el torneo');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'No se pudo inscribir');
    } finally {
      setJoining(false);
    }
  };

  if (loading && !tournament) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.teal} />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={styles.root}>
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: 40 }}>Torneo no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>{tournament.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <Pressable style={[styles.tab, activeTab === 'info' && styles.tabActive]} onPress={() => setActiveTab('info')}>
          <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>Info</Text>
        </Pressable>
        <Pressable style={[styles.tab, activeTab === 'pairs' && styles.tabActive]} onPress={() => setActiveTab('pairs')}>
          <Text style={[styles.tabText, activeTab === 'pairs' && styles.tabTextActive]}>Parejas</Text>
        </Pressable>
        <Pressable style={[styles.tab, activeTab === 'bracket' && styles.tabActive]} onPress={() => setActiveTab('bracket')}>
          <Text style={[styles.tabText, activeTab === 'bracket' && styles.tabTextActive]}>Cuadro</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'info' && (
          <View>
            <View style={styles.card}>
              <Text style={styles.label}>Fechas</Text>
              <Text style={styles.value}>{formatDateLabel(tournament.startDate)} - {formatDateLabel(tournament.endDate)}</Text>
              
              <Text style={[styles.label, { marginTop: spacing.md }]}>Precio</Text>
              <Text style={styles.value}>{tournament.price}€</Text>

              <Text style={[styles.label, { marginTop: spacing.md }]}>Inscritos</Text>
              <Text style={styles.value}>{tournament.participants.length} / {tournament.maxPlayers}</Text>

              {tournament.description && (
                <>
                  <Text style={[styles.label, { marginTop: spacing.md }]}>Descripción</Text>
                  <Text style={[styles.value, { fontFamily: fonts.body }]}>{tournament.description}</Text>
                </>
              )}
            </View>

            {!isJoined ? (
              <Pressable
                style={[styles.joinBtn, (isFull || joining) && styles.joinBtnDisabled]}
                onPress={handleJoin}
                disabled={isFull || joining}
              >
                <Text style={styles.joinBtnText}>{isFull ? 'Torneo Completo' : joining ? 'Inscribiendo...' : 'Inscribirse al Torneo'}</Text>
              </Pressable>
            ) : (
              <View style={styles.joinedBadge}>
                <Ionicons name="checkmark-circle" size={24} color={colors.teal} />
                <Text style={styles.joinedText}>Estás inscrito en este torneo</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'pairs' && (
          <View>
            {user?.isAdmin && (
              <View style={styles.adminBox}>
                <Text style={styles.adminTitle}>Admin: Gestión de Parejas</Text>
                <Text style={styles.adminDesc}>Como administrador, puedes agrupar a los jugadores inscritos en parejas oficiales.</Text>
                <Pressable style={styles.adminBtn} onPress={() => Alert.alert('WIP', 'Aquí se abriría un modal para crear parejas')}>
                  <Text style={styles.adminBtnText}>+ Crear Pareja Oficial</Text>
                </Pressable>
              </View>
            )}

            <Text style={styles.sectionTitle}>Parejas Formadas ({tournament.pairs?.length || 0})</Text>
            {tournament.pairs?.length === 0 ? (
              <Text style={styles.emptyText}>Aún no hay parejas formadas.</Text>
            ) : (
              tournament.pairs?.map((pair) => (
                <View key={pair.id} style={styles.pairCard}>
                  <Text style={styles.pairName}>{pair.name || `${pair.player1.name} / ${pair.player2.name}`}</Text>
                </View>
              ))
            )}

            <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Jugadores Inscritos Sueltos</Text>
            {tournament.participants.map((p) => (
              <View key={p.id} style={styles.playerCard}>
                <View style={styles.playerAvatar}>
                  <Text style={styles.playerAvatarText}>{p.user.name.charAt(0)}</Text>
                </View>
                <Text style={styles.playerName}>{p.user.name}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'bracket' && (
          <View>
             {user?.isAdmin && (
              <View style={styles.adminBox}>
                <Text style={styles.adminTitle}>Admin: Gestión del Cuadro</Text>
                <Pressable style={styles.adminBtn} onPress={() => Alert.alert('WIP', 'Modal para añadir un partido al cuadro')}>
                  <Text style={styles.adminBtnText}>+ Añadir Partido al Cuadro</Text>
                </Pressable>
              </View>
            )}

            {tournament.matches?.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="git-network-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyText}>El cuadro de enfrentamientos aún no se ha generado.</Text>
              </View>
            ) : (
              tournament.matches?.map((match) => (
                <Pressable 
                  key={match.id} 
                  style={styles.matchCard}
                  onPress={() => user?.isAdmin && Alert.alert('WIP', 'Modal para poner el resultado')}
                >
                  <Text style={styles.matchRound}>{match.roundName}</Text>
                  <View style={styles.matchTeams}>
                    <Text style={[styles.matchTeam, match.winnerId === match.pair1Id && styles.matchTeamWinner]}>
                      {match.pair1 ? (match.pair1.name || `${match.pair1.player1.name}/${match.pair1.player2.name}`) : 'TBD'}
                    </Text>
                    <Text style={styles.matchVs}>vs</Text>
                    <Text style={[styles.matchTeam, match.winnerId === match.pair2Id && styles.matchTeamWinner]}>
                      {match.pair2 ? (match.pair2.name || `${match.pair2.player1.name}/${match.pair2.player2.name}`) : 'TBD'}
                    </Text>
                  </View>
                  <View style={styles.matchFooter}>
                    <Text style={styles.matchScore}>{match.score || 'Pendiente'}</Text>
                    {user?.isAdmin && <Text style={styles.editHint}>Editar</Text>}
                  </View>
                </Pressable>
              ))
            )}
          </View>
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
  tabsRow: { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.separator },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.teal },
  tabText: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.textMuted },
  tabTextActive: { color: colors.teal },
  content: { padding: spacing.base, paddingBottom: spacing.xxxl },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.separator, marginBottom: spacing.lg },
  label: { fontFamily: fonts.bodyBold, fontSize: fontSize.xs, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  value: { fontFamily: fonts.bodyBold, fontSize: fontSize.base, color: colors.text, marginTop: 4 },
  joinBtn: { backgroundColor: colors.teal, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  joinBtnDisabled: { opacity: 0.5 },
  joinBtnText: { color: colors.textOnDark, fontFamily: fonts.bodyBold, fontSize: fontSize.base },
  joinedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tealSoft, borderRadius: radius.md, padding: spacing.md },
  joinedText: { fontFamily: fonts.bodyBold, color: colors.teal, fontSize: fontSize.base, marginLeft: spacing.sm },
  
  adminBox: { backgroundColor: colors.goldSoft, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.gold },
  adminTitle: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.text },
  adminDesc: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.text, marginTop: 4, marginBottom: spacing.md },
  adminBtn: { backgroundColor: colors.text, paddingVertical: 8, paddingHorizontal: spacing.md, borderRadius: radius.sm, alignSelf: 'flex-start' },
  adminBtnText: { color: colors.bgLight, fontFamily: fonts.bodyBold, fontSize: fontSize.xs },
  
  sectionTitle: { fontFamily: fonts.heading, fontSize: fontSize.md, color: colors.text, marginBottom: spacing.md },
  emptyState: { alignItems: 'center', padding: spacing.xl, marginTop: spacing.xl },
  emptyText: { fontFamily: fonts.body, color: colors.textMuted, marginTop: spacing.md, textAlign: 'center' },
  
  pairCard: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.separator },
  pairName: { fontFamily: fonts.bodyBold, fontSize: fontSize.base, color: colors.text },
  
  playerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.sm, borderRadius: radius.sm, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.separator },
  playerAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.tealSoft, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  playerAvatarText: { fontFamily: fonts.bodyBold, color: colors.teal, fontSize: fontSize.sm },
  playerName: { fontFamily: fonts.body, fontSize: fontSize.base, color: colors.text },

  matchCard: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.separator },
  matchRound: { fontFamily: fonts.bodyBold, fontSize: fontSize.xs, color: colors.teal, textTransform: 'uppercase', marginBottom: spacing.sm },
  matchTeams: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  matchTeam: { flex: 1, fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.text },
  matchTeamWinner: { fontFamily: fonts.bodyBold, color: colors.teal },
  matchVs: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, marginHorizontal: spacing.sm },
  matchFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.separator, paddingTop: spacing.sm },
  matchScore: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.text },
  editHint: { fontFamily: fonts.bodyBold, fontSize: fontSize.xs, color: colors.teal },
});
