/**
 * BrainDump.tsx
 * Collapsible component for capturing and managing brain dump items
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useBrainDumpStore } from '@/src/stores/brainDumpStore';
import { useFocusStore } from '@/src/stores/focusStore';

const VISIBLE_ITEMS_DEFAULT = 3;

export function BrainDump() {
  const { items, addItem, deleteItem, keepItem } = useBrainDumpStore();
  const { addToLater } = useFocusStore();

  const [isExpanded, setIsExpanded] = useState(false);
  const [inputText, setInputText] = useState('');
  const [showMenuForId, setShowMenuForId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const unsortedItems = items.filter((item) => item.status === 'unsorted');
  const visibleItems = unsortedItems.slice(0, VISIBLE_ITEMS_DEFAULT);
  const remainingCount = Math.max(0, unsortedItems.length - VISIBLE_ITEMS_DEFAULT);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenuForId(null);
      }
    }

    if (showMenuForId) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenuForId]);

  const handleAddItem = () => {
    if (inputText.trim()) {
      addItem(inputText.trim());
      setInputText('');
    }
  };

  const handleKeepItem = (itemId: string, itemText: string) => {
    // Mark as kept in brain dump
    keepItem(itemId);
    // Add to Later with default 15-30min duration
    addToLater(itemText, '~15 min');
    setShowMenuForId(null);
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItem(itemId);
    setShowMenuForId(null);
  };

  return (
    <section className="space-y-3">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-calm-surface border border-calm-border rounded-lg hover:border-calm-text/30 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🧠</span>
          <span className="text-lg font-medium text-calm-text">Brain Dump</span>
        </div>

        <div className="flex items-center gap-3">
          {!isExpanded && unsortedItems.length === 0 && (
            <span className="text-sm text-calm-muted">Tap to capture thoughts</span>
          )}
          {!isExpanded && unsortedItems.length > 0 && (
            <span className="px-2 py-0.5 bg-calm-border text-calm-text text-sm rounded-full">
              {unsortedItems.length}
            </span>
          )}
          <svg
            className={`w-5 h-5 text-calm-muted transition-transform ${
              isExpanded ? 'transform rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="space-y-3">
          {/* Input */}
          <div className="bg-calm-surface border border-calm-border rounded-lg p-4">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
              placeholder="Dump anything on your mind..."
              className="w-full min-h-[80px] bg-transparent border-none focus:outline-none text-calm-text placeholder-calm-muted resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-calm-muted">Items auto-expire in 24h</span>
              <button
                onClick={handleAddItem}
                disabled={!inputText.trim()}
                className="px-4 py-1.5 bg-calm-text text-calm-surface rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Add
              </button>
            </div>
          </div>

          {/* Items list */}
          {unsortedItems.length > 0 && (
            <div className="space-y-2">
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-calm-surface border border-calm-border rounded-lg p-3 hover:border-calm-text/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-calm-text flex-1">{item.text}</p>

                    <div className="relative" ref={showMenuForId === item.id ? menuRef : null}>
                      <button
                        onClick={() =>
                          setShowMenuForId(showMenuForId === item.id ? null : item.id)
                        }
                        className="p-1 hover:bg-calm-border/50 rounded transition-colors"
                        aria-label="Options"
                      >
                        <svg
                          className="w-4 h-4 text-calm-muted"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>

                      {showMenuForId === item.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-10">
                          <button
                            onClick={() => handleKeepItem(item.id, item.text)}
                            className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors"
                          >
                            Keep (Move to Later)
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-calm-bg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {remainingCount > 0 && (
                <p className="text-sm text-calm-muted text-center py-2">
                  +{remainingCount} more thought{remainingCount === 1 ? '' : 's'}
                </p>
              )}
            </div>
          )}

          {unsortedItems.length === 0 && (
            <p className="text-sm text-calm-muted text-center py-4">
              No thoughts captured yet
            </p>
          )}
        </div>
      )}
    </section>
  );
}
