/**
 * GuidesContext.tsx
 * Context provider for managing Guides
 *
 * Guides are ephemeral checklists for context transitions.
 * No tracking, no streaks, no analytics.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Guide, GuideSession, createCustomGuide } from '../models/Guide';
import { DEFAULT_GUIDES } from '../constants/defaultGuides';
import {
  loadCustomGuides,
  addCustomGuide,
  updateCustomGuide,
  deleteCustomGuide,
  countCustomGuides,
  loadActiveSession,
  saveActiveSession,
  clearActiveSession,
} from '../persistence/guidesStore';

interface GuidesContextValue {
  // State
  allGuides: Guide[]; // Default + Custom guides
  defaultGuides: Guide[];
  customGuides: Guide[];
  activeSession: GuideSession | null;
  isLoading: boolean;

  // Actions
  createGuide: (title: string, items: string[]) => Promise<void>;
  editGuide: (guideId: string, title: string, items: string[]) => Promise<void>;
  deleteGuide: (guideId: string) => Promise<void>;
  duplicateGuide: (guideId: string, newTitle: string) => Promise<void>;

  // Session actions
  startSession: (guideId: string) => Promise<void>;
  toggleItem: (itemId: string) => void;
  resetSession: () => Promise<void>;
  endSession: () => Promise<void>;

  // Validation
  canCreateCustomGuide: () => Promise<boolean>;
  getCustomGuideCount: () => number;
}

const GuidesContext = createContext<GuidesContextValue | undefined>(undefined);

const FREE_TIER_LIMIT = 3;

export function GuidesProvider({ children }: { children: ReactNode }) {
  const [customGuides, setCustomGuides] = useState<Guide[]>([]);
  const [activeSession, setActiveSession] = useState<GuideSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Combine default and custom guides
  const allGuides = [...DEFAULT_GUIDES, ...customGuides];

  // Load custom guides and active session on mount
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [guides, session] = await Promise.all([loadCustomGuides(), loadActiveSession()]);
      setCustomGuides(guides);
      setActiveSession(session);
    } catch (error) {
      console.error('Failed to load guides data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-clear stale sessions (check every minute)
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(async () => {
      const session = await loadActiveSession();
      if (!session) {
        // Session was auto-cleared by store
        setActiveSession(null);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [activeSession]);

  // Auto-save session when it changes
  useEffect(() => {
    if (activeSession) {
      saveActiveSession(activeSession);
    }
  }, [activeSession]);

  // ============================================================================
  // Guide Management Actions
  // ============================================================================

  const createGuide = async (title: string, items: string[]): Promise<void> => {
    const canCreate = await canCreateCustomGuide();
    if (!canCreate) {
      throw new Error(`Free tier limit reached. You can create up to ${FREE_TIER_LIMIT} custom guides.`);
    }

    const newGuide = createCustomGuide(title, items);
    await addCustomGuide(newGuide);
    setCustomGuides((prev) => [...prev, newGuide]);
  };

  const editGuide = async (guideId: string, title: string, items: string[]): Promise<void> => {
    // If editing a default guide, create a copy instead
    const isDefault = DEFAULT_GUIDES.some((g) => g.id === guideId);

    if (isDefault) {
      // Duplicate as a custom guide
      await duplicateGuide(guideId, title);
      // Update the new guide's items
      const newGuide = customGuides[customGuides.length - 1];
      await updateCustomGuide(newGuide.id, {
        title,
        items: items.map((text, index) => ({
          id: `${newGuide.id}-item-${index}`,
          text,
          checked: false,
        })),
      });
    } else {
      // Edit custom guide directly
      await updateCustomGuide(guideId, {
        title,
        items: items.map((text, index) => ({
          id: `${guideId}-item-${index}`,
          text,
          checked: false,
        })),
      });
      setCustomGuides((prev) => prev.map((g) => (g.id === guideId ? { ...g, title } : g)));
    }
  };

  const deleteGuide = async (guideId: string): Promise<void> => {
    await deleteCustomGuide(guideId);
    setCustomGuides((prev) => prev.filter((g) => g.id !== guideId));

    // If this guide has an active session, end it
    if (activeSession?.guideId === guideId) {
      await endSession();
    }
  };

  const duplicateGuide = async (guideId: string, newTitle: string): Promise<void> => {
    const canCreate = await canCreateCustomGuide();
    if (!canCreate) {
      throw new Error(`Free tier limit reached. You can create up to ${FREE_TIER_LIMIT} custom guides.`);
    }

    const sourceGuide = allGuides.find((g) => g.id === guideId);
    if (!sourceGuide) {
      throw new Error('Guide not found');
    }

    const itemTexts = sourceGuide.items.map((item) => item.text);
    const newGuide = createCustomGuide(newTitle, itemTexts);
    await addCustomGuide(newGuide);
    setCustomGuides((prev) => [...prev, newGuide]);
  };

  // ============================================================================
  // Session Management Actions
  // ============================================================================

  const startSession = async (guideId: string): Promise<void> => {
    const guide = allGuides.find((g) => g.id === guideId);
    if (!guide) {
      throw new Error('Guide not found');
    }

    const newSession: GuideSession = {
      guideId,
      checkedItems: [],
      lastActivityAt: new Date().toISOString(),
    };

    setActiveSession(newSession);
    await saveActiveSession(newSession);
  };

  const toggleItem = (itemId: string): void => {
    if (!activeSession) return;

    setActiveSession((prev) => {
      if (!prev) return prev;

      const isChecked = prev.checkedItems.includes(itemId);
      const newCheckedItems = isChecked
        ? prev.checkedItems.filter((id) => id !== itemId)
        : [...prev.checkedItems, itemId];

      return {
        ...prev,
        checkedItems: newCheckedItems,
        lastActivityAt: new Date().toISOString(),
      };
    });
  };

  const resetSession = async (): Promise<void> => {
    if (!activeSession) return;

    // Reset all checkmarks but keep the session active
    setActiveSession((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        checkedItems: [],
        lastActivityAt: new Date().toISOString(),
      };
    });
  };

  const endSession = async (): Promise<void> => {
    setActiveSession(null);
    await clearActiveSession();
  };

  // ============================================================================
  // Validation
  // ============================================================================

  const canCreateCustomGuide = async (): Promise<boolean> => {
    const count = await countCustomGuides();
    // TODO: Check paid tier status when implemented
    return count < FREE_TIER_LIMIT;
  };

  const getCustomGuideCount = (): number => {
    return customGuides.length;
  };

  const value: GuidesContextValue = {
    allGuides,
    defaultGuides: DEFAULT_GUIDES,
    customGuides,
    activeSession,
    isLoading,
    createGuide,
    editGuide,
    deleteGuide,
    duplicateGuide,
    startSession,
    toggleItem,
    resetSession,
    endSession,
    canCreateCustomGuide,
    getCustomGuideCount,
  };

  return <GuidesContext.Provider value={value}>{children}</GuidesContext.Provider>;
}

export function useGuides(): GuidesContextValue {
  const context = useContext(GuidesContext);
  if (!context) {
    throw new Error('useGuides must be used within a GuidesProvider');
  }
  return context;
}
