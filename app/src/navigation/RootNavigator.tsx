import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabBar } from '@/components/TabBar';
import { AnimatedTabWrapper } from '@/navigation/AnimatedTabWrapper';
import { WelcomeScreen } from '@/screens/WelcomeScreen';
import { LoginScreen } from '@/screens/LoginScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { CourtsScreen } from '@/screens/CourtsScreen';
import { MessagesScreen } from '@/screens/MessagesScreen';
import { MyBookingsScreen } from '@/screens/MyBookingsScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { NewBookingScreen } from '@/screens/NewBookingScreen';
import { TournamentsScreen } from '@/screens/TournamentsScreen';
import { NewTournamentScreen } from '@/screens/NewTournamentScreen';
import { TournamentDetailsScreen } from '@/screens/TournamentDetailsScreen';
import { StatsScreen } from '@/screens/StatsScreen';
import { getAuthToken } from '@/api/client';
import { config } from '@/config';

type Stage = 'welcome' | 'login' | 'app';

function resolveStage(): Stage {
  if (config.useApi && getAuthToken()) return 'app';
  if (!config.useApi) return 'welcome';
  return 'welcome';
}

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PlaceholderBook() {
  return null;
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tab.Screen name="Inicio">
        {() => (
          <AnimatedTabWrapper routeName="Inicio">
            <HomeScreen />
          </AnimatedTabWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen name="Pistas">
        {() => (
          <AnimatedTabWrapper routeName="Pistas">
            <CourtsScreen />
          </AnimatedTabWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen name="Torneos">
        {() => (
          <AnimatedTabWrapper routeName="Torneos">
            <TournamentsScreen />
          </AnimatedTabWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen name="_Book" options={{ tabBarButton: () => null }} component={PlaceholderBook} />
      <Tab.Screen name="Mensajes">
        {() => (
          <AnimatedTabWrapper routeName="Mensajes">
            <MessagesScreen />
          </AnimatedTabWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen name="Reservas">
        {() => (
          <AnimatedTabWrapper routeName="Reservas">
            <MyBookingsScreen />
          </AnimatedTabWrapper>
        )}
      </Tab.Screen>
      <Tab.Screen name="Perfil">
        {() => (
          <AnimatedTabWrapper routeName="Perfil">
            <ProfileScreen />
          </AnimatedTabWrapper>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const [stage, setStage] = useState<Stage>(resolveStage);

  const enterApp = () => setStage('app');

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {stage === 'welcome' ? (
          <Stack.Screen name="Welcome">
            {() => (
              <WelcomeScreen
                onContinue={() => (config.useApi ? setStage('login') : setStage('app'))}
              />
            )}
          </Stack.Screen>
        ) : stage === 'login' ? (
          <Stack.Screen name="Login">
            {() => (
              <LoginScreen onLogged={enterApp} onBack={() => setStage('welcome')} />
            )}
          </Stack.Screen>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="NewBooking"
              component={NewBookingScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="NewTournament"
              component={NewTournamentScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="TournamentDetails"
              component={TournamentDetailsScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="StatsScreen"
              component={StatsScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
