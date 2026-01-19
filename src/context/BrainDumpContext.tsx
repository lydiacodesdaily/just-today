/**
 * BrainDumpContext.tsx
 * Context provider for managing Brain Dump items
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { BrainDumpItem } from '../models/BrainDumpItem';
import {
  loadUnsortedItems,
  addBrainDumpItem,
  keepBrainDumpItem,
  deleteBrainDumpItem,
  updateBrainDumpItem,
  cleanupExpiredItems,
} from '../persistence/brainDumpStore';

interface BrainDumpContextValue {
  // State
  items: BrainDumpItem[];
  isLoading: boolean;

  // Actions
  addItem: (text: string) => Promise<BrainDumpItem>;
  updateItem: (itemId: string, newText: string) => Promise<void>;
  keepItem: (itemId: string) => Promise<void>;
  deleteItem: (itemId: string) => Promise<void>;
  refreshItems: () => Promise<void>;
}

const BrainDumpContext = createContext<BrainDumpContextValue | undefined>(undefined);

export function BrainDumpProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BrainDumpItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load items on mount
  const loadItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const unsortedItems = await loadUnsortedItems();
      setItems(unsortedItems);
    } catch (error) {
      console.error('Failed to load brain dump items:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Cleanup expired items periodically (every hour)
  useEffect(() => {
    const interval = setInterval(async () => {
      await cleanupExpiredItems();
      await loadItems();
    }, 3600000); // Check every hour

    return () => clearInterval(interval);
  }, [loadItems]);

  // Actions
  const addItem = async (text: string): Promise<BrainDumpItem> => {
    const newItem = await addBrainDumpItem(text);
    setItems((prev) => [...prev, newItem]);
    return newItem;
  };

  const updateItem = async (itemId: string, newText: string): Promise<void> => {
    await updateBrainDumpItem(itemId, newText);
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, text: newText } : item))
    );
  };

  const keepItem = async (itemId: string): Promise<void> => {
    await keepBrainDumpItem(itemId);
    // Remove from unsorted items immediately (optimistic update)
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const deleteItem = async (itemId: string): Promise<void> => {
    await deleteBrainDumpItem(itemId);
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const refreshItems = async (): Promise<void> => {
    await loadItems();
  };

  const value: BrainDumpContextValue = {
    items,
    isLoading,
    addItem,
    updateItem,
    keepItem,
    deleteItem,
    refreshItems,
  };

  return <BrainDumpContext.Provider value={value}>{children}</BrainDumpContext.Provider>;
}

export function useBrainDump(): BrainDumpContextValue {
  const context = useContext(BrainDumpContext);
  if (!context) {
    throw new Error('useBrainDump must be used within a BrainDumpProvider');
  }
  return context;
}
