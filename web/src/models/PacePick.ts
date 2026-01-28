/**
 * PacePick.ts
 * Defines Extra items - reusable optional actions tagged by pace.
 *
 * Extra items are NOT routines and never become part of routine templates.
 * They are optional actions that users can add to Today based on their current capacity.
 */

export type PaceTag = 'low' | 'steady' | 'flow';
export type EstimatedDuration = '~5 min' | '~10 min' | '~15 min' | '~25 min';

/**
 * An Extra item - a reusable action that can be added to Today
 */
export interface PacePickItem {
  id: string;
  title: string;
  paceTag: PaceTag;
  estimatedDuration?: EstimatedDuration;
  createdAt: number;
  updatedAt: number;
}

/**
 * A Today Optional Item - an instance of an Extra item added to Today
 * These expire daily and do not roll over.
 */
export interface TodayOptionalItem {
  id: string; // unique ID for this instance
  menuItemId: string; // references the PacePickItem
  title: string;
  estimatedDuration?: EstimatedDuration;
  addedAt: number;
  completedAt?: number;
  focusStartedAt?: number;
  focusEndedAt?: number;
}
