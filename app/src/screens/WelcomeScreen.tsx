import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, fontSize, padelImagery } from '@/theme';
import { Button } from '@/components/Button';
import { CLUB_NAME, CLUB_TAGLINE, APP_NAME } from '@/lib/brand';

interface Props {
  onContinue: () => void;
}

const PILLARS = [
  { icon: 'calendar' as const, title: 'Reserva', desc: 'Elige pista, día y hora en segundos' },
  { icon: 'chatbubbles' as const, title: 'Mensajes', desc: 'Habla con recepción del club' },
  { icon: 'tennisball' as const, title: 'Pistas', desc: '6 pistas cristal y moqueta' },
];

export function WelcomeScreen({ onContinue }: Props) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.bg, '#1A4D42', colors.tealDark]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.logoBlock}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.appName}>{APP_NAME}</Text>
            <Text style={styles.club}>{CLUB_NAME}</Text>
            <Text style={styles.tagline}>{CLUB_TAGLINE}</Text>
          </View>

          <View style={styles.hero}>
            <Image source={{ uri: padelImagery.court }} style={styles.heroImg} resizeMode="cover" />
            <LinearGradient colors={['transparent', 'rgba(15,46,40,0.95)']} style={styles.heroOverlay} />
            <Text style={styles.headline}>
              RESERVA TU{'\n'}
              <Text style={styles.headlineAccent}>PISTA</Text>
            </Text>
          </View>

          <View style={styles.pillars}>
            {PILLARS.map((p) => (
              <View key={p.title} style={styles.pillar}>
                <View style={styles.pillarIcon}>
                  <Ionicons name={p.icon} size={20} color={colors.gold} />
                </View>
                <View style={styles.pillarCopy}>
                  <Text style={styles.pillarTitle}>{p.title}</Text>
                  <Text style={styles.pillarDesc}>{p.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <Button label="ENTRAR AL CLUB →" variant="gradient" size="lg" fullWidth onPress={onContinue} />
          <Text style={styles.demo}>Modo demo · datos de ejemplo</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  logoBlock: { alignItems: 'center', marginBottom: spacing.xl },
  logo: { width: 88, height: 88, marginBottom: spacing.md },
  appName: { fontFamily: fonts.display, fontSize: fontSize.display, color: colors.textOnDark, letterSpacing: 2 },
  club: { fontFamily: fonts.heading, fontSize: fontSize.md, color: colors.gold, marginTop: 4 },
  tagline: { fontFamily: fonts.body, fontSize: fontSize.sm, color: 'rgba(255,255,255,0.75)', marginTop: spacing.xs },
  hero: { height: 200, borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.xl },
  heroImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  headline: { fontFamily: fonts.display, fontSize: 36, color: colors.textOnDark, lineHeight: 38, textAlign: 'center' },
  headlineAccent: { color: colors.gold },
  pillars: { gap: spacing.md, marginBottom: spacing.xxl },
  pillar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  pillarIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(27,107,90,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillarCopy: { flex: 1 },
  pillarTitle: { fontFamily: fonts.bodyBold, fontSize: fontSize.base, color: colors.textOnDark },
  pillarDesc: { fontFamily: fonts.body, fontSize: fontSize.xs, color: 'rgba(255,255,255,0.65)', marginTop: 2 },
  demo: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
