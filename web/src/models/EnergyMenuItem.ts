/**
 * EnergyMenuItem.ts
 * Defines Energy Menu items - reusable optional actions tagged by energy level.
 *
 * Energy Menu items are NOT routines and never become part of routine templates.
 * They are optional actions that users can add to Today based on their current capacity.
 */

export type EnergyLevel = 'low' | 'steady' | 'flow';
export type EstimatedDuration = '~5 min' | '~10 min' | '~15 min' | '~25 min';

/**
 * An Energy Menu item - a reusable action that can be added to Today
 */
export interface EnergyMenuItem {
  id: string;
  title: string;
  energyLevel: EnergyLevel;
  estimatedDuration?: EstimatedDuration;
  createdAt: number;
  updatedAt: number;
}

/**
 * A Today Optional Item - an instance of an Energy Menu item added to Today
 * These expire daily and do not roll over.
 */
export interface TodayOptionalItem {
  id: string; // unique ID for this instance
  menuItemId: string; // references the EnergyMenuItem
  title: string;
  estimatedDuration?: EstimatedDuration;
  addedAt: number;
  completedAt?: number;
  focusStartedAt?: number;
  focusEndedAt?: number;
}
