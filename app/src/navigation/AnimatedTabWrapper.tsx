import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '@/theme';

const TAB_INDEX: Record<string, number> = {
  Inicio: 0,
  Pistas: 1,
  _Book: 2,
  Mensajes: 3,
  Reservas: 4,
  Perfil: 5,
};

interface Props {
  children: React.ReactNode;
  routeName: string;
}

export function AnimatedTabWrapper({ children, routeName }: Props) {
  const isFocused = useIsFocused();
  const tabIndex = TAB_INDEX[routeName] ?? 0;
  const prevIndex = useRef(tabIndex);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(isFocused ? 1 : 0);
  const flash = useSharedValue(0);

  useEffect(() => {
    if (!isFocused) {
      opacity.value = withTiming(0, { duration: 120 });
      return;
    }
    const direction = tabIndex >= prevIndex.current ? 1 : -1;
    prevIndex.current = tabIndex;
    translateX.value = direction * 28;
    opacity.value = 0;
    flash.value = 0.15;
    translateX.value = withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(1, { duration: 240 });
    flash.value = withTiming(0, { duration: 320 });
  }, [isFocused, tabIndex, translateX, opacity, flash]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.value }));

  if (!isFocused) return <View style={styles.hidden} pointerEvents="none" />;

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.flash, flashStyle]} pointerEvents="none" />
      <Animated.View style={[styles.content, contentStyle]}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, overflow: 'hidden' },
  content: { flex: 1 },
  flash: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.teal, zIndex: 10 },
  hidden: { flex: 1 },
});
