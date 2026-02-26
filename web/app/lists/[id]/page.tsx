'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useListStore } from '@/src/stores/listStore';
import { ListItem } from '@/src/models/List';
import { ConfirmDialog } from '@/src/components/Dialog';

export default function ListDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const {
    lists,
    getItemsForList,
    addListItem,
    toggleListItem,
    deleteListItem,
    clearCheckedItems,
  } = useListStore();

  const list = lists.find((l) => l.id === id);
  const items = list ? getItemsForList(id) : [];

  const [newItemText, setNewItemText] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<ListItem | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (!list) {
    return (
      <div className="min-h-screen bg-calm-bg">
        <div className="max-w-2xl mx-auto px-6 py-8 text-center">
          <p className="text-calm-muted mb-4">List not found.</p>
          <button
            onClick={() => router.push('/lists')}
            className="text-calm-text hover:underline text-sm"
          >
            Back to Lists
          </button>
        </div>
      </div>
    );
  }

  const uncheckedItems = items.filter((i) => !i.checked);
  const checkedItems = items.filter((i) => i.checked);

  const handleAdd = () => {
    if (!newItemText.trim()) return;
    addListItem(id, newItemText.trim());
    setNewItemText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="min-h-screen bg-calm-bg flex flex-col">
      <div className="max-w-2xl mx-auto w-full px-6 py-8 flex flex-col flex-1">
        {/* Back link */}
        <button
          onClick={() => router.push('/lists')}
          className="flex items-center gap-2 text-calm-muted hover:text-calm-text transition-colors mb-6 self-start"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back to Lists</span>
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {list.emoji && <span className="text-3xl">{list.emoji}</span>}
            <h1 className="text-2xl font-bold text-calm-text">{list.name}</h1>
          </div>
          {checkedItems.length > 0 && (
            <button
              onClick={() => setClearConfirm(true)}
              className="text-sm text-calm-muted hover:text-calm-text transition-colors"
            >
              Clear checked
            </button>
          )}
        </div>

        {/* Items */}
        <div className="bg-calm-surface border border-calm-border rounded-xl flex-1 mb-4 overflow-hidden">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-calm-muted text-sm">
                Nothing here yet. Add your first item below.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-calm-border">
              {/* Unchecked items */}
              {uncheckedItems.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onToggle={() => toggleListItem(item.id)}
                  onDelete={() => setDeleteConfirm(item)}
                />
              ))}

              {/* Divider + checked items */}
              {checkedItems.length > 0 && uncheckedItems.length > 0 && (
                <div className="px-4 py-2 bg-calm-bg/50">
                  <span className="text-xs text-calm-muted uppercase tracking-wide font-medium">
                    Checked
                  </span>
                </div>
              )}
              {checkedItems.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onToggle={() => toggleListItem(item.id)}
                  onDelete={() => setDeleteConfirm(item)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add item bar */}
        <div className="flex items-center gap-3 bg-calm-surface border border-calm-border rounded-xl px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add item…"
            className="flex-1 bg-transparent text-calm-text placeholder:text-calm-muted text-sm focus:outline-none"
          />
          <button
            onClick={handleAdd}
            disabled={!newItemText.trim()}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              newItemText.trim()
                ? 'bg-calm-text text-calm-bg hover:bg-calm-text/90'
                : 'bg-calm-border text-calm-muted cursor-default'
            }`}
            aria-label="Add item"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Footer spacing for mobile bottom nav */}
        <div className="h-24 md:h-4" />
      </div>

      {/* Delete item confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) deleteListItem(deleteConfirm.id);
          setDeleteConfirm(null);
        }}
        title="Remove item?"
        message={`"${deleteConfirm?.text}" will be removed from this list.`}
        confirmLabel="Remove"
        cancelLabel="Keep it"
        variant="danger"
      />

      {/* Clear checked confirmation */}
      <ConfirmDialog
        isOpen={clearConfirm}
        onClose={() => setClearConfirm(false)}
        onConfirm={() => {
          clearCheckedItems(id);
          setClearConfirm(false);
        }}
        title="Clear checked items?"
        message={`Remove ${checkedItems.length} checked item${checkedItems.length !== 1 ? 's' : ''} from the list?`}
        confirmLabel="Clear"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}

// ─── Item Row ──────────────────────────────────────────────────────────────────

interface ItemRowProps {
  item: ListItem;
  onToggle: () => void;
  onDelete: () => void;
}

function ItemRow({ item, onToggle, onDelete }: ItemRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 hover:bg-calm-bg/50 transition-colors group">
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
          item.checked
            ? 'border-calm-primary bg-calm-primary'
            : 'border-calm-border hover:border-calm-text/50'
        }`}
        aria-label={item.checked ? 'Uncheck item' : 'Check item'}
      >
        {item.checked && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Text */}
      <span
        onClick={onToggle}
        className={`flex-1 text-sm cursor-pointer select-none transition-colors ${
          item.checked ? 'line-through text-calm-muted' : 'text-calm-text'
        }`}
      >
        {item.text}
      </span>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="p-1 rounded text-calm-muted opacity-0 group-hover:opacity-100 hover:text-calm-text transition-all"
        aria-label="Remove item"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
