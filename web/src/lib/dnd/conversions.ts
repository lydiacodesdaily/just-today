import type { BrainDumpItem } from '@/src/models/BrainDumpItem';
import type { FocusItem, FocusDuration } from '@/src/models/FocusItem';

/**
 * Convert a BrainDumpItem to a FocusItem
 * Used when dragging from Brain Dump to Today or Later
 */
export function brainDumpToFocusItem(
  item: BrainDumpItem,
  location: 'today' | 'later'
): FocusItem {
  const now = new Date().toISOString();
  const randomId = Math.random().toString(36).substr(2, 9);

  return {
    id: `focus-${Date.now()}-${randomId}`,
    title: item.text,
    estimatedDuration: '~15 min' as FocusDuration,
    location,
    createdAt: now,
    ...(location === 'today' && { addedToTodayAt: now }),
    ...(location === 'later' && { movedToLaterAt: now }),
  };
}

/**
 * Convert a FocusItem to a BrainDumpItem
 * Used when dragging from Today or Later back to Brain Dump
 */
export function focusItemToBrainDump(item: FocusItem): BrainDumpItem {
  const now = new Date().toISOString();
  const randomId = Math.random().toString(36).substr(2, 9);

  return {
    id: `braindump-${Date.now()}-${randomId}`,
    text: item.title,
    createdAt: now,
    status: 'unsorted',
  };
}
