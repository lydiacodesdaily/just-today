/**
 * SectionLabel.tsx
 * Consistent 11px uppercase section label for visual hierarchy
 * Part of Phase 1 UX redesign - increases contrast between section labels and item titles
 */

'use client';

import { ReactNode } from 'react';

interface SectionLabelProps {
  children: ReactNode;
  className?: string;
}

export function SectionLabel({ children, className = '' }: SectionLabelProps) {
  return (
    <span
      className={`text-[11px] font-semibold uppercase tracking-wider text-calm-muted ${className}`}
    >
      {children}
    </span>
  );
}
