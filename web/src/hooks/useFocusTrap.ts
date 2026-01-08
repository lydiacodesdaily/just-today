import { useEffect, useRef } from 'react'

/**
 * Custom hook to trap focus within a modal or dialog
 * @param isActive - Whether the focus trap should be active
 * @returns ref to attach to the container element
 */
export function useFocusTrap<T extends HTMLElement>(isActive: boolean) {
  const elementRef = useRef<T>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive) return

    // Store the element that was focused before the modal opened
    previouslyFocusedElement.current = document.activeElement as HTMLElement

    const element = elementRef.current
    if (!element) return

    // Get all focusable elements within the container
    const getFocusableElements = () => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(', ')

      return Array.from(
        element.querySelectorAll<HTMLElement>(focusableSelectors)
      ).filter((el) => {
        // Filter out hidden elements
        return (
          el.offsetParent !== null &&
          getComputedStyle(el).visibility !== 'hidden'
        )
      })
    }

    // Focus the first focusable element
    const focusableElements = getFocusableElements()
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    // Handle tab key to trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusableElements = getFocusableElements()
      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        // Shift + Tab: moving backwards
        if (document.activeElement === firstElement) {
          lastElement.focus()
          e.preventDefault()
        }
      } else {
        // Tab: moving forwards
        if (document.activeElement === lastElement) {
          firstElement.focus()
          e.preventDefault()
        }
      }
    }

    element.addEventListener('keydown', handleKeyDown)

    // Cleanup: restore focus to previously focused element
    return () => {
      element.removeEventListener('keydown', handleKeyDown)

      // Restore focus when modal closes
      if (previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus()
      }
    }
  }, [isActive])

  return elementRef
}
