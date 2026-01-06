/**
 * useAutoCheck.ts
 * Hook for automatic daily checks and cleanup
 */

'use client';

import { useEffect } from 'react';
import { useFocusStore } from '@/src/stores/focusStore';
import { useBrainDumpStore } from '@/src/stores/brainDumpStore';
import { useEnergyMenuStore } from '@/src/stores/energyMenuStore';

/**
 * Hook that runs periodic checks for:
 * - Daily rollover (Today -> Later)
 * - Brain dump item expiration
 * - Energy menu daily reset
 */
export function useAutoCheck() {
  const checkAndRollover = useFocusStore((state) => state.checkAndRollover);
  const cleanupExpired = useBrainDumpStore((state) => state.cleanupExpired);
  const checkAndResetDaily = useEnergyMenuStore((state) => state.checkAndResetDaily);

  useEffect(() => {
    // Run checks immediately on mount
    checkAndRollover();
    cleanupExpired();
    checkAndResetDaily();

    // Set up interval to check every minute
    const interval = setInterval(() => {
      checkAndRollover();
      cleanupExpired();
      checkAndResetDaily();
    }, 60 * 1000); // 60 seconds

    return () => clearInterval(interval);
  }, [checkAndRollover, cleanupExpired, checkAndResetDaily]);
}
