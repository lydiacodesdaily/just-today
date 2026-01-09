/**
 * Dialog.tsx
 * Reusable styled dialog components for alerts and confirmations
 */

'use client';

import { useEffect, useRef } from 'react';
import { useFocusTrap } from '@/src/hooks/useFocusTrap';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  variant?: 'info' | 'warning' | 'danger';
}

export function Dialog({
  isOpen,
  onClose,
  title,
  message,
  children,
  confirmLabel = 'OK',
  cancelLabel,
  onConfirm,
  variant = 'info',
}: DialogProps) {
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const variantStyles = {
    info: 'border-calm-border',
    warning: 'border-yellow-500/30',
    danger: 'border-red-500/30',
  };

  const confirmButtonStyles = {
    info: 'bg-calm-primary hover:bg-calm-primary/80',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    danger: 'bg-red-600 hover:bg-red-700',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={modalRef}
        className={`relative w-full max-w-md rounded-xl border ${variantStyles[variant]} bg-calm-bg-secondary p-6 shadow-2xl`}
      >
        <h2
          id="dialog-title"
          className="text-xl font-medium text-calm-text mb-3"
        >
          {title}
        </h2>

        {message && (
          <p className="text-calm-text-secondary mb-6 leading-relaxed">
            {message}
          </p>
        )}

        {children}

        <div className="flex gap-3 mt-6">
          {cancelLabel && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-calm-border bg-calm-bg hover:bg-calm-bg-secondary text-calm-text font-medium transition-colors"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-2.5 rounded-lg ${confirmButtonStyles[variant]} text-white font-medium transition-colors`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function AlertDialog({ isOpen, onClose, title, message }: AlertDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      message={message}
      confirmLabel="OK"
    />
  );
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'info' | 'warning' | 'danger';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'info',
}: ConfirmDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      message={message}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      variant={variant}
    />
  );
}
