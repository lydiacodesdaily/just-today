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
        name="transitions"
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
        name="extras/setup"
        options={{
          title: 'Extras',
          headerShown: false,
        }}
      />
    </Stack>
  );
}

/** Root stack - no longer blocks on pace selection */
function RootStack() {
  const theme = useTheme();
  const { isLoading } = usePace();

  // Show loading state while initializing pace context
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Show main app - pace prompt will appear as banner on home screen
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
