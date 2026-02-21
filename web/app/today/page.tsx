'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { PaceIndicator } from '@/src/components/PaceIndicator';
import { PacePicks } from '@/src/components/PacePicks';
import { TodaysFocus, TodaysFocusRef } from '@/src/components/TodaysFocus';
import { RoutinesList } from '@/src/components/RoutineCard';
import { LaterList } from '@/src/components/LaterList';
import { BrainDumpBar } from '@/src/components/BrainDumpBar';
import { CompletedToday } from '@/src/components/CompletedToday';
import { CheckInIndicator } from '@/src/components/CheckInIndicator';
import { KeyboardShortcutsModal } from '@/src/components/KeyboardShortcutsModal';
import { PickOneThingModal } from '@/src/components/PickOneThingModal';
import { usePaceStore } from '@/src/stores/paceStore';
import { useFocusStore } from '@/src/stores/focusStore';
import { useBrainDumpStore } from '@/src/stores/brainDumpStore';
import { usePacePicksStore } from '@/src/stores/pacePicksStore';
import { useAutoCheck } from '@/src/hooks/useAutoCheck';
import { useGlobalKeyboardShortcuts, KeyboardShortcut } from '@/src/hooks/useGlobalKeyboardShortcuts';
import { FocusItem, isCheckOnceDue } from '@/src/models/FocusItem';
import { PacePickItem } from '@/src/models/PacePick';
import { WeeklyIntentBanner } from '@/src/components/WeeklyIntentBanner';
import { FirstEntryModal } from '@/src/components/FirstEntryModal';
import { useDailyEntryStore } from '@/src/stores/dailyEntryStore';

type ActiveTab = 'focus' | 'later';

export default function TodayPage() {
  const currentPace = usePaceStore((state) => state.currentPace);
  const { todayItems, laterItems, completedToday, moveToToday, addToToday, triggerCheckOnce } = useFocusStore();
  const { items: brainDumpItems } = useBrainDumpStore();
  const { menuItems } = usePacePicksStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>('focus');
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showPickOneThing, setShowPickOneThing] = useState(false);
  const [showFirstEntry, setShowFirstEntry] = useState(false);

  const shouldShowFirstEntry = useDailyEntryStore((state) => state.shouldShowFirstEntry);

  // Show first-entry flow once per day on mount
  useEffect(() => {
    if (shouldShowFirstEntry()) {
      setShowFirstEntry(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const todaysFocusRef = useRef<TodaysFocusRef>(null);
  const todaysFocusSectionRef = useRef<HTMLDivElement>(null);

  // Auto-expand BrainDumpBar when the day is empty
  const isEmptyDay = useMemo(() => {
    const unsortedBrainDump = brainDumpItems.filter((i) => i.status === 'unsorted');
    return todayItems.length === 0 && completedToday.length === 0 && unsortedBrainDump.length === 0;
  }, [todayItems, completedToday, brainDumpItems]);

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
    await moveToToday(item.id);

    if (isCheckOnceDue(item)) {
      await triggerCheckOnce(item.id);
    }

    setShowPickOneThing(false);
    handleViewToday();
  };

  // Handler for starting an Extra from Pick One Thing
  const handleStartPacePick = async (pacePick: PacePickItem) => {
    await addToToday(
      pacePick.title,
      pacePick.estimatedDuration || '~15 min'
    );

    setShowPickOneThing(false);
    handleViewToday();
  };

  // Handler to open Quick Add modal
  const handleAddCustom = () => {
    todaysFocusRef.current?.openQuickAdd();
  };

  return (
    <div className="min-h-screen bg-calm-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[1.75rem] font-semibold tracking-tight text-calm-text mb-2">Today</h1>
              <p className="text-calm-muted">Focus on what matters, one thing at a time</p>
            </div>
            <PaceIndicator />
          </div>
        </header>

        {/* Weekly Intent Banner */}
        <WeeklyIntentBanner />

        {/* Brain Dump Bar — persistent, above tabs */}
        <div className="mb-5">
          <BrainDumpBar
            autoExpand={isEmptyDay}
            onPickItem={() => setShowPickOneThing(true)}
          />
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-calm-border mb-6">
          <button
            onClick={() => setActiveTab('focus')}
            className={`px-5 py-2.5 text-sm transition-colors relative ${
              activeTab === 'focus'
                ? 'text-calm-text font-semibold'
                : 'text-calm-muted font-normal hover:text-calm-text'
            }`}
          >
            Focus
            {activeTab === 'focus' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-calm-primary" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('later')}
            className={`px-5 py-2.5 text-sm transition-colors relative ${
              activeTab === 'later'
                ? 'text-calm-text font-semibold'
                : 'text-calm-muted font-normal hover:text-calm-text'
            }`}
          >
            Later
            {laterItems.filter((i) => !i.completedAt).length > 0 && (
              <span className="ml-1.5 text-xs text-calm-muted">
                {laterItems.filter((i) => !i.completedAt).length}
              </span>
            )}
            {activeTab === 'later' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-calm-primary rounded-full" />
            )}
          </button>
        </div>

        {/* Tab content */}
        <div className="space-y-8">
          {activeTab === 'focus' && (
            <>
              {/* Pace Picks */}
              <PacePicks paceTag={currentPace} />

              {/* Today's Focus */}
              <div ref={todaysFocusSectionRef}>
                <TodaysFocus ref={todaysFocusRef} />
              </div>

              {/* Completed Today */}
              <CompletedToday />

              {/* Routines */}
              <RoutinesList pace={currentPace} />

              {/* Check-in indicator */}
              <CheckInIndicator />

            </>
          )}

          {activeTab === 'later' && (
            <LaterList defaultExpanded={true} />
          )}
        </div>

        {/* Footer spacing for mobile bottom nav */}
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

      {/* Daily first-entry modal */}
      <FirstEntryModal
        isOpen={showFirstEntry}
        onClose={() => setShowFirstEntry(false)}
      />
    </div>
  );
}
