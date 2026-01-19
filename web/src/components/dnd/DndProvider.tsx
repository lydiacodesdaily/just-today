'use client';

import { useState, createContext, useContext } from 'react';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  CollisionDetection,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { useBrainDumpStore } from '@/src/stores/brainDumpStore';
import { useFocusStore } from '@/src/stores/focusStore';
import type { DragData, DroppableZone as DroppableZoneType } from '@/src/lib/dnd/types';
import { isBrainDumpItem, isFocusItem } from '@/src/lib/dnd/types';
import { DragOverlayContent } from './DragOverlayContent';

// Context to share drag state with droppable zones
interface DndStateContextType {
  overZone: DroppableZoneType | null;
  isDragging: boolean;
}

const DndStateContext = createContext<DndStateContextType>({
  overZone: null,
  isDragging: false,
});

export const useDndState = () => useContext(DndStateContext);

interface DndProviderProps {
  children: React.ReactNode;
}

// Helper to check if an ID is a droppable zone
const isDroppableZone = (id: UniqueIdentifier): boolean => {
  return id === 'braindump' || id === 'today' || id === 'later';
};

// Custom collision detection that prioritizes droppable zones for cross-zone drops
// and items for same-zone reordering
const customCollisionDetection: CollisionDetection = (args) => {
  const { droppableContainers, active } = args;

  // Get the active item's source zone
  const activeData = active.data.current as DragData | undefined;
  const sourceZone = activeData?.sourceZone;

  // First, check for pointer intersection with any droppable
  const pointerCollisions = pointerWithin(args);

  if (pointerCollisions.length > 0) {
    // Separate zone containers from item containers
    const zoneCollisions: typeof pointerCollisions = [];
    const itemCollisions: typeof pointerCollisions = [];

    for (const collision of pointerCollisions) {
      if (isDroppableZone(collision.id)) {
        zoneCollisions.push(collision);
      } else {
        itemCollisions.push(collision);
      }
    }

    // If we have item collisions in the same zone, prioritize them for reordering
    const sameZoneItemCollisions = itemCollisions.filter((collision) => {
      const container = droppableContainers.find((c) => c.id === collision.id);
      const itemData = container?.data.current as DragData | undefined;
      return itemData?.sourceZone === sourceZone;
    });

    if (sameZoneItemCollisions.length > 0) {
      return sameZoneItemCollisions;
    }

    // Otherwise, prioritize zone collisions for cross-zone drops
    if (zoneCollisions.length > 0) {
      return zoneCollisions;
    }

    // Fall back to any item collisions
    if (itemCollisions.length > 0) {
      return itemCollisions;
    }
  }

  // Fall back to rect intersection
  return rectIntersection(args);
};

export function DndProvider({ children }: DndProviderProps) {
  const [activeData, setActiveData] = useState<DragData | null>(null);
  const [overZone, setOverZone] = useState<DroppableZoneType | null>(null);

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

  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event;

    if (!over || !active.data.current) {
      setOverZone(null);
      return;
    }

    const overId = over.id as string;
    const dragData = active.data.current as DragData;

    // Check if hovering over a zone
    if (overId === 'braindump' || overId === 'today' || overId === 'later') {
      // Only highlight if it's a different zone
      if (overId !== dragData.sourceZone) {
        setOverZone(overId as DroppableZoneType);
      } else {
        setOverZone(null);
      }
      return;
    }

    // Check if hovering over an item in a different zone
    const overData = over.data.current as DragData | undefined;
    if (overData && overData.sourceZone !== dragData.sourceZone) {
      setOverZone(overData.sourceZone);
    } else {
      setOverZone(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveData(null);
    setOverZone(null);

    if (!over || !active.data.current) return;

    const dragData = active.data.current as DragData;
    const overId = over.id as string;

    // Check if we're dropping on another item
    const overData = over.data.current as DragData | undefined;

    if (overData) {
      // Dropping on an item
      if (overData.sourceZone === dragData.sourceZone) {
        // Same zone - reorder
        if (active.id !== over.id) {
          handleReorder(dragData.sourceZone, active.id as string, overId);
        }
      } else {
        // Different zone - move to that zone
        handleMove(dragData, overData.sourceZone);
      }
      return;
    }

    // Dropping on a zone directly
    const targetZone = overId as DroppableZoneType;
    if (targetZone === 'braindump' || targetZone === 'today' || targetZone === 'later') {
      if (dragData.sourceZone !== targetZone) {
        handleMove(dragData, targetZone);
      }
    }
  };

  const handleReorder = (zone: DroppableZoneType, activeId: string, overId: string) => {
    if (zone === 'today') {
      reorderTodayItems(activeId, overId);
    } else if (zone === 'later') {
      reorderLaterItems(activeId, overId);
    }
    // Brain dump reordering could be added later if needed
  };

  const handleMove = (dragData: DragData, targetZone: DroppableZoneType) => {
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
    <DndStateContext.Provider value={{ overZone, isDragging: activeData !== null }}>
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay>
          {activeData && <DragOverlayContent data={activeData} />}
        </DragOverlay>
      </DndContext>
    </DndStateContext.Provider>
  );
}
