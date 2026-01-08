'use client';

import { usePathname } from 'next/navigation';
import { LeftNav } from './LeftNav';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Focus mode: hide nav and remove margin on Run page
  const isFocusMode = pathname === '/run';

  return (
    <div className="flex h-full">
      <LeftNav />
      <main className={isFocusMode ? 'flex-1' : 'flex-1 ml-64'}>
        {children}
      </main>
    </div>
  );
}
