/**
 * CreateGuideModal.tsx
 * Modal for creating and editing custom guides
 */

'use client';

import { useState, useEffect } from 'react';
import { Guide } from '@/src/models/Guide';

const MAX_TITLE_LENGTH = 50;
const MAX_ITEMS = 15;

interface CreateGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, items: string[]) => void;
  editingGuide?: Guide | null;
}

export function CreateGuideModal({ isOpen, onClose, onSave, editingGuide }: CreateGuideModalProps) {
  const [title, setTitle] = useState('');
  const [items, setItems] = useState<string[]>(['']);

  useEffect(() => {
    if (editingGuide) {
      setTitle(editingGuide.title);
      setItems(editingGuide.items.map((item) => item.text));
    } else {
      setTitle('');
      setItems(['']);
    }
  }, [editingGuide, isOpen]);

  const handleAddItem = () => {
    if (items.length < MAX_ITEMS) {
      setItems([...items, '']);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = value;
    setItems(newItems);
  };

  const handleSave = () => {
    const trimmedTitle = title.trim();
    const trimmedItems = items.map((item) => item.trim()).filter((item) => item !== '');

    if (!trimmedTitle || trimmedItems.length === 0) {
      return;
    }

    onSave(trimmedTitle, trimmedItems);
    setTitle('');
    setItems(['']);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (index === items.length - 1 && items[index].trim() !== '' && items.length < MAX_ITEMS) {
        handleAddItem();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const canSave = title.trim() !== '' && items.some((item) => item.trim() !== '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-calm-surface rounded-xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
        <h3 className="text-xl font-semibold text-calm-text mb-4">
          {editingGuide ? 'Edit Guide' : 'Create Custom Guide'}
        </h3>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {/* Title input */}
          <div>
            <label className="block text-sm font-medium text-calm-text mb-2">
              Guide Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE_LENGTH))}
              placeholder="e.g., Morning Routine"
              className="w-full px-4 py-2 bg-calm-bg border border-calm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-calm-text/30 text-calm-text"
              autoFocus
            />
            <p className="text-xs text-calm-muted mt-1">
              {title.length}/{MAX_TITLE_LENGTH}
            </p>
          </div>

          {/* Items list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-calm-text">
                Checklist Items
              </label>
              <span className="text-xs text-calm-muted">
                {items.filter((item) => item.trim()).length}/{MAX_ITEMS}
              </span>
            </div>

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    placeholder={`Item ${index + 1}`}
                    className="flex-1 px-4 py-2 bg-calm-bg border border-calm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-calm-text/30 text-calm-text"
                  />
                  {items.length > 1 && (
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="min-w-[44px] min-h-[44px] px-3 py-2 text-calm-muted hover:text-red-600 transition-colors touch-manipulation"
                      aria-label="Remove item"
                    >
                      <svg
                        className="w-5 h-5"
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
                  )}
                </div>
              ))}

              {items.length < MAX_ITEMS && (
                <button
                  onClick={handleAddItem}
                  className="w-full min-h-[44px] px-4 py-3 border-2 border-dashed border-calm-border rounded-lg text-sm text-calm-muted hover:border-calm-text/30 hover:text-calm-text transition-colors touch-manipulation"
                >
                  + Add Item
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons - Touch-friendly 44px minimum */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-calm-border">
          <button
            onClick={onClose}
            className="flex-1 min-h-[48px] px-4 py-3 bg-calm-border text-calm-text rounded-lg hover:bg-calm-border/80 transition-colors touch-manipulation"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 min-h-[48px] px-4 py-3 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {editingGuide ? 'Save Changes' : 'Create Guide'}
          </button>
        </div>
      </div>
    </div>
  );
}
