/**
 * PaceIndicator.tsx
 * A small, subtle pill showing current pace with option to change.
 *
 * Designed to be compact and non-intrusive - not competing with Today's Focus.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { usePaceStore } from '@/src/stores/paceStore';
import { Pace } from '@/src/models/RoutineTemplate';

// Map internal storage keys to user-facing pace labels
const PACE_CONFIG: Record<Pace, { icon: string; label: string; color: string }> = {
  low: {
    icon: '💤',
    label: 'Gentle',
    color: 'bg-calm-low/20 text-calm-low border-calm-low/30',
  },
  steady: {
    icon: '🌿',
    label: 'Steady',
    color: 'bg-calm-steady/20 text-calm-steady border-calm-steady/30',
  },
  flow: {
    icon: '✨',
    label: 'Deep',
    color: 'bg-calm-flow/20 text-calm-flow border-calm-flow/30',
  },
};

const ALL_PACES: Pace[] = ['low', 'steady', 'flow'];

export function PaceIndicator() {
  const { currentPace, setPace } = usePaceStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const config = PACE_CONFIG[currentPace];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const handleSelect = (pace: Pace) => {
    setPace(pace);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Pill button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center gap-2 px-3 py-1.5 rounded-full
          text-sm font-medium border
          ${config.color}
          hover:opacity-80 transition-opacity
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-calm-text/20
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Today's pace: ${config.label}. Click to change.`}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
        <span className="text-xs opacity-60">Change</span>
      </button>

      {/* Dropdown selector */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 bg-calm-surface border border-calm-border rounded-lg shadow-lg py-1 min-w-[140px] z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          role="listbox"
          aria-label="Select pace"
        >
          {ALL_PACES.map((pace) => {
            const paceConfig = PACE_CONFIG[pace];
            const isSelected = pace === currentPace;

            return (
              <button
                key={pace}
                onClick={() => handleSelect(pace)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 text-left
                  text-sm transition-colors
                  ${isSelected ? 'bg-calm-bg font-medium' : 'hover:bg-calm-bg/50'}
                `}
                role="option"
                aria-selected={isSelected}
              >
                <span>{paceConfig.icon}</span>
                <span className="text-calm-text">{paceConfig.label}</span>
                {isSelected && (
                  <span className="ml-auto text-calm-muted">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
