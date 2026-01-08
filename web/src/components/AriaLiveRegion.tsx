'use client'

import { useEffect, useState } from 'react'

interface AriaLiveRegionProps {
  message: string
  politeness?: 'polite' | 'assertive'
  clearDelay?: number
}

/**
 * Accessible live region for screen reader announcements
 * Messages are announced to screen readers but not visually displayed
 */
export function AriaLiveRegion({
  message,
  politeness = 'polite',
  clearDelay = 1000,
}: AriaLiveRegionProps) {
  const [announcement, setAnnouncement] = useState('')

  useEffect(() => {
    if (message) {
      setAnnouncement(message)

      // Clear the announcement after delay to allow re-announcing the same message
      const timer = setTimeout(() => {
        setAnnouncement('')
      }, clearDelay)

      return () => clearTimeout(timer)
    }
  }, [message, clearDelay])

  return (
    <div
      role={politeness === 'assertive' ? 'alert' : 'status'}
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  )
}

/**
 * Hook to manage screen reader announcements
 * @returns Function to announce messages to screen readers
 */
export function useScreenReaderAnnouncement() {
  const [message, setMessage] = useState('')

  const announce = (text: string) => {
    setMessage(text)
  }

  return { message, announce }
}
