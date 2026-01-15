'use client';

import type { DragData } from '@/src/lib/dnd/types';
import { isBrainDumpItem, isFocusItem } from '@/src/lib/dnd/types';

interface DragOverlayContentProps {
  data: DragData;
}

export function DragOverlayContent({ data }: DragOverlayContentProps) {
  const { item } = data;

  // Get the display text based on item type
  const displayText = isBrainDumpItem(item) ? item.text : item.title;

  return (
    <div className="bg-calm-surface border border-calm-border rounded-lg p-3 shadow-lg max-w-xs">
      <p className="text-sm text-calm-text truncate">{displayText}</p>
    </div>
  );
}
