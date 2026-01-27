/**
 * BrainDump.tsx
 * Collapsible component for capturing and managing brain dump items
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useBrainDumpStore } from '@/src/stores/brainDumpStore';
import { useFocusStore } from '@/src/stores/focusStore';
import { CheckOncePicker } from './CheckOncePicker';
import { TimeBucketPicker } from './TimeBucketPicker';
import { TimeBucket } from '@/src/models/FocusItem';
import { SectionLabel } from './SectionLabel';

interface BrainDumpProps {
  initialExpanded?: boolean;
  arrivalMode?: boolean;
  onViewToday?: () => void;
}

export function BrainDump({ initialExpanded = false, arrivalMode = false, onViewToday }: BrainDumpProps) {
  const { items, addItem, updateItem, deleteItem, keepItem } = useBrainDumpStore();
  const { addToToday, addToLater, setCheckOnce, setItemTimeBucket } = useFocusStore();

  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [inputText, setInputText] = useState('');
  const [showMenuForId, setShowMenuForId] = useState<string | null>(null);
  const [checkOnceItemData, setCheckOnceItemData] = useState<{ id: string; text: string } | null>(null);
  const [thinkLaterItemData, setThinkLaterItemData] = useState<{ id: string; text: string } | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const unsortedItems = items.filter((item) => item.status === 'unsorted');

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

  const handleDoToday = (itemId: string, itemText: string) => {
    // Mark as kept in brain dump
    keepItem(itemId);
    // Add to Today with default 15min duration
    addToToday(itemText, '~15 min');
    setShowMenuForId(null);
  };

  const handleThinkLater = (itemId: string, itemText: string) => {
    // Show time bucket picker
    setThinkLaterItemData({ id: itemId, text: itemText });
    setShowMenuForId(null);
  };

  const handleThinkLaterConfirm = (timeBucket?: TimeBucket) => {
    if (thinkLaterItemData) {
      // Mark as kept in brain dump
      keepItem(thinkLaterItemData.id);
      // Add to Later with optional time bucket
      addToLater(thinkLaterItemData.text, '~15 min');
      // If time bucket was selected, set it on the newly added item
      if (timeBucket && timeBucket !== 'NONE') {
        setTimeout(() => {
          const laterItems = useFocusStore.getState().laterItems;
          const newItem = laterItems.find(item => item.title === thinkLaterItemData.text && !item.timeBucket);
          if (newItem) {
            setItemTimeBucket(newItem.id, timeBucket);
          }
        }, 0);
      }
      setThinkLaterItemData(null);
    }
  };

  const handleCheckOnceLater = (itemId: string, itemText: string) => {
    setCheckOnceItemData({ id: itemId, text: itemText });
    setShowMenuForId(null);
  };

  const handleCheckOnceConfirm = (checkOnceDate: string) => {
    if (checkOnceItemData) {
      // Mark as kept in brain dump
      keepItem(checkOnceItemData.id);
      // Add to Later with check once date
      addToLater(checkOnceItemData.text, '~15 min');
      // Get the newly added item ID and set the check once date
      setTimeout(() => {
        const laterItems = useFocusStore.getState().laterItems;
        const newItem = laterItems.find(item => item.title === checkOnceItemData.text && !item.checkOnceDate);
        if (newItem) {
          setCheckOnce(newItem.id, checkOnceDate);
        }
      }, 0);
      setCheckOnceItemData(null);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    deleteItem(itemId);
    setShowMenuForId(null);
  };

  const handleStartEdit = (itemId: string, itemText: string) => {
    setEditingItemId(itemId);
    setEditingText(itemText);
    setShowMenuForId(null);
  };

  const handleSaveEdit = () => {
    if (editingItemId && editingText.trim()) {
      updateItem(editingItemId, editingText.trim());
    }
    setEditingItemId(null);
    setEditingText('');
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingText('');
  };

  return (
    <section className="space-y-3">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-calm-surface/50 rounded-lg transition-colors"
        aria-expanded={isExpanded}
      >
        <SectionLabel>Brain Dump</SectionLabel>

        <div className="flex items-center gap-2">
          {!isExpanded && unsortedItems.length === 0 && (
            <span className="text-[11px] text-calm-muted">Tap to capture</span>
          )}
          {!isExpanded && unsortedItems.length > 0 && (
            <span className="text-[11px] text-calm-muted">
              {unsortedItems.length}
            </span>
          )}
          <svg
            className={`w-3 h-3 text-calm-muted transition-transform ${
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
              placeholder={arrivalMode ? "What's on your mind right now?" : "Dump anything on your mind..."}
              className="w-full min-h-[80px] bg-transparent border-none focus:outline-none text-calm-text placeholder-calm-muted resize-none"
            />
            <div className="flex justify-between items-start gap-3 mt-2">
              <div className="flex-1 space-y-0.5">
                <span className="text-xs text-calm-muted block">
                  You don't have to decide what to do with this yet.
                </span>
                <span className="text-xs text-calm-muted block">
                  Items auto-expire in 24h
                </span>
              </div>
              <button
                onClick={handleAddItem}
                disabled={!inputText.trim()}
                className="px-4 py-1.5 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-sm flex-shrink-0"
              >
                Add
              </button>
            </div>
          </div>

          {/* Items list */}
          {unsortedItems.length > 0 && (
            <div className="space-y-2">
              {/* Contextual action hint */}
              {unsortedItems.length >= 2 && onViewToday && (
                <div className="flex items-center justify-between bg-calm-surface/50 border border-calm-border/50 rounded-lg px-4 py-3 mb-2">
                  <span className="text-sm text-calm-muted">
                    Captured {unsortedItems.length} thoughts
                  </span>
                  <button
                    onClick={onViewToday}
                    className="text-sm text-calm-primary hover:text-calm-text transition-colors font-medium"
                  >
                    View Today's plan →
                  </button>
                </div>
              )}
              {unsortedItems.map((item) => (
                <div key={item.id}>
                  {editingItemId === item.id ? (
                    // Inline editing UI
                    <div className="bg-calm-surface border border-calm-primary rounded-lg p-3">
                      <textarea
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            e.preventDefault();
                            handleSaveEdit();
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
                        }}
                        className="w-full min-h-[60px] bg-transparent border-none focus:outline-none text-sm text-calm-text placeholder-calm-muted resize-none"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 text-sm text-calm-muted hover:text-calm-text transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={!editingText.trim()}
                          className="px-3 py-1.5 text-sm bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-calm-surface border border-calm-border rounded-lg p-3 hover:border-calm-text/30 transition-colors">
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
                            <div className="absolute right-0 top-full mt-1 w-56 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-50">
                              <button
                                onClick={() => handleDoToday(item.id, item.text)}
                                className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors font-medium"
                              >
                                Do Today
                              </button>
                              <button
                                onClick={() => handleThinkLater(item.id, item.text)}
                                className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors group"
                              >
                                <div>Think Later</div>
                                <div className="text-xs text-calm-muted mt-0.5 group-hover:text-calm-text/70 transition-colors">
                                  Move to Later with optional time bucket
                                </div>
                              </button>
                              <button
                                onClick={() => handleStartEdit(item.id, item.text)}
                                className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleCheckOnceLater(item.id, item.text)}
                                className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors group"
                              >
                                <div>Check once later...</div>
                                <div className="text-xs text-calm-muted mt-0.5 group-hover:text-calm-text/70 transition-colors">
                                  Keep and resurface once
                                </div>
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-calm-bg transition-colors"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {unsortedItems.length === 0 && (
            <p className="text-sm text-calm-muted text-center py-4">
              No thoughts captured yet
            </p>
          )}
        </div>
      )}

      {/* Check Once Picker */}
      {checkOnceItemData && (
        <CheckOncePicker
          onConfirm={handleCheckOnceConfirm}
          onCancel={() => setCheckOnceItemData(null)}
        />
      )}

      {/* Time Bucket Picker for Think Later */}
      {thinkLaterItemData && (
        <TimeBucketPicker
          onConfirm={handleThinkLaterConfirm}
          onCancel={() => setThinkLaterItemData(null)}
        />
      )}
    </section>
  );
}
