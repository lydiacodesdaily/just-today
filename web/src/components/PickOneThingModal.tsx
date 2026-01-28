/**
 * PickOneThingModal.tsx
 * Modal for "Pick one thing" feature
 * Shows: Ready for Today (Later items) + Extras + Add Custom
 */

'use client';

import { useMemo } from 'react';
import { Modal, ModalHeader, ModalBody } from './Modal';
import { FocusItem } from '@/src/models/FocusItem';
import { PacePickItem } from '@/src/models/PacePick';
import { getPickOneSuggestions, ScoredItem } from '@/src/utils/pickOneSuggestions';

interface PickOneThingModalProps {
  isOpen: boolean;
  onClose: () => void;
  laterItems: FocusItem[];
  pacePicks: PacePickItem[];
  currentPace: 'low' | 'steady' | 'flow';
  onStartLaterItem: (item: FocusItem, reason: string) => void;
  onStartPacePick: (pacePick: PacePickItem) => void;
  onAddCustom: () => void;
}

export function PickOneThingModal({
  isOpen,
  onClose,
  laterItems,
  pacePicks,
  currentPace,
  onStartLaterItem,
  onStartPacePick,
  onAddCustom,
}: PickOneThingModalProps) {
  // Get top 5 suggested Later items
  const suggestions = useMemo(
    () => getPickOneSuggestions(laterItems, 5),
    [laterItems]
  );

  // Filter pace picks by current pace
  const filteredPacePicks = useMemo(
    () => pacePicks.filter((pick) => pick.paceTag === currentPace),
    [pacePicks, currentPace]
  );

  const paceLabel = currentPace === 'low' ? 'Gentle' : currentPace === 'flow' ? 'Deep' : 'Steady';

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <ModalHeader title="Pick one thing to focus on" />

      <ModalBody className="space-y-6">
        {/* Section 1: Ready for Today (Later items) */}
        {suggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-calm-primary text-base">📌</span>
              <h3 className="text-[13px] font-semibold text-calm-text uppercase tracking-wide">
                Ready for Today
              </h3>
              <span className="text-xs text-calm-muted">({suggestions.length})</span>
            </div>

            <div className="space-y-2">
              {suggestions.map(({ item, reasonText }: ScoredItem) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 p-4 bg-calm-bg border border-calm-border rounded-lg hover:border-calm-text/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-medium text-calm-text leading-snug">
                      {item.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-xs">
                      <span className="text-calm-muted">{item.estimatedDuration}</span>
                      {reasonText && (
                        <>
                          <span className="text-calm-muted">•</span>
                          <span className="text-calm-primary font-medium">{reasonText}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onStartLaterItem(item, reasonText);
                      onClose();
                    }}
                    className="flex-shrink-0 px-5 py-2 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-semibold"
                  >
                    Start
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {suggestions.length > 0 && filteredPacePicks.length > 0 && (
          <div className="border-t border-calm-border" />
        )}

        {/* Section 2: Pace Picks */}
        {filteredPacePicks.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-calm-primary text-base">✨</span>
              <h3 className="text-[13px] font-semibold text-calm-text uppercase tracking-wide">
                Pace Picks
              </h3>
              <span className="text-xs text-calm-muted">({paceLabel})</span>
            </div>

            <div className="space-y-2">
              {filteredPacePicks.map((pacePick) => (
                <div
                  key={pacePick.id}
                  className="flex items-center justify-between gap-4 p-4 bg-calm-bg border border-calm-border rounded-lg hover:border-calm-text/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[15px] font-medium text-calm-text leading-snug">
                      {pacePick.title}
                    </h4>
                    {pacePick.estimatedDuration && (
                      <div className="mt-1 text-xs text-calm-muted">
                        {pacePick.estimatedDuration}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      onStartPacePick(pacePick);
                      onClose();
                    }}
                    className="flex-shrink-0 px-5 py-2 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-semibold"
                  >
                    Start
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {suggestions.length === 0 && filteredPacePicks.length === 0 && (
          <div className="py-8 text-center space-y-2">
            <p className="text-sm font-medium text-calm-text">No suggestions available</p>
            <p className="text-xs text-calm-muted">Add something custom below</p>
          </div>
        )}

        {/* Divider before Add Custom */}
        {(suggestions.length > 0 || filteredPacePicks.length > 0) && (
          <div className="border-t border-calm-border" />
        )}

        {/* Section 3: Add Custom */}
        <button
          onClick={() => {
            onClose();
            onAddCustom();
          }}
          className="w-full py-4 text-center text-sm font-medium text-calm-muted hover:text-calm-text transition-colors"
        >
          + Add something custom
        </button>
      </ModalBody>
    </Modal>
  );
}
