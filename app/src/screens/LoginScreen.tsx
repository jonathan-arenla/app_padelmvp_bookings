import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { colors, fonts, spacing, radius, fontSize, padelImagery } from '@/theme';
import { Button } from '@/components/Button';
import { CLUB_NAME, APP_NAME } from '@/lib/brand';
import { config } from '@/config';
import {
  api,
  setAuthToken,
  setCurrentUser,
  setSessionMode,
  type AuthUser,
} from '@/api/client';
import { getGoogleRedirectUri, isExpoGoClient } from '@/auth/googleRedirectUri';
import { promptGoogleViaExpoProxy, resolveGoogleIdToken } from '@/auth/googleExpoGoPrompt';

WebBrowser.maybeCompleteAuthSession();

interface Props {
  onLogged: () => void;
  onBack?: () => void;
}

export function LoginScreen({ onLogged, onBack }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ENV_GOOGLE_WEB = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '';
  const GOOGLE_WEB = ENV_GOOGLE_WEB || 'mock-web-client-id';
  const GOOGLE_IOS = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || GOOGLE_WEB;
  const GOOGLE_ANDROID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB;
  const redirectUri = useMemo(() => getGoogleRedirectUri(), []);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB,
    iosClientId: GOOGLE_IOS,
    androidClientId: GOOGLE_ANDROID,
    scopes: ['openid', 'profile', 'email'],
    selectAccount: true,
    redirectUri,
    ...(Platform.OS === 'web' ? { responseType: 'id_token' as const } : {}),
  });

  useEffect(() => {
    if (response?.type === 'success' && request) {
      (async () => {
        const idToken = await resolveGoogleIdToken(response, request, GOOGLE_WEB);
        if (idToken) await handleGoogleLogin(idToken);
        else setError('Google no devolvió ID token');
      })();
    } else if (response?.type === 'error') {
      setError('Error al iniciar sesión con Google');
    }
  }, [response]);

  async function handleGoogleLogin(idToken: string) {
    if (!config.useApi) {
      setError('Configura EXPO_PUBLIC_API_URL (ej. http://localhost:4000)');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api<{ token: string; user: AuthUser }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });
      setAuthToken(res.token);
      setCurrentUser(res.user);
      setSessionMode('oauth');
      onLogged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login fallido');
    } finally {
      setLoading(false);
    }
  }

  async function onGooglePress() {
    setError(null);
    if (!ENV_GOOGLE_WEB && process.env.EXPO_PUBLIC_DEMO_MODE !== 'true') {
      setError('Añade EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID o usa acceso demo');
      return;
    }
    try {
      const result = isExpoGoClient()
        ? await promptGoogleViaExpoProxy(request!)
        : await promptAsync();
      if (result?.type === 'success' && request) {
        const idToken = await resolveGoogleIdToken(result, request, GOOGLE_WEB);
        if (idToken) await handleGoogleLogin(idToken);
        else setError('Google no devolvió ID token');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error OAuth');
    }
  }

  async function onDevLogin() {
    if (!config.useApi) {
      setError('API no configurada');
      return;
    }
    setLoading(true);
    try {
      const res = await api<{ token: string; user: AuthUser }>('/auth/dev-login', { method: 'POST' });
      setAuthToken(res.token);
      setCurrentUser(res.user);
      setSessionMode('oauth');
      onLogged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Dev login fallido');
    } finally {
      setLoading(false);
    }
  }

  async function onMockGoogle() {
    await handleGoogleLogin('mock_google_token');
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.bg, '#1A4D42']} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.back}>
            <Ionicons name="arrow-back" size={24} color={colors.textOnDark} />
          </Pressable>
        ) : null}
        <Image source={require('../../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.sub}>{CLUB_NAME}</Text>

        <Image source={{ uri: padelImagery.court }} style={styles.hero} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          label={loading ? 'Conectando...' : 'Continuar con Google'}
          variant="gradient"
          size="lg"
          fullWidth
          disabled={loading}
          loading={loading}
          onPress={onGooglePress}
        />

        {config.useApi ? (
          <Pressable onPress={onDevLogin} style={styles.altBtn} disabled={loading}>
            <Text style={styles.altText}>Acceso demo (dev-login)</Text>
          </Pressable>
        ) : null}

        {(config.useApi && !ENV_GOOGLE_WEB) || process.env.EXPO_PUBLIC_DEMO_MODE === 'true' ? (
          <Pressable onPress={onMockGoogle} style={styles.altBtn} disabled={loading}>
            <Text style={styles.altText}>Mock Google (sin OAuth)</Text>
          </Pressable>
        ) : null}

        <Text style={styles.hint}>
          {config.useApi
            ? `API: ${config.apiUrl}`
            : 'Define EXPO_PUBLIC_API_URL=http://localhost:4000'}
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, padding: spacing.xl, justifyContent: 'center' },
  back: { position: 'absolute', top: spacing.xl, left: spacing.base, zIndex: 2 },
  logo: { width: 72, height: 72, alignSelf: 'center', marginBottom: spacing.md },
  title: { fontFamily: fonts.display, fontSize: fontSize.xxl, color: colors.textOnDark, textAlign: 'center' },
  sub: { fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.gold, textAlign: 'center', marginBottom: spacing.lg },
  hero: { width: '100%', height: 160, borderRadius: radius.xl, marginBottom: spacing.lg },
  error: { fontFamily: fonts.body, fontSize: fontSize.sm, color: '#FCA5A5', marginBottom: spacing.md, textAlign: 'center' },
  altBtn: { marginTop: spacing.md, alignItems: 'center', padding: spacing.sm },
  altText: { fontFamily: fonts.bodyBold, fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)' },
  hint: { fontFamily: fonts.body, fontSize: fontSize.xs, color: 'rgba(255,255,255,0.45)', textAlign: 'center', marginTop: spacing.xl },
});
