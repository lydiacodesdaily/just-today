import { useEffect } from 'react'

export interface KeyboardShortcut {
  key: string
  metaKey?: boolean
  ctrlKey?: boolean
  shiftKey?: boolean
  description: string
  action: () => void
}

/**
 * Hook to register global keyboard shortcuts
 * @param shortcuts - Array of keyboard shortcuts to register
 * @param enabled - Whether the shortcuts should be active (default: true)
 */
export function useGlobalKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs/textareas
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Exception: Allow cmd+k and cmd+. to work in inputs
        if (
          !(
            (e.metaKey || e.ctrlKey) &&
            (e.key === 'k' || e.key === '.' || e.key === '?')
          )
        ) {
          return
        }
      }

      for (const shortcut of shortcuts) {
        const metaMatch = shortcut.metaKey
          ? e.metaKey || e.ctrlKey
          : !e.metaKey && !e.ctrlKey
        const ctrlMatch = shortcut.ctrlKey ? e.ctrlKey : !shortcut.ctrlKey
        const shiftMatch = shortcut.shiftKey ? e.shiftKey : !e.shiftKey

        if (
          e.key.toLowerCase() === shortcut.key.toLowerCase() &&
          metaMatch &&
          (!shortcut.ctrlKey || ctrlMatch) &&
          (!shortcut.shiftKey || shiftMatch)
        ) {
          e.preventDefault()
          shortcut.action()
          break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts, enabled])
}

/**
 * List of all available keyboard shortcuts in the app
 */
export const KEYBOARD_SHORTCUTS = [
  {
    keys: 'Cmd/Ctrl + K',
    description: 'Quick add task to Today',
  },
  {
    keys: 'Cmd/Ctrl + .',
    description: 'Mark current task as done',
  },
  {
    keys: '?',
    description: 'Show keyboard shortcuts help',
  },
  {
    keys: 'Escape',
    description: 'Close any open modal or menu',
  },
  {
    keys: 'Tab',
    description: 'Navigate through interactive elements',
  },
  {
    keys: 'Enter',
    description: 'Activate focused button or link',
  },
  {
    keys: 'Space',
    description: 'Toggle focused checkbox or button',
  },
]
