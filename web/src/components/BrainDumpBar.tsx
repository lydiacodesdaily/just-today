/**
 * BrainDumpBar.tsx
 * Persistent collapsed/expanded capture bar for the top of the Today page.
 * Reuses existing useBrainDumpStore and useFocusStore logic.
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useBrainDumpStore } from '@/src/stores/brainDumpStore';
import { useFocusStore } from '@/src/stores/focusStore';
import { CheckOncePicker } from './CheckOncePicker';
import { TimeBucketPicker } from './TimeBucketPicker';
import { TimeBucket } from '@/src/models/FocusItem';

interface BrainDumpBarProps {
  autoExpand?: boolean; // Auto-expand when true (empty day)
  onPickItem?: () => void;
}

export function BrainDumpBar({ autoExpand = false, onPickItem }: BrainDumpBarProps) {
  const { items, addItem, updateItem, deleteItem, keepItem } = useBrainDumpStore();
  const { addToToday, addToLater, setCheckOnce, setItemTimeBucket } = useFocusStore();

  const [isExpanded, setIsExpanded] = useState(autoExpand);
  const [inputText, setInputText] = useState('');
  const [showMenuForId, setShowMenuForId] = useState<string | null>(null);
  const [checkOnceItemData, setCheckOnceItemData] = useState<{ id: string; text: string } | null>(null);
  const [thinkLaterItemData, setThinkLaterItemData] = useState<{ id: string; text: string } | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [pendingText, setPendingText] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const pendingTextRef = useRef<string | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  pendingTextRef.current = pendingText;

  const unsortedItems = items.filter((item) => item.status === 'unsorted');
  // Show last 3 unsorted items in the bar
  const recentItems = unsortedItems.slice(0, 3);

  // Auto-expand when autoExpand prop changes
  useEffect(() => {
    if (autoExpand) setIsExpanded(true);
  }, [autoExpand]);

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isExpanded]);

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

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToastVisible(false);
      setTimeout(() => setToastMessage(null), 300);
    }, 2000);
  }, []);

  const confirmDestination = useCallback((destination: 'braindump' | 'today' | 'later') => {
    const textToSave = pendingTextRef.current;
    if (!textToSave) return;

    setPendingText(null);
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
      autoSaveTimer.current = null;
    }

    if (destination === 'braindump') {
      addItem(textToSave);
      showToast('Saved to Brain Dump');
    } else if (destination === 'today') {
      addToToday(textToSave, '~15 min');
      showToast('Added to Today');
    } else {
      addToLater(textToSave, '~15 min');
      showToast('Saved for Later');
    }
  }, [addItem, addToToday, addToLater, showToast]);

  const handleAddItem = () => {
    if (!inputText.trim()) return;

    if (pendingTextRef.current) {
      confirmDestination('braindump');
    }

    const text = inputText.trim();
    setPendingText(text);
    pendingTextRef.current = text;
    setInputText('');

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      confirmDestination('braindump');
    }, 2500);
  };

  const handleDoToday = (itemId: string, itemText: string) => {
    keepItem(itemId);
    addToToday(itemText, '~15 min');
    setShowMenuForId(null);
  };

  const handleThinkLater = (itemId: string, itemText: string) => {
    setThinkLaterItemData({ id: itemId, text: itemText });
    setShowMenuForId(null);
  };

  const handleThinkLaterConfirm = (timeBucket?: TimeBucket) => {
    if (thinkLaterItemData) {
      keepItem(thinkLaterItemData.id);
      addToLater(thinkLaterItemData.text, '~15 min');
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
      keepItem(checkOnceItemData.id);
      addToLater(checkOnceItemData.text, '~15 min');
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
    <div className="border border-calm-border rounded-xl bg-calm-surface overflow-visible">
      {/* Collapsed row */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-calm-bg/50 rounded-xl transition-colors"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <svg className="w-4 h-4 text-calm-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm text-calm-muted truncate">
              {unsortedItems.length > 0
                ? `${unsortedItems.length} thought${unsortedItems.length === 1 ? '' : 's'} captured`
                : 'Capture a thought...'}
            </span>
          </div>
          <svg className="w-3 h-3 text-calm-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <div className="space-y-3 p-4">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-calm-text">Brain Dump</span>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 hover:bg-calm-border/50 rounded transition-colors"
              aria-label="Collapse"
            >
              <svg className="w-3 h-3 text-calm-muted rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Input */}
          <div className={`bg-calm-bg border border-calm-border rounded-lg p-3 ${pendingText ? 'opacity-50' : ''} transition-opacity`}>
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleAddItem();
                }
              }}
              placeholder="What's on your mind?"
              className="w-full min-h-[60px] bg-transparent border-none focus:outline-none text-sm text-calm-text placeholder-calm-muted resize-none"
              disabled={!!pendingText}
            />
            <div className="flex justify-between items-center gap-3 mt-1">
              <span className="text-xs text-calm-muted">Auto-expires in 24h</span>
              {!pendingText && (
                <button
                  onClick={handleAddItem}
                  disabled={!inputText.trim()}
                  className="px-3 py-1 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-xs flex-shrink-0"
                >
                  Save
                </button>
              )}
            </div>
          </div>

          {/* Destination row */}
          {pendingText && (
            <div className="bg-calm-bg border border-calm-border rounded-lg p-3 space-y-2">
              <span className="text-[13px] font-medium text-calm-muted">Where should this go?</span>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => confirmDestination('braindump')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full bg-calm-primary text-white hover:opacity-90 transition-opacity"
                >
                  Brain Dump
                </button>
                <button
                  onClick={() => confirmDestination('today')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full bg-calm-surface border border-calm-border text-calm-text hover:bg-calm-bg transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => confirmDestination('later')}
                  className="px-3 py-1.5 text-xs font-semibold rounded-full bg-calm-surface border border-calm-border text-calm-text hover:bg-calm-bg transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          )}

          {/* Toast */}
          {toastMessage && (
            <div
              className={`bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center text-xs font-medium text-calm-text transition-opacity duration-300 ${
                toastVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {toastMessage}
            </div>
          )}

          {/* Recent items */}
          {recentItems.length > 0 && (
            <div className="space-y-1.5">
              {recentItems.map((item) => (
                <div key={item.id}>
                  {editingItemId === item.id ? (
                    <div className="bg-calm-bg border border-calm-primary rounded-lg p-2.5">
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
                        className="w-full min-h-[48px] bg-transparent border-none focus:outline-none text-xs text-calm-text placeholder-calm-muted resize-none"
                        autoFocus
                      />
                      <div className="flex justify-end gap-2 mt-1">
                        <button onClick={handleCancelEdit} className="px-2 py-1 text-xs text-calm-muted hover:text-calm-text transition-colors">
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          disabled={!editingText.trim()}
                          className="px-2 py-1 text-xs bg-calm-primary text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-calm-bg border border-calm-border rounded-lg px-3 py-2 hover:border-calm-text/30 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs text-calm-text flex-1">{item.text}</p>

                        <div className="relative flex-shrink-0" ref={showMenuForId === item.id ? menuRef : null}>
                          <button
                            onClick={() => setShowMenuForId(showMenuForId === item.id ? null : item.id)}
                            className="p-0.5 hover:bg-calm-border/50 rounded transition-colors"
                            aria-label="Options"
                          >
                            <svg className="w-3.5 h-3.5 text-calm-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>

                          {showMenuForId === item.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-50">
                              <button
                                onClick={() => handleDoToday(item.id, item.text)}
                                className="w-full px-3 py-2 text-left text-xs text-calm-text hover:bg-calm-bg transition-colors font-medium"
                              >
                                Do Today
                              </button>
                              <button
                                onClick={() => handleThinkLater(item.id, item.text)}
                                className="w-full px-3 py-2 text-left text-xs text-calm-text hover:bg-calm-bg transition-colors"
                              >
                                Think Later
                              </button>
                              <button
                                onClick={() => handleCheckOnceLater(item.id, item.text)}
                                className="w-full px-3 py-2 text-left text-xs text-calm-text hover:bg-calm-bg transition-colors"
                              >
                                Check once later...
                              </button>
                              <button
                                onClick={() => handleStartEdit(item.id, item.text)}
                                className="w-full px-3 py-2 text-left text-xs text-calm-text hover:bg-calm-bg transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-calm-bg transition-colors"
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
              {unsortedItems.length > 3 && (
                <p className="text-xs text-calm-muted text-center">+{unsortedItems.length - 3} more</p>
              )}
              {onPickItem && (
                <button
                  onClick={onPickItem}
                  className="w-full text-xs text-calm-primary hover:text-calm-text transition-colors font-medium text-left pt-1"
                >
                  Ready to do something? Pick one thing to focus on →
                </button>
              )}
            </div>
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

      {/* Time Bucket Picker */}
      {thinkLaterItemData && (
        <TimeBucketPicker
          onConfirm={handleThinkLaterConfirm}
          onCancel={() => setThinkLaterItemData(null)}
        />
      )}
    </div>
  );
}
