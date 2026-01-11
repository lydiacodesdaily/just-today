'use client'

import { useFocusTrap } from '@/src/hooks/useFocusTrap'
import { KEYBOARD_SHORTCUTS } from '@/src/hooks/useGlobalKeyboardShortcuts'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
}: KeyboardShortcutsModalProps) {
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen)

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl rounded-xl bg-calm-surface border border-calm-border max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-calm-border flex items-center justify-between">
          <h2
            id="shortcuts-title"
            className="text-xl font-semibold text-calm-text"
          >
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-calm-muted transition-colors hover:bg-calm-border hover:text-calm-text focus:outline-none focus:ring-2 focus:ring-calm-primary focus:ring-offset-2"
            aria-label="Close keyboard shortcuts dialog"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border border-calm-border p-3 bg-calm-bg"
            >
              <span className="text-sm text-calm-text">
                {shortcut.description}
              </span>
              <kbd className="rounded bg-calm-surface px-2 py-1 text-xs font-semibold text-calm-text border border-calm-border">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-calm-border text-center">
          <button
            onClick={onClose}
            className="min-h-[48px] px-6 py-3 rounded-lg bg-calm-primary text-white font-medium transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-calm-primary focus:ring-offset-2"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
