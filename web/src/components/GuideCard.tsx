/**
 * GuideCard.tsx
 * Component for displaying a guide in list view
 */

'use client';

import { Guide } from '@/src/models/Guide';
import Link from 'next/link';

interface GuideCardProps {
  guide: Guide;
}

export function GuideCard({ guide }: GuideCardProps) {
  return (
    <Link href={`/transitions/${guide.id}`}>
      <div className="bg-calm-surface border border-calm-border rounded-lg p-5 hover:border-calm-text/30 transition-colors cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-calm-text">{guide.title}</h3>
              {!guide.isDefault && (
                <span className="px-2 py-0.5 bg-calm-border rounded text-xs text-calm-muted">
                  Custom
                </span>
              )}
            </div>
            <p className="text-sm text-calm-muted">
              {guide.items.length} item{guide.items.length === 1 ? '' : 's'}
            </p>
          </div>

          <svg
            className="w-5 h-5 text-calm-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}
