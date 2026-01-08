/**
 * EnergyPicker.tsx
 * Component for selecting energy mode (Low/Steady/Flow)
 */

'use client';

import { useState } from 'react';
import { EnergyMode } from '@/src/models/RoutineTemplate';

interface EnergyPickerProps {
  selectedMode: EnergyMode;
  onSelect: (mode: EnergyMode) => void;
}

const ENERGY_MODES: Array<{
  mode: EnergyMode;
  icon: string;
  label: string;
  supportText: string;
  guidance: string;
  examples: string[];
}> = [
  {
    mode: 'low',
    icon: '💤',
    label: 'Low',
    supportText: "It's okay to take it slow",
    guidance: 'For rest days — gentle tasks only',
    examples: ['Reply to one email', '5-min tidy', 'Make a simple meal', 'Light stretching'],
  },
  {
    mode: 'steady',
    icon: '🌿',
    label: 'Steady',
    supportText: 'One step at a time',
    guidance: 'For regular energy — your daily essentials',
    examples: ['Morning routine', 'Focused work session', 'Respond to messages', 'Plan tomorrow'],
  },
  {
    mode: 'flow',
    icon: '✨',
    label: 'Flow',
    supportText: 'Enjoy the momentum',
    guidance: 'For peak energy — tackle bigger challenges',
    examples: ['Creative work', 'Complex problem-solving', 'Learn something new', 'Deep focus work'],
  },
];

export function EnergyPicker({ selectedMode, onSelect }: EnergyPickerProps) {
  const [showTooltip, setShowTooltip] = useState<EnergyMode | null>(null);

  return (
    <div className="w-full space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {ENERGY_MODES.map(({ mode, icon, label, supportText }) => {
          const isSelected = selectedMode === mode;

          return (
            <div key={mode} className="relative">
              <button
                onClick={() => onSelect(mode)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect(mode);
                  }
                }}
                className={`
                  w-full relative flex flex-col items-center justify-center
                  px-4 py-5 rounded-xl
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${
                    isSelected
                      ? mode === 'low'
                        ? 'bg-calm-low/20 border-2 border-calm-low text-calm-text focus:ring-calm-low'
                        : mode === 'steady'
                        ? 'bg-calm-steady/20 border-2 border-calm-steady text-calm-text focus:ring-calm-steady'
                        : 'bg-calm-flow/20 border-2 border-calm-flow text-calm-text focus:ring-calm-flow'
                      : 'bg-calm-surface border border-calm-border text-calm-muted hover:border-calm-text/30 focus:ring-calm-text/30'
                  }
                `}
                aria-label={`${label} energy mode: ${supportText}`}
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
                  setShowTooltip(showTooltip === mode ? null : mode);
                }}
                className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-xs text-calm-muted hover:text-calm-text rounded-full hover:bg-calm-bg/50 transition-colors"
                aria-label={`Show examples for ${label} energy mode`}
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
          {ENERGY_MODES.filter((m) => m.mode === showTooltip).map(({ mode, label, guidance, examples }) => (
            <div key={mode}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-calm-text">{label} Energy</h4>
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
