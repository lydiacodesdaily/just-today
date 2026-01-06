/**
 * (tabs)/guides.tsx
 * Guides tab - redirects to guides/index
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

export default function GuidesTab() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/guides' as any);
  }, []);

  return <View />;
}
