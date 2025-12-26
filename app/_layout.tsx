/**
 * _layout.tsx
 * Root layout with context providers.
 */

import { Stack } from 'expo-router';
import { SettingsProvider } from '../src/context/SettingsContext';
import { RunProvider } from '../src/context/RunContext';

export default function RootLayout() {
  return (
    <SettingsProvider>
      <RunProvider>
        <Stack>
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
        </Stack>
      </RunProvider>
    </SettingsProvider>
  );
}
