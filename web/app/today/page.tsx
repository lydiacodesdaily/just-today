'use client';

import { useState, useRef, useMemo } from 'react';
import { PaceIndicator } from '@/src/components/PaceIndicator';
import { PacePicks } from '@/src/components/PacePicks';
import { TodaysFocus, TodaysFocusRef } from '@/src/components/TodaysFocus';
import { RoutinesList } from '@/src/components/RoutineCard';
import { LaterList } from '@/src/components/LaterList';
import { BrainDump } from '@/src/components/BrainDump';
import { CompletedToday } from '@/src/components/CompletedToday';
import { KeyboardShortcutsModal } from '@/src/components/KeyboardShortcutsModal';
import { PickOneThingModal } from '@/src/components/PickOneThingModal';
import { usePaceStore } from '@/src/stores/paceStore';
import { useFocusStore } from '@/src/stores/focusStore';
import { usePacePicksStore } from '@/src/stores/pacePicksStore';
import { useAutoCheck } from '@/src/hooks/useAutoCheck';
import { useGlobalKeyboardShortcuts, KeyboardShortcut } from '@/src/hooks/useGlobalKeyboardShortcuts';
import { FocusItem, isCheckOnceDue } from '@/src/models/FocusItem';
import { PacePickItem } from '@/src/models/PacePick';

export default function TodayPage() {
  const currentPace = usePaceStore((state) => state.currentPace);
  const { todayItems, laterItems, completedToday, moveToToday, addToToday, triggerCheckOnce } = useFocusStore();
  const { menuItems } = usePacePicksStore();
  const [showMoreSections, setShowMoreSections] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showPickOneThing, setShowPickOneThing] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const todaysFocusRef = useRef<TodaysFocusRef>(null);
  const todaysFocusSectionRef = useRef<HTMLDivElement>(null);

  // Detect Arrival vs Action state
  // Arrival: First open of the day - no committed work yet
  // Action: User has committed to today's work (has Today's Focus items or completed items)
  const isArrivalState = useMemo(() => {
    const hasTodayFocus = todayItems.length > 0;
    const hasCompletedItems = completedToday.length > 0;
    return !hasTodayFocus && !hasCompletedItems;
  }, [todayItems, completedToday]);

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

  // Handler to scroll to Today's Focus section
  const handleViewToday = () => {
    todaysFocusSectionRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  // Handler for starting a Later item from Pick One Thing
  const handleStartLaterItem = async (item: FocusItem, reason: string) => {
    // Move item from Later to Today
    await moveToToday(item.id);

    // If it's a circle back item, trigger it to prevent re-showing
    if (isCheckOnceDue(item)) {
      await triggerCheckOnce(item.id);
    }

    // Close modal and scroll to Today
    setShowPickOneThing(false);
    handleViewToday();
  };

  // Handler for starting an Extra from Pick One Thing
  const handleStartPacePick = async (pacePick: PacePickItem) => {
    // Add pace pick to Today
    await addToToday(
      pacePick.title,
      pacePick.estimatedDuration || '~15 min'
    );

    // Close modal and scroll to Today's Focus
    setShowPickOneThing(false);
    handleViewToday();
  };

  // Handler to open Quick Add modal
  const handleAddCustom = () => {
    setShowQuickAdd(true);
    todaysFocusRef.current?.openQuickAdd();
  };

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
              <PaceIndicator />
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
        <div className="space-y-8">

          {/* Arrival State: Brain Dump prioritized, Focus secondary */}
          {isArrivalState ? (
            <>
              {/* Brain Dump - expanded and prioritized */}
              <BrainDump
                initialExpanded={true}
                arrivalMode={true}
                onViewToday={handleViewToday}
                onPickItem={() => setShowPickOneThing(true)}
              />

              {/* Today's Focus - secondary */}
              <div ref={todaysFocusSectionRef}>
                <TodaysFocus ref={todaysFocusRef} />
              </div>

              {/* Show More sections - collapsed by default */}
              {showMoreSections && (
                <>
                  {/* Optional Pace Picks */}
                  <PacePicks paceTag={currentPace} />

                  {/* Routines Section */}
                  <RoutinesList pace={currentPace} />

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
              <div ref={todaysFocusSectionRef}>
                <TodaysFocus ref={todaysFocusRef} />
              </div>

              {/* Completed Today - show evidence of work */}
              <CompletedToday />

              {/* Show More sections - collapsed by default */}
              {showMoreSections && (
                <>
                  {/* Optional Pace Picks */}
                  <PacePicks paceTag={currentPace} />

                  {/* Routines Section */}
                  <RoutinesList pace={currentPace} />

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
                  <BrainDump initialExpanded={false} arrivalMode={false} onViewToday={handleViewToday} />
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

        {/* Footer spacing for mobile bottom nav - ensures tooltips and content aren't hidden */}
        <div className="h-24 md:h-0"></div>
      </div>

      {/* Pick One Thing Modal */}
      <PickOneThingModal
        isOpen={showPickOneThing}
        onClose={() => setShowPickOneThing(false)}
        laterItems={laterItems}
        pacePicks={menuItems}
        currentPace={currentPace}
        onStartLaterItem={handleStartLaterItem}
        onStartPacePick={handleStartPacePick}
        onAddCustom={handleAddCustom}
      />

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
}
