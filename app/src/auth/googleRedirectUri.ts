import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as AuthSession from 'expo-auth-session';

const FALLBACK_EXPO_PROJECT =
  process.env.EXPO_PUBLIC_EXPO_PROJECT_FULL_NAME || '@anonymous/padelpoint';

export function isExpoGoClient(): boolean {
  return (
    Platform.OS !== 'web' &&
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  );
}

export function getGoogleRedirectUri(): string {
  if (Platform.OS === 'web') {
    return AuthSession.makeRedirectUri({ scheme: 'padelpoint' });
  }

  const isNativeBuild = [
    ExecutionEnvironment.Standalone,
    ExecutionEnvironment.Bare,
  ].includes(Constants.executionEnvironment);

  if (isNativeBuild) {
    return AuthSession.makeRedirectUri({
      native: 'com.padelpoint.app:/oauthredirect',
      scheme: 'padelpoint',
    });
  }

  try {
    return AuthSession.getRedirectUrl();
  } catch {
    const fullName = FALLBACK_EXPO_PROJECT.startsWith('@')
      ? FALLBACK_EXPO_PROJECT.slice(1)
      : FALLBACK_EXPO_PROJECT;
    return `https://auth.expo.io/@${fullName}`;
  }
}
