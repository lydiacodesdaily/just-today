/**
 * EnergyPicker.tsx
 * Component for selecting energy mode (Low/Steady/Flow)
 */

'use client';

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
}> = [
  {
    mode: 'low',
    icon: '💤',
    label: 'Low',
    supportText: "It's okay to take it slow",
  },
  {
    mode: 'steady',
    icon: '🌿',
    label: 'Steady',
    supportText: 'One step at a time',
  },
  {
    mode: 'flow',
    icon: '✨',
    label: 'Flow',
    supportText: 'Enjoy the momentum',
  },
];

export function EnergyPicker({ selectedMode, onSelect }: EnergyPickerProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-3 gap-3">
        {ENERGY_MODES.map(({ mode, icon, label, supportText }) => {
          const isSelected = selectedMode === mode;

          return (
            <button
              key={mode}
              onClick={() => onSelect(mode)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(mode);
                }
              }}
              className={`
                relative flex flex-col items-center justify-center
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
          );
        })}
      </div>
    </div>
  );
}
