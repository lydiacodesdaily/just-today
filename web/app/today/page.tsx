'use client';

import { useState, useRef, useMemo } from 'react';
import { EnergyIndicator } from '@/src/components/EnergyIndicator';
import { EnergyMenu } from '@/src/components/EnergyMenu';
import { TodaysFocus, TodaysFocusRef } from '@/src/components/TodaysFocus';
import { RoutinesList } from '@/src/components/RoutineCard';
import { LaterList } from '@/src/components/LaterList';
import { BrainDump } from '@/src/components/BrainDump';
import { KeyboardShortcutsModal } from '@/src/components/KeyboardShortcutsModal';
import { DndProvider } from '@/src/components/dnd';
import { useEnergyStore } from '@/src/stores/energyStore';
import { useFocusStore } from '@/src/stores/focusStore';
import { useAutoCheck } from '@/src/hooks/useAutoCheck';
import { useGlobalKeyboardShortcuts, KeyboardShortcut } from '@/src/hooks/useGlobalKeyboardShortcuts';

export default function TodayPage() {
  const currentMode = useEnergyStore((state) => state.currentMode);
  const { todayItems } = useFocusStore();
  const [showMoreSections, setShowMoreSections] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const todaysFocusRef = useRef<TodaysFocusRef>(null);

  // Detect Arrival vs Action state
  // Arrival: First open of the day - no committed work yet
  // Action: User has committed to today's work (has Today's Focus items)
  // Brain dump items don't trigger the transition - they're still in the "unload/orient" phase
  const isArrivalState = useMemo(() => {
    const hasTodayFocus = todayItems.filter(item => !item.completedAt).length > 0;
    return !hasTodayFocus;
  }, [todayItems]);

  // Enable automatic daily checks and cleanup
  useAutoCheck();

  // Global keyboard shortcuts
  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      metaKey: true,
      description: 'Quick add task to Today',
      action: () => {
        todaysFocusRef.current?.openQuickAdd();
      },
    },
    {
      key: '.',
      metaKey: true,
      description: 'Mark current task as done',
      action: () => {
        todaysFocusRef.current?.markCurrentTaskDone();
      },
    },
    {
      key: '?',
      description: 'Show keyboard shortcuts help',
      action: () => {
        setShowShortcutsModal(true);
      },
    },
  ];

  useGlobalKeyboardShortcuts(shortcuts);

  return (
    <div className="min-h-screen bg-calm-bg">
      {/* Main container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-calm-text mb-2">Today</h1>
              <p className="text-calm-muted">Focus on what matters, one thing at a time</p>
            </div>
            <div className="flex items-center gap-3">
              <EnergyIndicator />
              <button
                onClick={() => setShowMoreSections(!showMoreSections)}
                className="px-3 py-2 text-sm text-calm-muted hover:text-calm-text transition-colors"
              >
                {showMoreSections ? 'Simplify View' : 'Show More'}
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <DndProvider>
          <div className="space-y-8">

            {/* Arrival State: Brain Dump prioritized, Focus secondary */}
            {isArrivalState ? (
              <>
                {/* Brain Dump - expanded and prioritized */}
                <BrainDump initialExpanded={true} arrivalMode={true} />

                {/* Today's Focus - secondary */}
                <TodaysFocus ref={todaysFocusRef} />

                {/* Show More sections - collapsed by default */}
                {showMoreSections && (
                  <>
                    {/* Optional Energy Menu */}
                    <EnergyMenu energyLevel={currentMode} />

                    {/* Routines Section */}
                    <RoutinesList energyMode={currentMode} />

                    {/* Later & Ideas Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-calm-border"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-calm-bg px-4 text-sm text-calm-muted">Later & Ideas</span>
                      </div>
                    </div>

                    {/* Later List */}
                    <LaterList />
                  </>
                )}

                {/* Show More button if sections are hidden */}
                {!showMoreSections && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowMoreSections(true)}
                      className="px-6 py-3 bg-calm-surface border border-calm-border rounded-lg text-calm-text hover:border-calm-text/30 transition-colors text-sm font-medium"
                    >
                      Show Optional Items, Routines & Later
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Action State: Today's Focus prioritized */}
                {/* Today's Focus - primary */}
                <TodaysFocus ref={todaysFocusRef} />

                {/* Show More sections - collapsed by default */}
                {showMoreSections && (
                  <>
                    {/* Optional Energy Menu */}
                    <EnergyMenu energyLevel={currentMode} />

                    {/* Routines Section */}
                    <RoutinesList energyMode={currentMode} />

                    {/* Later & Ideas Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-calm-border"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-calm-bg px-4 text-sm text-calm-muted">Later & Ideas</span>
                      </div>
                    </div>

                    {/* Later List */}
                    <LaterList />

                    {/* Brain Dump - collapsed but accessible */}
                    <BrainDump initialExpanded={false} arrivalMode={false} />
                  </>
                )}

                {/* Show More button if sections are hidden */}
                {!showMoreSections && (
                  <div className="text-center">
                    <button
                      onClick={() => setShowMoreSections(true)}
                      className="px-6 py-3 bg-calm-surface border border-calm-border rounded-lg text-calm-text hover:border-calm-text/30 transition-colors text-sm font-medium"
                    >
                      Show Optional Items, Routines, Later & Ideas
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </DndProvider>

        {/* Footer spacing for mobile bottom nav - ensures tooltips and content aren't hidden */}
        <div className="h-24 md:h-0"></div>
      </div>

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
}
