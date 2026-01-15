import type { BrainDumpItem } from '@/src/models/BrainDumpItem';
import type { FocusItem } from '@/src/models/FocusItem';

export type DraggableType = 'braindump' | 'focus-today' | 'focus-later';
export type DroppableZone = 'braindump' | 'today' | 'later';

export interface DragData {
  type: DraggableType;
  item: BrainDumpItem | FocusItem;
  sourceZone: DroppableZone;
}

export function isBrainDumpItem(item: BrainDumpItem | FocusItem): item is BrainDumpItem {
  return 'text' in item && 'status' in item;
}

export function isFocusItem(item: BrainDumpItem | FocusItem): item is FocusItem {
  return 'title' in item && 'location' in item;
}
