/**
 * guideStore.ts
 * Zustand store for managing Guides (ephemeral checklists for context transitions)
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Guide, GuideItem, GuideSession, createCustomGuide } from '@/src/models/Guide';
import { DEFAULT_GUIDES } from '@/src/constants/defaultGuides';

const CUSTOM_GUIDE_LIMIT = 3;
const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 60 minutes

interface GuideStore {
  // State
  customGuides: Guide[];
  activeSession: GuideSession | null;

  // Computed getters
  getAllGuides: () => Guide[];
  getGuideById: (id: string) => Guide | undefined;
  getCustomGuideCount: () => number;
  canCreateCustomGuide: () => boolean;

  // Guide management
  createGuide: (title: string, items: string[]) => string;
  editGuide: (guideId: string, title: string, items: string[]) => void;
  deleteGuide: (guideId: string) => void;
  duplicateGuide: (guideId: string, newTitle: string) => string;

  // Session management
  startSession: (guideId: string) => void;
  toggleItem: (itemId: string) => void;
  resetSession: () => void;
  endSession: () => void;

  // Internal helpers
  _checkSessionStale: () => void;
}

/**
 * Helper to check if a session is stale (inactive for > 60 minutes)
 */
function isSessionStale(session: GuideSession | null): boolean {
  if (!session) return false;
  const lastActivity = new Date(session.lastActivityAt).getTime();
  const now = Date.now();
  return now - lastActivity > SESSION_TIMEOUT_MS;
}

export const useGuideStore = create<GuideStore>()(
  persist(
    (set, get) => ({
      // Initial state
      customGuides: [],
      activeSession: null,

      // Get all guides (default + custom)
      getAllGuides: () => {
        const { customGuides } = get();
        return [...DEFAULT_GUIDES, ...customGuides];
      },

      // Get guide by ID
      getGuideById: (id: string) => {
        const allGuides = get().getAllGuides();
        return allGuides.find((guide) => guide.id === id);
      },

      // Get custom guide count
      getCustomGuideCount: () => {
        return get().customGuides.length;
      },

      // Check if user can create more custom guides
      canCreateCustomGuide: () => {
        return get().customGuides.length < CUSTOM_GUIDE_LIMIT;
      },

      // Create a new custom guide
      createGuide: (title, items) => {
        const state = get();
        if (!state.canCreateCustomGuide()) {
          throw new Error(`Cannot create more than ${CUSTOM_GUIDE_LIMIT} custom guides`);
        }

        const newGuide = createCustomGuide(title, items);

        set((state) => ({
          customGuides: [...state.customGuides, newGuide],
        }));

        return newGuide.id;
      },

      // Edit an existing guide (only custom guides can be edited)
      editGuide: (guideId, title, items) => {
        set((state) => ({
          customGuides: state.customGuides.map((guide) => {
            if (guide.id !== guideId) return guide;

            return {
              ...guide,
              title,
              items: items.map((text, index) => ({
                id: `${guideId}-item-${index}-${Date.now()}`,
                text,
                checked: false,
              })),
            };
          }),
        }));

        // If editing the guide that has an active session, clear the session
        const { activeSession } = get();
        if (activeSession && activeSession.guideId === guideId) {
          get().endSession();
        }
      },

      // Delete a custom guide
      deleteGuide: (guideId) => {
        set((state) => ({
          customGuides: state.customGuides.filter((guide) => guide.id !== guideId),
        }));

        // If deleting the guide that has an active session, clear the session
        const { activeSession } = get();
        if (activeSession && activeSession.guideId === guideId) {
          get().endSession();
        }
      },

      // Duplicate a guide (can duplicate default or custom)
      duplicateGuide: (guideId, newTitle) => {
        const state = get();
        if (!state.canCreateCustomGuide()) {
          throw new Error(`Cannot create more than ${CUSTOM_GUIDE_LIMIT} custom guides`);
        }

        const sourceGuide = state.getGuideById(guideId);
        if (!sourceGuide) {
          throw new Error('Guide not found');
        }

        const itemTexts = sourceGuide.items.map((item) => item.text);
        return state.createGuide(newTitle, itemTexts);
      },

      // Start a new session (or resume existing)
      startSession: (guideId) => {
        const state = get();
        state._checkSessionStale();

        const guide = state.getGuideById(guideId);
        if (!guide) {
          throw new Error('Guide not found');
        }

        // If there's already an active session for this guide, keep it
        const { activeSession } = get();
        if (activeSession && activeSession.guideId === guideId) {
          return;
        }

        // Otherwise, start a new session
        set({
          activeSession: {
            guideId,
            checkedItems: [],
            lastActivityAt: new Date().toISOString(),
          },
        });
      },

      // Toggle an item's checked state
      toggleItem: (itemId) => {
        const { activeSession } = get();
        if (!activeSession) return;

        const isChecked = activeSession.checkedItems.includes(itemId);

        set({
          activeSession: {
            ...activeSession,
            checkedItems: isChecked
              ? activeSession.checkedItems.filter((id) => id !== itemId)
              : [...activeSession.checkedItems, itemId],
            lastActivityAt: new Date().toISOString(),
          },
        });
      },

      // Reset session (uncheck all items, but keep session active)
      resetSession: () => {
        const { activeSession } = get();
        if (!activeSession) return;

        set({
          activeSession: {
            ...activeSession,
            checkedItems: [],
            lastActivityAt: new Date().toISOString(),
          },
        });
      },

      // End the current session
      endSession: () => {
        set({ activeSession: null });
      },

      // Check if session is stale and clear it if so
      _checkSessionStale: () => {
        const { activeSession } = get();
        if (isSessionStale(activeSession)) {
          set({ activeSession: null });
        }
      },
    }),
    {
      name: 'guide-storage',
    }
  )
);
