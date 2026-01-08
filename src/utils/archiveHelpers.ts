/**
 * archiveHelpers.ts
 * Helper functions for Later item pruning and archiving
 */

import { FocusItem } from '../models/FocusItem';

/**
 * Calculate days an item has been in Later
 */
export function calculateDaysInLater(item: FocusItem): number {
  if (item.location !== 'later') return 0;

  const movedDate = item.movedToLaterAt
    ? new Date(item.movedToLaterAt)
    : new Date(item.createdAt);

  const now = new Date();
  const diffMs = now.getTime() - movedDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Check if an item should be reviewed (aged in Someday for > 30 days)
 */
export function shouldReviewItem(item: FocusItem, reviewThresholdDays: number = 30): boolean {
  if (item.location !== 'later') return false;
  if (item.timeBucket !== 'SOMEDAY') return false;

  const daysInLater = calculateDaysInLater(item);

  // Check if we've already prompted recently
  if (item.lastReviewPromptDate) {
    const lastPrompt = new Date(item.lastReviewPromptDate);
    const now = new Date();
    const daysSincePrompt = Math.floor(
      (now.getTime() - lastPrompt.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Don't prompt again within 7 days
    if (daysSincePrompt < 7) return false;
  }

  return daysInLater >= reviewThresholdDays;
}

/**
 * Get items that should be reviewed
 */
export function getItemsNeedingReview(
  items: FocusItem[],
  reviewThresholdDays: number = 30
): FocusItem[] {
  return items.filter(item => shouldReviewItem(item, reviewThresholdDays));
}

/**
 * Check if item should be auto-archived
 */
export function shouldAutoArchive(
  item: FocusItem,
  autoArchiveDays: number = 60
): boolean {
  if (item.location !== 'later') return false;
  if (item.timeBucket !== 'SOMEDAY') return false;

  const daysInLater = calculateDaysInLater(item);
  return daysInLater >= autoArchiveDays;
}

/**
 * Filter for bulk archive operations
 */
export interface ArchiveFilter {
  type: 'completed' | 'older-than' | 'someday-all' | 'custom';
  days?: number; // For 'older-than' type
  customFilter?: (item: FocusItem) => boolean;
}

/**
 * Get items matching archive filter
 */
export function getItemsMatchingFilter(
  items: FocusItem[],
  filter: ArchiveFilter
): FocusItem[] {
  switch (filter.type) {
    case 'completed':
      return items.filter(item => item.location === 'later' && item.completedAt);

    case 'older-than':
      const days = filter.days || 30;
      return items.filter(item => {
        if (item.location !== 'later') return false;
        return calculateDaysInLater(item) >= days;
      });

    case 'someday-all':
      return items.filter(
        item => item.location === 'later' && item.timeBucket === 'SOMEDAY'
      );

    case 'custom':
      if (!filter.customFilter) return [];
      return items.filter(filter.customFilter);

    default:
      return [];
  }
}

/**
 * Group archived items by recency
 */
export interface ArchivedItemGroup {
  title: string;
  items: FocusItem[];
}

export function groupArchivedItems(items: FocusItem[]): ArchivedItemGroup[] {
  const now = new Date();
  const groups: ArchivedItemGroup[] = [];

  const archivedItems = items.filter(item => item.location === 'archived');

  // This month
  const thisMonth = archivedItems.filter(item => {
    if (!item.archivedAt) return false;
    const archivedDate = new Date(item.archivedAt);
    const daysDiff = Math.floor((now.getTime() - archivedDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff < 30;
  });

  if (thisMonth.length > 0) {
    groups.push({
      title: `Archived this month (${thisMonth.length})`,
      items: thisMonth,
    });
  }

  // Older items
  const older = archivedItems.filter(item => {
    if (!item.archivedAt) return false;
    const archivedDate = new Date(item.archivedAt);
    const daysDiff = Math.floor((now.getTime() - archivedDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff >= 30;
  });

  if (older.length > 0) {
    groups.push({
      title: `Older items (${older.length})`,
      items: older,
    });
  }

  return groups;
}

/**
 * Format archived date for display
 */
export function formatArchivedDate(archivedAt?: string): string {
  if (!archivedAt) return '';

  const date = new Date(archivedAt);
  const now = new Date();
  const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) return 'Today';
  if (daysDiff === 1) return 'Yesterday';
  if (daysDiff < 7) return `${daysDiff} days ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Get archive statistics
 */
export interface ArchiveStats {
  totalArchived: number;
  archivedThisWeek: number;
  archivedThisMonth: number;
}

export function getArchiveStats(items: FocusItem[]): ArchiveStats {
  const now = new Date();
  const archivedItems = items.filter(item => item.location === 'archived');

  const thisWeek = archivedItems.filter(item => {
    if (!item.archivedAt) return false;
    const archivedDate = new Date(item.archivedAt);
    const daysDiff = Math.floor((now.getTime() - archivedDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff < 7;
  });

  const thisMonth = archivedItems.filter(item => {
    if (!item.archivedAt) return false;
    const archivedDate = new Date(item.archivedAt);
    const daysDiff = Math.floor((now.getTime() - archivedDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff < 30;
  });

  return {
    totalArchived: archivedItems.length,
    archivedThisWeek: thisWeek.length,
    archivedThisMonth: thisMonth.length,
  };
}
