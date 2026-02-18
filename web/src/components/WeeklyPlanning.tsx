'use client';

import { useState } from 'react';
import { useWeeklyIntentStore } from '@/src/stores/weeklyIntentStore';
import { useFocusStore } from '@/src/stores/focusStore';
import { FocusDuration } from '@/src/models/FocusItem';
import { generatePlanSummary } from '@/src/models/WeeklyIntent';

const DURATION_OPTIONS: FocusDuration[] = ['~5 min', '~10 min', '~15 min', '~25 min', '~30 min', '~45 min', '~1 hour', '~2 hours'];

interface WeeklyPlanningProps {
  intentId: string;
  onFinalize: () => void;
}

export function WeeklyPlanning({ intentId, onFinalize }: WeeklyPlanningProps) {
  const { intents, addItem, addNewItem, removeItem, togglePriority, finalizePlan } = useWeeklyIntentStore();
  const { laterItems } = useFocusStore();
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemDuration, setNewItemDuration] = useState<FocusDuration>('~25 min');
  const [showAddNew, setShowAddNew] = useState(false);
  const [copied, setCopied] = useState(false);

  const intent = intents.find((i) => i.id === intentId);
  if (!intent) return null;

  const selectedFocusItemIds = new Set(intent.items.map((i) => i.focusItemId));
  const availableLaterItems = laterItems.filter(
    (item) => !item.completedAt && !selectedFocusItemIds.has(item.id)
  );
  const priorityCount = intent.items.filter((i) => i.isPriority).length;

  const handleAddNewItem = () => {
    if (!newItemTitle.trim()) return;
    addNewItem(intentId, newItemTitle.trim(), newItemDuration);
    setNewItemTitle('');
    setShowAddNew(false);
  };

  const handleFinalize = () => {
    finalizePlan(intentId);
    onFinalize();
  };

  const handleCopyPlan = async () => {
    const summary = generatePlanSummary(intent);
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Selected items for this week */}
      {intent.items.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-calm-text mb-3">This week ({intent.items.length})</h3>
          <div className="space-y-2">
            {intent.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-calm-surface border border-calm-border rounded-lg p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => togglePriority(intentId, item.id)}
                    disabled={!item.isPriority && priorityCount >= 3}
                    className={`flex-shrink-0 transition-colors ${
                      item.isPriority
                        ? 'text-amber-500'
                        : priorityCount >= 3
                          ? 'text-calm-border cursor-not-allowed'
                          : 'text-calm-muted hover:text-amber-400'
                    }`}
                    title={item.isPriority ? 'Remove priority' : priorityCount >= 3 ? 'Max 3 priorities' : 'Mark as priority'}
                  >
                    <svg className="w-5 h-5" fill={item.isPriority ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </button>
                  <span className="text-calm-text truncate">{item.titleSnapshot}</span>
                </div>
                <button
                  onClick={() => removeItem(intentId, item.id)}
                  className="flex-shrink-0 text-calm-muted hover:text-red-400 transition-colors p-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add from Later */}
      {availableLaterItems.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-calm-muted mb-3">Add from Later</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {availableLaterItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addItem(intentId, item.id, item.title)}
                className="w-full flex items-center justify-between bg-calm-bg border border-calm-border rounded-lg p-3 hover:border-calm-text/30 transition-colors text-left"
              >
                <div className="min-w-0">
                  <span className="text-sm text-calm-text truncate block">{item.title}</span>
                  <span className="text-xs text-calm-muted">{item.estimatedDuration}</span>
                </div>
                <svg className="w-5 h-5 text-calm-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add new item */}
      {showAddNew ? (
        <div className="bg-calm-surface border border-calm-border rounded-lg p-4 space-y-3">
          <input
            type="text"
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddNewItem()}
            placeholder="What do you want to accomplish?"
            className="w-full bg-calm-bg border border-calm-border rounded-lg px-3 py-2 text-calm-text placeholder-calm-muted focus:outline-none focus:ring-2 focus:ring-calm-primary text-sm"
            autoFocus
          />
          <div className="flex items-center gap-3">
            <select
              value={newItemDuration}
              onChange={(e) => setNewItemDuration(e.target.value as FocusDuration)}
              className="bg-calm-bg border border-calm-border rounded-lg px-3 py-2 text-calm-text text-sm focus:outline-none focus:ring-2 focus:ring-calm-primary"
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <button
              onClick={handleAddNewItem}
              disabled={!newItemTitle.trim()}
              className="px-4 py-2 bg-calm-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-calm-primary/90 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => { setShowAddNew(false); setNewItemTitle(''); }}
              className="px-4 py-2 text-calm-muted text-sm hover:text-calm-text transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddNew(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-calm-border rounded-lg text-sm text-calm-muted hover:text-calm-text hover:border-calm-text/30 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add something new
        </button>
      )}

      {/* Actions */}
      {intent.items.length > 0 && (
        <div className="flex items-center gap-3 pt-4 border-t border-calm-border">
          <button
            onClick={handleFinalize}
            className="flex-1 px-4 py-3 bg-calm-primary text-white rounded-lg text-sm font-medium hover:bg-calm-primary/90 transition-colors"
          >
            Set my week
          </button>
          <button
            onClick={handleCopyPlan}
            className="px-4 py-3 bg-calm-surface border border-calm-border rounded-lg text-sm text-calm-text hover:border-calm-text/30 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy plan'}
          </button>
        </div>
      )}
    </div>
  );
}
