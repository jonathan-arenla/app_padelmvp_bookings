import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const noop = () => Promise.resolve();

function run(fn: () => Promise<void>) {
  if (Platform.OS === 'web') return noop();
  return fn().catch(noop);
}

export function hapticSelection() {
  return run(() => Haptics.selectionAsync());
}

export function hapticConfirm() {
  return run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

export function hapticSuccess() {
  return run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
