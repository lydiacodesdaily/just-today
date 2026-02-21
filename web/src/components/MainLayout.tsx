'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { LeftNav } from './LeftNav';
import { BottomNav } from './BottomNav';
import { CheckInModal } from './CheckInModal';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showCheckIn, setShowCheckIn] = useState(false);

  // Focus mode: hide nav and remove margin on Run page
  const isFocusMode = pathname === '/run';

  return (
    <div className="flex h-full">
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-calm-primary focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-calm-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <LeftNav />
      <main
        id="main-content"
        className={isFocusMode ? 'flex-1 pb-0' : 'flex-1 md:ml-64 pb-24 md:pb-0'}
        role="main"
      >
        {children}
      </main>
      <BottomNav />

      {/* Floating check-in button — hidden in focus mode */}
      {!isFocusMode && (
        <button
          onClick={() => setShowCheckIn(true)}
          aria-label="Check in"
          className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40 w-14 h-14 rounded-full bg-calm-primary text-white shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center"
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}

      <CheckInModal isOpen={showCheckIn} onClose={() => setShowCheckIn(false)} />
    </div>
  );
}
