/**
 * timerEngine.test.ts
 * Unit tests for timer calculation functions.
 */

import { computeRemainingTime, formatTime, formatTimeRemaining } from '../timerEngine';
import { RunTask } from '../../models/RoutineRun';

describe('timerEngine', () => {
  describe('computeRemainingTime', () => {
    const baseTask: RunTask = {
      id: 'task-1',
      templateTaskId: 'template-1',
      name: 'Test Task',
      durationMs: 5 * 60 * 1000, // 5 minutes
      status: 'active',
      order: 0,
      startedAt: null,
      plannedEndAt: null,
      extensionMs: 0,
      completedAt: null,
      overtimeAnnouncedMinutes: [],
      milestoneAnnouncedMinutes: [],
      autoAdvance: false,
      autoAdvanceWarningAnnounced: false,
      timeUpAnnounced: false,
    };

    it('returns null for task without startedAt', () => {
      const task = { ...baseTask, startedAt: null, plannedEndAt: null };
      const result = computeRemainingTime(task);
      expect(result).toBeNull();
    });

    it('returns null for task without plannedEndAt', () => {
      const task = { ...baseTask, startedAt: Date.now(), plannedEndAt: null };
      const result = computeRemainingTime(task);
      expect(result).toBeNull();
    });

    it('calculates remaining time correctly', () => {
      const now = Date.now();
      const startedAt = now - 2 * 60 * 1000; // Started 2 minutes ago
      const plannedEndAt = startedAt + 5 * 60 * 1000; // 5 minute duration

      const task = { ...baseTask, startedAt, plannedEndAt };
      const result = computeRemainingTime(task, false, null);

      expect(result).not.toBeNull();
      expect(result!.isOvertime).toBe(false);
      expect(result!.remainingMs).toBeCloseTo(3 * 60 * 1000, -2); // ~3 minutes remaining
      expect(result!.elapsedMs).toBeCloseTo(2 * 60 * 1000, -2); // ~2 minutes elapsed
    });

    it('detects overtime correctly', () => {
      const now = Date.now();
      const startedAt = now - 7 * 60 * 1000; // Started 7 minutes ago
      const plannedEndAt = startedAt + 5 * 60 * 1000; // 5 minute duration

      const task = { ...baseTask, startedAt, plannedEndAt };
      const result = computeRemainingTime(task, false, null);

      expect(result).not.toBeNull();
      expect(result!.isOvertime).toBe(true);
      expect(result!.overtimeMs).toBeCloseTo(2 * 60 * 1000, -2); // ~2 minutes overtime
      expect(result!.remainingMs).toBeLessThan(0);
    });

    it('respects pause state', () => {
      const now = Date.now();
      const startedAt = now - 10 * 60 * 1000; // Started 10 minutes ago
      const pausedAt = now - 5 * 60 * 1000; // Paused 5 minutes ago
      const plannedEndAt = startedAt + 5 * 60 * 1000; // 5 minute duration

      const task = { ...baseTask, startedAt, plannedEndAt };

      // When paused, time should be calculated from pausedAt, not now
      const result = computeRemainingTime(task, true, pausedAt);

      expect(result).not.toBeNull();
      // At pause time (5 min after start), there should be 0 minutes remaining
      expect(result!.remainingMs).toBeCloseTo(0, -2);
    });

    it('includes extensions in total planned time', () => {
      const now = Date.now();
      const startedAt = now - 1 * 60 * 1000; // Started 1 minute ago
      const extensionMs = 2 * 60 * 1000; // Extended by 2 minutes
      const plannedEndAt = startedAt + 5 * 60 * 1000 + extensionMs; // 7 minutes total

      const task = { ...baseTask, startedAt, plannedEndAt, extensionMs };
      const result = computeRemainingTime(task, false, null);

      expect(result).not.toBeNull();
      expect(result!.totalPlannedMs).toBe(7 * 60 * 1000);
    });
  });

  describe('formatTime', () => {
    it('formats zero correctly', () => {
      expect(formatTime(0)).toBe('0:00');
    });

    it('formats seconds correctly', () => {
      expect(formatTime(45 * 1000)).toBe('0:45');
    });

    it('formats minutes correctly', () => {
      expect(formatTime(5 * 60 * 1000)).toBe('5:00');
    });

    it('formats minutes and seconds correctly', () => {
      expect(formatTime(3 * 60 * 1000 + 27 * 1000)).toBe('3:27');
    });

    it('handles negative values by taking absolute', () => {
      expect(formatTime(-2 * 60 * 1000 - 15 * 1000)).toBe('2:15');
    });

    it('pads seconds with zero', () => {
      expect(formatTime(1 * 60 * 1000 + 5 * 1000)).toBe('1:05');
    });
  });

  describe('formatTimeRemaining', () => {
    it('formats normal time remaining', () => {
      const timeRemaining = {
        remainingMs: 3 * 60 * 1000,
        isOvertime: false,
        overtimeMs: 0,
        elapsedMs: 2 * 60 * 1000,
        totalPlannedMs: 5 * 60 * 1000,
        totalMs: 3 * 60 * 1000,
      };
      expect(formatTimeRemaining(timeRemaining)).toBe('3:00');
    });

    it('formats overtime with plus sign', () => {
      const timeRemaining = {
        remainingMs: -2 * 60 * 1000,
        isOvertime: true,
        overtimeMs: 2 * 60 * 1000,
        elapsedMs: 7 * 60 * 1000,
        totalPlannedMs: 5 * 60 * 1000,
        totalMs: -2 * 60 * 1000,
      };
      expect(formatTimeRemaining(timeRemaining)).toBe('+2:00');
    });

    it('formats overtime with seconds', () => {
      const timeRemaining = {
        remainingMs: -(1 * 60 * 1000 + 30 * 1000),
        isOvertime: true,
        overtimeMs: 1 * 60 * 1000 + 30 * 1000,
        elapsedMs: 6.5 * 60 * 1000,
        totalPlannedMs: 5 * 60 * 1000,
        totalMs: -(1 * 60 * 1000 + 30 * 1000),
      };
      expect(formatTimeRemaining(timeRemaining)).toBe('+1:30');
    });
  });
});
