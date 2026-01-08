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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="shortcuts-title"
            className="text-xl font-semibold text-gray-900 dark:text-white"
          >
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-calm-primary focus:ring-offset-2 dark:hover:bg-gray-700 dark:hover:text-gray-200"
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

        <div className="space-y-3">
          {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-gray-700"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {shortcut.description}
              </span>
              <kbd className="rounded bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="rounded-lg bg-calm-primary px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-calm-primary/90 focus:outline-none focus:ring-2 focus:ring-calm-primary focus:ring-offset-2"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
