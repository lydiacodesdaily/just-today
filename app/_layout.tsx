/**
 * _layout.tsx
 * Root layout with context providers.
 */

import { Stack } from 'expo-router';
import { SettingsProvider } from '../src/context/SettingsContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { RunProvider } from '../src/context/RunContext';
import { TodayOptionalProvider } from '../src/context/TodayOptionalContext';
import { FocusProvider } from '../src/context/FocusContext';
import { BrainDumpProvider } from '../src/context/BrainDumpContext';
import { useTheme } from '../src/constants/theme';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

function RootStack() {
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

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <ThemeProvider>
          <RunProvider>
            <TodayOptionalProvider>
              <FocusProvider>
                <BrainDumpProvider>
                  <RootStack />
                </BrainDumpProvider>
              </FocusProvider>
            </TodayOptionalProvider>
          </RunProvider>
        </ThemeProvider>
      </SettingsProvider>
    </ErrorBoundary>
  );
}
