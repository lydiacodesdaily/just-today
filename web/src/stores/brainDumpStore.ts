/**
 * brainDumpStore.ts
 * Zustand store for managing Brain Dump items
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BrainDumpItem, createBrainDumpItem, isItemExpired } from '@/src/models/BrainDumpItem';

interface BrainDumpStore {
  // State
  items: BrainDumpItem[];

  // Actions
  addItem: (text: string) => void;
  keepItem: (itemId: string) => void;
  deleteItem: (itemId: string) => void;
  removeItem: (itemId: string) => void; // Remove without marking as kept (for drag-drop)
  restoreItem: (text: string) => void; // Restore from focus item back to brain dump
  cleanupExpired: () => void;
}

export const useBrainDumpStore = create<BrainDumpStore>()(
  persist(
    (set) => ({
      // Initial state
      items: [],

      // Add new brain dump item
      addItem: (text) => {
        const item = createBrainDumpItem(text);
        set((state) => ({
          items: [item, ...state.items], // Add to beginning
        }));
      },

      // Keep item (mark as kept)
      keepItem: (itemId) => {
        const now = new Date().toISOString();
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, status: 'kept' as const, keptAt: now } : item
          ),
        }));
      },

      // Delete item
      deleteItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      // Remove item without marking as kept (for drag-drop to Today/Later)
      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      // Restore item from focus back to brain dump (for drag-drop from Today/Later)
      restoreItem: (text) => {
        const item = createBrainDumpItem(text);
        set((state) => ({
          items: [item, ...state.items],
        }));
      },

      // Cleanup expired items (24+ hours old, unsorted)
      cleanupExpired: () => {
        set((state) => ({
          items: state.items.filter((item) => !isItemExpired(item)),
        }));
      },
    }),
    {
      name: 'brain-dump-storage',
    }
  )
);
