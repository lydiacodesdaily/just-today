/**
 * Onboarding.ts
 * Tracks user progress and dismissed hints - calm, respectful approach
 */

export interface OnboardingState {
  /** When user first launched the app */
  firstLaunchDate?: string;

  /** IDs of coach marks/hints that have been dismissed */
  dismissedHints: string[];

  /** Whether user completed the welcome tour */
  completedWelcomeTour: boolean;

  /** Usage tracking for determining when to hide example links */
  usage: {
    /** Total items added to Today list */
    todayItemsCreated: number;
    /** Total items added to Later list */
    laterItemsCreated: number;
    /** Total brain dump entries created */
    brainDumpEntriesCreated: number;
    /** Total characters typed in brain dump */
    brainDumpCharsTyped: number;
    /** Number of times user opened any guide */
    guidesOpened: number;
    /** Number of custom guides created by user */
    customGuidesCreated: number;
    /** Dates when user used Today/Later (format: YYYY-MM-DD) */
    daysActive: string[];
  };
}

export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  dismissedHints: [],
  completedWelcomeTour: false,
  usage: {
    todayItemsCreated: 0,
    laterItemsCreated: 0,
    brainDumpEntriesCreated: 0,
    brainDumpCharsTyped: 0,
    guidesOpened: 0,
    customGuidesCreated: 0,
    daysActive: [],
  },
};

/** Available hint IDs that can be dismissed */
export type HintId =
  | 'today-coach-mark'
  | 'later-coach-mark'
  | 'brain-dump-coach-mark'
  | 'guides-coach-mark';
