'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { useBrainDumpStore } from '@/src/stores/brainDumpStore';
import { useFocusStore } from '@/src/stores/focusStore';
import type { DragData, DroppableZone } from '@/src/lib/dnd/types';
import { isBrainDumpItem, isFocusItem } from '@/src/lib/dnd/types';
import { DragOverlayContent } from './DragOverlayContent';

interface DndProviderProps {
  children: React.ReactNode;
}

export function DndProvider({ children }: DndProviderProps) {
  const [activeData, setActiveData] = useState<DragData | null>(null);

  // Brain dump store actions
  const removeFromBrainDump = useBrainDumpStore((state) => state.removeItem);
  const restoreToBrainDump = useBrainDumpStore((state) => state.restoreItem);

  // Focus store actions
  const addFromBrainDump = useFocusStore((state) => state.addFromBrainDump);
  const moveToToday = useFocusStore((state) => state.moveToToday);
  const moveToLater = useFocusStore((state) => state.moveToLater);
  const deleteFromFocus = useFocusStore((state) => state.deleteItem);
  const reorderTodayItems = useFocusStore((state) => state.reorderTodayItems);
  const reorderLaterItems = useFocusStore((state) => state.reorderLaterItems);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before starting drag
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DragData | undefined;
    if (data) {
      setActiveData(data);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveData(null);

    if (!over || !active.data.current) return;

    const dragData = active.data.current as DragData;
    const overId = over.id as string;

    // Check if we're dropping on another item (reordering within zone)
    const overData = over.data.current as DragData | undefined;
    if (overData && overData.sourceZone === dragData.sourceZone) {
      // Same zone - reorder
      if (active.id !== over.id) {
        handleReorder(dragData.sourceZone, active.id as string, overId);
      }
      return;
    }

    // Check if dropping on a zone (cross-zone move)
    const targetZone = overId as DroppableZone;
    if (dragData.sourceZone === targetZone) return;

    handleMove(dragData, targetZone);
  };

  const handleReorder = (zone: DroppableZone, activeId: string, overId: string) => {
    if (zone === 'today') {
      reorderTodayItems(activeId, overId);
    } else if (zone === 'later') {
      reorderLaterItems(activeId, overId);
    }
    // Brain dump reordering could be added later if needed
  };

  const handleMove = (dragData: DragData, targetZone: DroppableZone) => {
    const { item, sourceZone } = dragData;

    // Brain Dump -> Today
    if (sourceZone === 'braindump' && targetZone === 'today' && isBrainDumpItem(item)) {
      removeFromBrainDump(item.id);
      addFromBrainDump(item, 'today');
    }
    // Brain Dump -> Later
    else if (sourceZone === 'braindump' && targetZone === 'later' && isBrainDumpItem(item)) {
      removeFromBrainDump(item.id);
      addFromBrainDump(item, 'later');
    }
    // Today -> Later
    else if (sourceZone === 'today' && targetZone === 'later' && isFocusItem(item)) {
      moveToLater(item.id);
    }
    // Later -> Today
    else if (sourceZone === 'later' && targetZone === 'today' && isFocusItem(item)) {
      moveToToday(item.id);
    }
    // Today -> Brain Dump
    else if (sourceZone === 'today' && targetZone === 'braindump' && isFocusItem(item)) {
      deleteFromFocus(item.id);
      restoreToBrainDump(item.title);
    }
    // Later -> Brain Dump
    else if (sourceZone === 'later' && targetZone === 'braindump' && isFocusItem(item)) {
      deleteFromFocus(item.id);
      restoreToBrainDump(item.title);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay>
        {activeData && <DragOverlayContent data={activeData} />}
      </DragOverlay>
    </DndContext>
  );
}
