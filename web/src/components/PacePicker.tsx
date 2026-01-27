/**
 * PacePicker.tsx
 * Component for selecting pace (Gentle/Steady/Deep)
 */

'use client';

import { useState } from 'react';
import { Pace } from '@/src/models/RoutineTemplate';

interface PacePickerProps {
  selectedPace: Pace;
  onSelect: (pace: Pace) => void;
}

// Map internal storage keys to user-facing pace labels
const PACE_OPTIONS: Array<{
  pace: Pace;
  icon: string;
  label: string;
  supportText: string;
  guidance: string;
  examples: string[];
}> = [
  {
    pace: 'low',
    icon: '💤',
    label: 'Gentle',
    supportText: 'For days when you need gentleness',
    guidance: 'Take it slow — gentle tasks only',
    examples: ['Reply to one email', '5-min tidy', 'Make a simple meal', 'Light stretching'],
  },
  {
    pace: 'steady',
    icon: '🌿',
    label: 'Steady',
    supportText: 'Your usual pace',
    guidance: 'Your daily essentials — one step at a time',
    examples: ['Morning routine', 'Focused work session', 'Respond to messages', 'Plan tomorrow'],
  },
  {
    pace: 'flow',
    icon: '✨',
    label: 'Deep',
    supportText: 'When you have extra capacity',
    guidance: 'Tackle bigger challenges — enjoy the momentum',
    examples: ['Creative work', 'Complex problem-solving', 'Learn something new', 'Deep focus work'],
  },
];

export function PacePicker({ selectedPace, onSelect }: PacePickerProps) {
  const [showTooltip, setShowTooltip] = useState<Pace | null>(null);

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {PACE_OPTIONS.map(({ pace, icon, label, supportText }) => {
          const isSelected = selectedPace === pace;

          return (
            <div key={pace} className="relative">
              <button
                onClick={() => onSelect(pace)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(pace);
                  }
                }}
                className={`
                  w-full relative flex flex-col items-center justify-center
                  px-4 py-5 rounded-xl
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${
                    isSelected
                      ? pace === 'low'
                        ? 'bg-calm-low/20 border-2 border-calm-low text-calm-text focus:ring-calm-low'
                        : pace === 'steady'
                        ? 'bg-calm-steady/20 border-2 border-calm-steady text-calm-text focus:ring-calm-steady'
                        : 'bg-calm-flow/20 border-2 border-calm-flow text-calm-text focus:ring-calm-flow'
                      : 'bg-calm-surface border border-calm-border text-calm-muted hover:border-calm-text/30 focus:ring-calm-text/30'
                  }
                `}
                aria-label={`${label} pace: ${supportText}`}
                aria-pressed={isSelected}
              >
                {/* Icon */}
                <div className="text-3xl mb-2">{icon}</div>

                {/* Label */}
                <div
                  className={`text-base font-medium mb-1 ${
                    isSelected ? 'text-calm-text' : 'text-calm-text'
                  }`}
                >
                  {label}
                </div>

                {/* Support text */}
                <div className="text-xs text-center text-calm-muted leading-tight">
                  {supportText}
                </div>
              </button>

              {/* Helper tooltip button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(showTooltip === pace ? null : pace);
                }}
                className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-xs text-calm-muted hover:text-calm-text rounded-full hover:bg-calm-bg/50 transition-colors"
                aria-label={`Show examples for ${label} pace`}
              >
                ?
              </button>
            </div>
          );
        })}
      </div>

      {/* Expanded guidance and examples */}
      {showTooltip && (
        <div className="bg-calm-surface border border-calm-border rounded-lg p-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {PACE_OPTIONS.filter((m) => m.pace === showTooltip).map(({ pace, label, guidance, examples }) => (
            <div key={pace}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-calm-text">{label} Pace</h4>
                <button
                  onClick={() => setShowTooltip(null)}
                  className="text-calm-muted hover:text-calm-text transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-calm-muted mb-3">{guidance}</p>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-calm-text">Examples:</p>
                {examples.map((example, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-xs text-calm-muted mt-0.5">•</span>
                    <span className="text-xs text-calm-text">{example}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
