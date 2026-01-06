'use client';

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

  // Enable automatic daily checks and cleanup
  useAutoCheck();

  return (
    <div className="min-h-screen bg-calm-bg">
      {/* Main container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-calm-text mb-2">Today</h1>
          <p className="text-calm-muted">Focus on what matters, one thing at a time</p>
        </header>

        {/* Main content */}
        <div className="space-y-8">
          {/* 1. Energy Picker */}
          <section>
            <EnergyPicker selectedMode={currentMode} onSelect={setMode} />
          </section>

          {/* 2. Optional Energy Menu (collapsed by default) */}
          <EnergyMenu energyLevel={currentMode} />

          {/* 3. Today's Focus */}
          <TodaysFocus />

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
        </div>

        {/* Footer spacing */}
        <div className="h-16"></div>
      </div>
    </div>
  );
}
