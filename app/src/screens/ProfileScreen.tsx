import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ClubHeader } from '@/components/ClubHeader';
import { colors, fonts, spacing, radius, fontSize } from '@/theme';
import { DEMO_USER } from '@/data/mock';
import { CLUB_ADDRESS, CLUB_PHONE } from '@/lib/brand';
import { useProfile } from '@/api/hooks';
import { getCurrentUser, clearSession } from '@/api/client';
import { config } from '@/config';
import { useNavigation } from '@react-navigation/native';

const MENU = [
  { icon: 'card-outline' as const, label: 'Métodos de pago' },
  { icon: 'notifications-outline' as const, label: 'Notificaciones' },
  { icon: 'document-text-outline' as const, label: 'Condiciones del club' },
  { icon: 'help-circle-outline' as const, label: 'Ayuda' },
];

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { profile, loading } = useProfile();
  const user = profile ?? (getCurrentUser() ? {
    name: getCurrentUser()!.name,
    email: getCurrentUser()!.email,
    bookingsCount: 0,
    memberSince: '—',
  } : DEMO_USER);

  return (
    <View style={styles.root}>
      <ClubHeader />
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? <ActivityIndicator color={colors.teal} style={{ marginVertical: spacing.lg }} /> : null}
        <View style={styles.profileCard}>
          <Image source={require('../../assets/logo.png')} style={styles.avatar} />
          <View style={styles.profileCopy}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{'email' in user ? user.email : DEMO_USER.email}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statVal}>{'bookingsCount' in user ? user.bookingsCount : DEMO_USER.bookingsCount}</Text>
                <Text style={styles.statLbl}>Reservas</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statVal}>Miembro</Text>
                <Text style={styles.statLbl}>{'memberSince' in user ? user.memberSince : DEMO_USER.memberSince}</Text>
              </View>
            </View>
          </View>
        </View>

        <Pressable 
          style={styles.statsBtn} 
          onPress={() => navigation.navigate('StatsScreen')}
        >
          <View style={styles.statsIconBox}>
            <Ionicons name="stats-chart" size={24} color={colors.bgLight} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statsBtnTitle}>Mis Estadísticas</Text>
            <Text style={styles.statsBtnDesc}>Partidos, compañero, bestia negra...</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.teal} />
        </Pressable>

        {config.useApi && getCurrentUser() ? (
          <Pressable
            style={styles.logout}
            onPress={() => {
              clearSession();
              if (typeof globalThis !== 'undefined' && globalThis.location) {
                globalThis.location.reload();
              }
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.loss} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </Pressable>
        ) : null}

        <Text style={styles.section}>Contacto club</Text>
        <View style={styles.row}>
          <Ionicons name="call-outline" size={18} color={colors.teal} />
          <Text style={styles.rowText}>{CLUB_PHONE}</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={18} color={colors.teal} />
          <Text style={styles.rowText}>{CLUB_ADDRESS}</Text>
        </View>

        <Text style={styles.section}>Ajustes</Text>
        {MENU.map((item) => (
          <Pressable 
            key={item.label} 
            style={styles.menuItem}
            onPress={() => Alert.alert('Próximamente', 'Esta sección estará disponible en futuras actualizaciones.')}
          >
            <Ionicons name={item.icon} size={20} color={colors.textMuted} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}

        <Text style={styles.version}>PadelPoint · Club Punto Verde · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgApp },
  scroll: { padding: spacing.base, paddingBottom: spacing.xxxl },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: colors.bgLight,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.separator,
    marginBottom: spacing.md,
  },
  avatar: { width: 72, height: 72, borderRadius: 36 },
  profileCopy: { flex: 1, justifyContent: 'center' },
  name: { fontFamily: fonts.heading, fontSize: fontSize.lg, color: colors.text },
  email: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  statsRow: { flexDirection: 'row', marginTop: spacing.md, alignItems: 'center' },
  stat: { flex: 1 },
  statVal: { fontFamily: fonts.bodyBold, fontSize: fontSize.md, color: colors.teal },
  statLbl: { fontFamily: fonts.body, fontSize: fontSize.micro, color: colors.textMuted },
  statDivider: { width: 1, height: 28, backgroundColor: colors.separator },
  statsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.tealSoft, padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.teal },
  statsIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  statsBtnTitle: { fontFamily: fonts.heading, fontSize: fontSize.md, color: colors.teal },
  statsBtnDesc: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.teal, opacity: 0.8 },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    padding: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.bgLight,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.separator,
  },
  logoutText: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: colors.loss },
  section: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgLight,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  rowText: { flex: 1, fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.text },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.bgLight,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  menuLabel: { flex: 1, fontFamily: fonts.body, fontSize: fontSize.base, color: colors.text },
  version: { fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xxl },
});
