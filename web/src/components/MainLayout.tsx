'use client';

import { usePathname } from 'next/navigation';
import { LeftNav } from './LeftNav';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Focus mode: hide nav and remove margin on Run page
  const isFocusMode = pathname === '/run';

  return (
    <div className="flex h-full">
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-calm-text focus:text-calm-surface focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-calm-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <LeftNav />
      <main
        id="main-content"
        className={isFocusMode ? 'flex-1' : 'flex-1 ml-64'}
        role="main"
      >
        {children}
      </main>
    </div>
  );
}
