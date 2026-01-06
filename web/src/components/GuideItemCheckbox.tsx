/**
 * GuideItemCheckbox.tsx
 * Checkbox component for guide checklist items
 */

'use client';

interface GuideItemCheckboxProps {
  id: string;
  text: string;
  checked: boolean;
  onToggle: (id: string) => void;
}

export function GuideItemCheckbox({ id, text, checked, onToggle }: GuideItemCheckboxProps) {
  return (
    <label className="flex items-start gap-3 py-3 cursor-pointer group">
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(id)}
          className="peer sr-only"
        />
        <div
          className={`
            w-6 h-6 rounded-md border-2 transition-all
            ${
              checked
                ? 'bg-calm-success border-calm-success'
                : 'bg-calm-surface border-calm-border group-hover:border-calm-text/30'
            }
            flex items-center justify-center
          `}
        >
          {checked && (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </div>
      </div>

      <span
        className={`
          flex-1 text-base transition-all
          ${
            checked
              ? 'text-calm-muted line-through'
              : 'text-calm-text group-hover:text-calm-text/80'
          }
        `}
      >
        {text}
      </span>
    </label>
  );
}
