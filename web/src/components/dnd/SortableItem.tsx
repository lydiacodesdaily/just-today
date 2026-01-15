'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { DraggableType, DroppableZone, DragData } from '@/src/lib/dnd/types';
import type { BrainDumpItem } from '@/src/models/BrainDumpItem';
import type { FocusItem } from '@/src/models/FocusItem';

interface SortableItemProps {
  id: string;
  type: DraggableType;
  sourceZone: DroppableZone;
  item: BrainDumpItem | FocusItem;
  children: React.ReactNode;
  disabled?: boolean;
}

export function SortableItem({
  id,
  type,
  sourceZone,
  item,
  children,
  disabled = false,
}: SortableItemProps) {
  const dragData: DragData = { type, item, sourceZone };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: dragData,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50 scale-[1.02] z-50' : ''} transition-transform`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...listeners}
          {...attributes}
          className="flex-shrink-0 p-1.5 -ml-1 text-calm-muted hover:text-calm-text cursor-grab active:cursor-grabbing touch-manipulation opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          aria-label="Drag to reorder item"
        >
          <svg
            width="12"
            height="16"
            viewBox="0 0 12 16"
            fill="currentColor"
            className="pointer-events-none"
          >
            <circle cx="3" cy="3" r="1.5" />
            <circle cx="9" cy="3" r="1.5" />
            <circle cx="3" cy="8" r="1.5" />
            <circle cx="9" cy="8" r="1.5" />
            <circle cx="3" cy="13" r="1.5" />
            <circle cx="9" cy="13" r="1.5" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
