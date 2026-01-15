'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { DraggableType, DroppableZone, DragData } from '@/src/lib/dnd/types';
import type { BrainDumpItem } from '@/src/models/BrainDumpItem';
import type { FocusItem } from '@/src/models/FocusItem';

interface DraggableItemProps {
  id: string;
  type: DraggableType;
  sourceZone: DroppableZone;
  item: BrainDumpItem | FocusItem;
  children: React.ReactNode;
  disabled?: boolean;
}

export function DraggableItem({
  id,
  type,
  sourceZone,
  item,
  children,
  disabled = false,
}: DraggableItemProps) {
  const dragData: DragData = { type, item, sourceZone };

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: dragData,
    disabled,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50 scale-[1.02]' : ''} transition-transform`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...listeners}
          {...attributes}
          className="flex-shrink-0 p-1.5 -ml-1 text-calm-muted hover:text-calm-text cursor-grab active:cursor-grabbing touch-manipulation opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
          aria-label="Drag to move item"
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
