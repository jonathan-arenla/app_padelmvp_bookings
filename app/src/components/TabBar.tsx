import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, fontSize } from '@/theme';
import { hapticSelection } from '@/lib/haptics';
import { useClubMessages } from '@/api/hooks';

const ICONS: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
  Inicio: ['home-outline', 'home'],
  Pistas: ['grid-outline', 'grid'],
  Torneos: ['trophy-outline', 'trophy'],
  Mensajes: ['chatbubbles-outline', 'chatbubbles'],
  Reservas: ['calendar-outline', 'calendar'],
  Perfil: ['person-outline', 'person'],
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { unreadCount } = useClubMessages();

  const onBookPress = () => {
    hapticSelection();
    const parent = navigation.getParent();
    if (parent?.navigate) parent.navigate('NewBooking');
    else navigation.navigate('NewBooking' as never);
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {state.routes.reduce<React.ReactNode[]>((acc, route, index) => {
        if (route.name === '_Book') {
          acc.push(
            <Pressable key="book" onPress={onBookPress} style={styles.tabMiddle}>
              <View style={styles.addCircle}>
                <Ionicons name="add" size={26} color="#FFF" />
              </View>
              <Text style={styles.labelMiddle}>RESERVAR</Text>
            </Pressable>,
          );
          return acc;
        }

        const focused = state.index === index;
        const [iconOff, iconOn] = ICONS[route.name] || ['ellipse-outline', 'ellipse'];

        const onPress = () => {
          hapticSelection();
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        const showBadge = route.name === 'Mensajes' && unreadCount > 0;

        acc.push(
          <Pressable key={route.key} onPress={onPress} style={styles.tab}>
            <View style={{ position: 'relative' }}>
              <Ionicons name={focused ? iconOn : iconOff} size={22} color={focused ? colors.teal : colors.textMuted} />
              {showBadge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.label, focused && { color: colors.teal }]}>{route.name.toUpperCase()}</Text>
            {focused && <View style={styles.dot} />}
          </Pressable>,
        );
        return acc;
      }, [])}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.bgLight,
    borderTopWidth: 1,
    borderTopColor: colors.separator,
    paddingTop: spacing.sm,
  },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3, paddingVertical: 4, minHeight: 48 },
  tabMiddle: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -22 },
  addCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.teal,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
    borderWidth: 3,
    borderColor: colors.bgLight,
  },
  label: { fontFamily: fonts.bodyBold, fontSize: fontSize.micro, letterSpacing: 0.5, color: colors.textMuted },
  labelMiddle: { fontFamily: fonts.bodyBold, fontSize: fontSize.micro, letterSpacing: 0.5, color: colors.teal, marginTop: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.teal, position: 'absolute', bottom: 2 },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  badgeText: { color: '#FFF', fontFamily: fonts.bodyBold, fontSize: 9 },
});
