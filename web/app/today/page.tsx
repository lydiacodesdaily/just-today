'use client';

import { useState } from 'react';
import { EnergyPicker } from '@/src/components/EnergyPicker';
import { EnergyMenu } from '@/src/components/EnergyMenu';
import { TodaysFocus } from '@/src/components/TodaysFocus';
import { RoutinesList } from '@/src/components/RoutineCard';
import { LaterList } from '@/src/components/LaterList';
import { BrainDump } from '@/src/components/BrainDump';
import { useEnergyStore } from '@/src/stores/energyStore';
import { useAutoCheck } from '@/src/hooks/useAutoCheck';

export default function TodayPage() {
  const { currentMode, setMode } = useEnergyStore();
  const [showMoreSections, setShowMoreSections] = useState(false);

  // Enable automatic daily checks and cleanup
  useAutoCheck();

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
            <EnergyPicker selectedMode={currentMode} onSelect={setMode} />
          </section>

          {/* 2. Today's Focus */}
          <TodaysFocus />

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
    </div>
  );
}
