/**
 * Modal.tsx
 * Reusable modal component with portal rendering
 * Ensures modals always render correctly regardless of parent layout constraints
 */

'use client';

import { useEffect, useState, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Maximum width of modal content (default: max-w-2xl) */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  /** Whether to center or show at bottom (mobile) */
  position?: 'center' | 'bottom';
  /** Additional className for the modal content container */
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  children,
  maxWidth = '2xl',
  position = 'center',
  className = '',
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Prevent body scroll when modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const positionClasses =
    position === 'bottom'
      ? 'items-end sm:items-center p-0 sm:p-4'
      : 'items-center p-4';

  const borderClasses =
    position === 'bottom'
      ? 'border-t sm:border rounded-t-2xl sm:rounded-xl'
      : 'border rounded-xl';

  const maxWidthValues = {
    sm: '24rem',    // 384px
    md: '28rem',    // 448px
    lg: '32rem',    // 512px
    xl: '36rem',    // 576px
    '2xl': '42rem', // 672px
    '3xl': '48rem', // 768px
    '4xl': '56rem', // 896px
  };

  const modalContent = (
    <div
      className={`fixed inset-0 bg-black/50 flex justify-center ${positionClasses} z-50`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div
        ref={modalRef}
        className={`bg-calm-surface ${borderClasses} border-calm-border max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ${className}`}
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: maxWidthValues[maxWidth] }}
      >
        {children}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

/**
 * ModalHeader - Consistent header for modals
 */
interface ModalHeaderProps {
  title: string;
  description?: string;
}

export function ModalHeader({ title, description }: ModalHeaderProps) {
  return (
    <div className="px-6 pt-6 pb-4 border-b border-calm-border">
      <h2 className="text-2xl font-semibold text-calm-text">{title}</h2>
      {description && (
        <p className="text-sm text-calm-muted mt-1">{description}</p>
      )}
    </div>
  );
}

/**
 * ModalBody - Scrollable content area
 */
interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export function ModalBody({ children, className = '' }: ModalBodyProps) {
  return (
    <div className={`flex-1 overflow-y-auto px-6 py-5 ${className}`}>
      {children}
    </div>
  );
}

/**
 * ModalFooter - Action buttons area
 */
interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

export function ModalFooter({ children, className = '' }: ModalFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-calm-border flex gap-3 ${className}`}>
      {children}
    </div>
  );
}
