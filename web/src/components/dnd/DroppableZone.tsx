'use client';

import { useDroppable } from '@dnd-kit/core';
import type { DroppableZone as DroppableZoneType } from '@/src/lib/dnd/types';

interface DroppableZoneProps {
  id: DroppableZoneType;
  children: React.ReactNode;
  className?: string;
}

export function DroppableZone({ id, children, className = '' }: DroppableZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${
        isOver ? 'ring-2 ring-calm-text/30 ring-offset-2 ring-offset-calm-bg rounded-lg' : ''
      } transition-all duration-200`}
    >
      {children}
    </div>
  );
}
