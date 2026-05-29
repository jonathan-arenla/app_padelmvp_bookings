import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { AccessTokenRequest, AuthRequest } from 'expo-auth-session';
import { discovery as googleDiscovery } from 'expo-auth-session/providers/google';
import type { AuthSessionResult } from 'expo-auth-session';

export async function promptGoogleViaExpoProxy(request: AuthRequest): Promise<AuthSessionResult> {
  const authUrl = request.url ?? (await request.makeAuthUrlAsync(googleDiscovery));
  const appReturnUrl = AuthSession.getDefaultReturnUrl();
  const proxyRedirect = AuthSession.getRedirectUrl();
  const startUrl = `${proxyRedirect}/start?${new URLSearchParams({
    authUrl,
    returnUrl: appReturnUrl,
  }).toString()}`;

  const browser = await WebBrowser.openAuthSessionAsync(startUrl, proxyRedirect, {
    preferEphemeralSession: false,
  });
  if (browser.type !== 'success' || !browser.url) {
    return { type: browser.type === 'success' ? 'cancel' : browser.type };
  }
  return request.parseReturnUrl(browser.url);
}

export async function resolveGoogleIdToken(
  result: AuthSessionResult,
  request: AuthRequest,
  clientId: string,
): Promise<string | null> {
  if (result.type !== 'success') return null;

  const direct = result.params.id_token || result.authentication?.idToken;
  if (direct) return direct;

  const code = result.params.code;
  if (!code) return null;

  try {
    const exchange = new AccessTokenRequest({
      clientId,
      redirectUri: request.redirectUri,
      scopes: request.scopes,
      code,
      extraParams: { code_verifier: request.codeVerifier || '' },
    });
    const authentication = await exchange.performAsync(googleDiscovery);
    return authentication?.idToken ?? null;
  } catch {
    return null;
  }
}
