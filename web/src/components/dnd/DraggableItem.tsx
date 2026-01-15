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
      className={`${isDragging ? 'opacity-60 scale-[1.01] z-50 shadow-lg' : ''} transition-all duration-200`}
    >
      <div className="relative flex items-stretch">
        {/* Drag handle - always visible indicator on the left */}
        <button
          {...listeners}
          {...attributes}
          className="flex-shrink-0 w-6 flex items-center justify-center rounded-l-lg bg-calm-border/40 group-hover:bg-calm-border/70 cursor-grab active:cursor-grabbing touch-manipulation transition-colors"
          aria-label="Drag to move item"
        >
          <div className="flex flex-col gap-[3px] opacity-40 group-hover:opacity-70 transition-opacity">
            <div className="w-1 h-1 rounded-full bg-calm-muted" />
            <div className="w-1 h-1 rounded-full bg-calm-muted" />
            <div className="w-1 h-1 rounded-full bg-calm-muted" />
          </div>
        </button>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
