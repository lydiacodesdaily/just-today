/**
 * _layout.tsx
 * Root layout with context providers.
 */

import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SettingsProvider } from '../src/context/SettingsContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { EnergyProvider, useEnergy } from '../src/context/EnergyContext';
import { RunProvider } from '../src/context/RunContext';
import { TodayOptionalProvider } from '../src/context/TodayOptionalContext';
import { FocusProvider } from '../src/context/FocusContext';
import { BrainDumpProvider } from '../src/context/BrainDumpContext';
import { GuidesProvider } from '../src/context/GuidesContext';
import { useTheme } from '../src/constants/theme';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { DailyEnergyGate } from '../src/components/DailyEnergyGate';

function AppStack() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="guides"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="routine/[id]"
        options={{
          title: 'Edit Routine',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="routine/run"
        options={{
          title: 'Running',
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="energy-menu/setup"
        options={{
          title: 'Energy Menu',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

/** Shows energy gate on first open of day, then the main app */
function RootStack() {
  const theme = useTheme();
  const { hasSelectedForToday, isLoading } = useEnergy();

  // Show loading state while checking energy selection
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Show energy gate if user hasn't selected energy today
  if (!hasSelectedForToday) {
    return <DailyEnergyGate />;
  }

  // Show main app
  return <AppStack />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SettingsProvider>
          <ThemeProvider>
            <EnergyProvider>
              <RunProvider>
                <TodayOptionalProvider>
                  <FocusProvider>
                    <BrainDumpProvider>
                      <GuidesProvider>
                        <RootStack />
                      </GuidesProvider>
                    </BrainDumpProvider>
                  </FocusProvider>
                </TodayOptionalProvider>
              </RunProvider>
            </EnergyProvider>
          </ThemeProvider>
        </SettingsProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
