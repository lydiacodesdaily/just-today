'use client';

import { useState, useRef } from 'react';
import { EnergyPicker } from '@/src/components/EnergyPicker';
import { EnergyMenu } from '@/src/components/EnergyMenu';
import { TodaysFocus, TodaysFocusRef } from '@/src/components/TodaysFocus';
import { RoutinesList } from '@/src/components/RoutineCard';
import { LaterList } from '@/src/components/LaterList';
import { BrainDump } from '@/src/components/BrainDump';
import { KeyboardShortcutsModal } from '@/src/components/KeyboardShortcutsModal';
import { AriaLiveRegion } from '@/src/components/AriaLiveRegion';
import { useEnergyStore } from '@/src/stores/energyStore';
import { useAutoCheck } from '@/src/hooks/useAutoCheck';
import { useGlobalKeyboardShortcuts, KeyboardShortcut } from '@/src/hooks/useGlobalKeyboardShortcuts';

export default function TodayPage() {
  const { currentMode, setMode } = useEnergyStore();
  const [showMoreSections, setShowMoreSections] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [energyAnnouncement, setEnergyAnnouncement] = useState('');
  const todaysFocusRef = useRef<TodaysFocusRef>(null);

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

  // Handle energy mode change with screen reader announcement
  const handleEnergyModeChange = (mode: typeof currentMode) => {
    setMode(mode);
    const modeNames = {
      low: 'Low Energy mode',
      steady: 'Steady Energy mode',
      flow: 'Flow Energy mode',
    };
    setEnergyAnnouncement(`Switched to ${modeNames[mode]}`);
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
            <button
              onClick={() => setShowMoreSections(!showMoreSections)}
              className="px-3 py-2 text-sm text-calm-muted hover:text-calm-text transition-colors"
            >
              {showMoreSections ? 'Simplify View' : 'Show More'}
            </button>
          </div>
        </header>

        {/* Main content */}
        <div className="space-y-8">
          {/* 1. Energy Picker */}
          <section>
            <EnergyPicker selectedMode={currentMode} onSelect={handleEnergyModeChange} />
          </section>

          {/* 2. Today's Focus */}
          <TodaysFocus ref={todaysFocusRef} />

          {/* Show More sections - collapsed by default */}
          {showMoreSections && (
            <>
              {/* 3. Optional Energy Menu */}
              <EnergyMenu energyLevel={currentMode} />

              {/* 4. Routines Section */}
              <RoutinesList energyMode={currentMode} />

              {/* 5. Later & Ideas Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-calm-border"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-calm-bg px-4 text-sm text-calm-muted">Later & Ideas</span>
                </div>
              </div>

              {/* 6. Later List (collapsed) */}
              <LaterList />

              {/* 7. Brain Dump (collapsed) */}
              <BrainDump />
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
        </div>

        {/* Footer spacing */}
        <div className="h-16"></div>
      </div>

      {/* Accessibility features */}
      <AriaLiveRegion message={energyAnnouncement} politeness="polite" />
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  );
}
