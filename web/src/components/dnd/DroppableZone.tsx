'use client';

import { useDroppable } from '@dnd-kit/core';
import type { DroppableZone as DroppableZoneType } from '@/src/lib/dnd/types';
import { useDndState } from './DndProvider';

interface DroppableZoneProps {
  id: DroppableZoneType;
  children: React.ReactNode;
  className?: string;
}

export function DroppableZone({ id, children, className = '' }: DroppableZoneProps) {
  const { setNodeRef } = useDroppable({
    id,
  });
  const { overZone, isDragging } = useDndState();

  // This zone is highlighted when dragging and the pointer is over it
  const isHighlighted = isDragging && overZone === id;

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${
        isHighlighted
          ? 'ring-2 ring-calm-primary/50 ring-offset-2 ring-offset-calm-bg rounded-lg bg-calm-primary/5'
          : isDragging
          ? 'ring-1 ring-calm-border ring-offset-1 ring-offset-calm-bg rounded-lg ring-dashed'
          : ''
      } transition-all duration-200`}
    >
      {children}
    </div>
  );
}
