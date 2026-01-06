/**
 * EnergyMenu.tsx
 * Collapsible component for displaying energy-specific optional items
 */

'use client';

import { useState } from 'react';
import { EnergyLevel } from '@/src/models/EnergyMenuItem';
import { useEnergyMenuStore } from '@/src/stores/energyMenuStore';

interface EnergyMenuProps {
  energyLevel: EnergyLevel;
}

export function EnergyMenu({ energyLevel }: EnergyMenuProps) {
  const { menuItems, addToToday, canAddMoreItems } = useEnergyMenuStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter menu items for current energy level
  const filteredItems = menuItems
    .filter((item) => item.energyLevel === energyLevel)
    .slice(0, 5); // Show max 5 items

  // Don't render if no items for this level
  if (filteredItems.length === 0) {
    return null;
  }

  const getLevelLabel = () => {
    switch (energyLevel) {
      case 'low':
        return 'Low';
      case 'steady':
        return 'Steady';
      case 'flow':
        return 'Flow';
    }
  };

  return (
    <section className="space-y-3">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-calm-surface border border-calm-border rounded-lg hover:border-calm-text/30 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">💡</span>
          <span className="text-lg font-medium text-calm-text">
            Optional ideas ({getLevelLabel()})
          </span>
        </div>

        <svg
          className={`w-5 h-5 text-calm-muted transition-transform ${
            isExpanded ? 'transform rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const canAdd = canAddMoreItems(energyLevel);

            return (
              <div
                key={item.id}
                className="bg-calm-surface border border-calm-border rounded-lg p-4 hover:border-calm-text/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-calm-text mb-0.5">{item.title}</h3>
                    {item.estimatedDuration && (
                      <p className="text-sm text-calm-muted">{item.estimatedDuration}</p>
                    )}
                  </div>

                  <button
                    onClick={() => addToToday(item)}
                    disabled={!canAdd}
                    className="px-3 py-1.5 bg-calm-border text-calm-text rounded-lg hover:bg-calm-text hover:text-calm-surface transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-calm-border disabled:hover:text-calm-text"
                    title={!canAdd ? 'Maximum items reached for this energy level' : 'Add to Today'}
                  >
                    + Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
