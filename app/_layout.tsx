/**
 * _layout.tsx
 * Root layout with context providers.
 */

import { Stack } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SettingsProvider } from '../src/context/SettingsContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { PaceProvider, usePace } from '../src/context/PaceContext';
import { RunProvider } from '../src/context/RunContext';
import { TodayOptionalProvider } from '../src/context/TodayOptionalContext';
import { FocusProvider } from '../src/context/FocusContext';
import { BrainDumpProvider } from '../src/context/BrainDumpContext';
import { GuidesProvider } from '../src/context/GuidesContext';
import { useTheme } from '../src/constants/theme';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { DailyPaceGate } from '../src/components/DailyPaceGate';

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
        name="pace-picks/setup"
        options={{
          title: 'Pace Picks',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

/** Shows pace gate on first open of day, then the main app */
function RootStack() {
  const theme = useTheme();
  const { hasSelectedForToday, isLoading } = usePace();

  // Show loading state while checking energy selection
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Show pace gate if user hasn't selected pace today
  if (!hasSelectedForToday) {
    return <DailyPaceGate />;
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
            <PaceProvider>
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
            </PaceProvider>
          </ThemeProvider>
        </SettingsProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
