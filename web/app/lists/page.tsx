'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useListStore } from '@/src/stores/listStore';
import { List } from '@/src/models/List';
import { ConfirmDialog } from '@/src/components/Dialog';
import { useFocusTrap } from '@/src/hooks/useFocusTrap';

const EMOJI_SUGGESTIONS = ['🛒', '📚', '🎬', '🎁', '✈️', '🏠', '💊', '🎵', '🍽️', '💡'];

export default function ListsPage() {
  const { lists, addList, renameList, updateListEmoji, deleteList } = useListStore();
  const [showModal, setShowModal] = useState(false);
  const [editingList, setEditingList] = useState<List | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<List | null>(null);

  const handleAdd = () => {
    setEditingList(null);
    setShowModal(true);
  };

  const handleEdit = (list: List, e: React.MouseEvent) => {
    e.preventDefault();
    setEditingList(list);
    setShowModal(true);
  };

  const handleSave = (name: string, emoji: string | undefined) => {
    if (editingList) {
      if (editingList.name !== name) renameList(editingList.id, name);
      if (editingList.emoji !== emoji) updateListEmoji(editingList.id, emoji);
    } else {
      addList(name, emoji);
    }
    setShowModal(false);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteList(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-calm-bg">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-calm-text mb-2">Lists</h1>
          <p className="text-calm-muted">
            Reusable checklists and reference collections — groceries, books, packing, and more.
          </p>
        </div>

        {/* Grid of list cards */}
        {lists.length === 0 ? (
          <div className="bg-calm-surface border border-calm-border rounded-xl p-16 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-calm-text mb-2">No lists yet</h2>
            <p className="text-calm-muted mb-6">
              Create a list for things like groceries, books to read, or shows to watch.
            </p>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-calm-text text-calm-bg rounded-lg hover:bg-calm-text/90 transition-colors font-medium"
            >
              Create your first list
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {lists.map((list) => (
                <Link
                  key={list.id}
                  href={`/lists/${list.id}`}
                  className="group relative bg-calm-surface border border-calm-border rounded-xl p-5 hover:border-calm-text/30 transition-colors"
                >
                  <div className="text-3xl mb-3">{list.emoji || '📋'}</div>
                  <p className="text-sm font-semibold text-calm-text leading-snug line-clamp-2">
                    {list.name}
                  </p>
                  {/* Edit button */}
                  <button
                    onClick={(e) => handleEdit(list, e)}
                    className="absolute top-3 right-3 p-1 rounded-md text-calm-muted opacity-0 group-hover:opacity-100 hover:bg-calm-border hover:text-calm-text transition-all"
                    aria-label={`Edit ${list.name}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </Link>
              ))}
            </div>

            {/* Add new list button */}
            <button
              onClick={handleAdd}
              className="w-full py-4 border-2 border-dashed border-calm-border rounded-xl text-calm-muted hover:border-calm-text/30 hover:text-calm-text transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-medium">New list</span>
            </button>
          </>
        )}

        {/* Footer spacing for mobile bottom nav */}
        <div className="h-24 md:h-0" />
      </div>

      {/* Create / Edit modal */}
      {showModal && (
        <ListFormModal
          list={editingList}
          onSave={handleSave}
          onDelete={
            editingList
              ? () => {
                  setShowModal(false);
                  setDeleteConfirm(editingList);
                }
              : undefined
          }
          onCancel={() => setShowModal(false)}
        />
      )}

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete list?"
        message={`"${deleteConfirm?.name}" and all its items will be removed permanently.`}
        confirmLabel="Delete"
        cancelLabel="Keep it"
        variant="danger"
      />
    </div>
  );
}

// ─── List Form Modal ───────────────────────────────────────────────────────────

interface ListFormModalProps {
  list: List | null;
  onSave: (name: string, emoji: string | undefined) => void;
  onDelete?: () => void;
  onCancel: () => void;
}

function ListFormModal({ list, onSave, onDelete, onCancel }: ListFormModalProps) {
  const modalRef = useFocusTrap<HTMLDivElement>(true);
  const [name, setName] = useState(list?.name ?? '');
  const [emoji, setEmoji] = useState<string | undefined>(list?.emoji);
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!name.trim()) {
      setError('Give your list a short name.');
      return;
    }
    onSave(name.trim(), emoji);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="list-form-modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-calm-surface border border-calm-border rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-calm-border">
          <h2 id="list-form-modal-title" className="text-xl font-semibold text-calm-text">
            {list ? 'Edit list' : 'New list'}
          </h2>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Emoji picker */}
          <div>
            <label className="block text-sm font-medium text-calm-text mb-3">
              Emoji <span className="text-calm-muted text-xs">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_SUGGESTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(emoji === e ? undefined : e)}
                  className={`w-11 h-11 rounded-lg text-2xl flex items-center justify-center transition-colors ${
                    emoji === e
                      ? 'bg-calm-primary/20 ring-1 ring-calm-primary'
                      : 'hover:bg-calm-border'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label htmlFor="list-name" className="block text-sm font-medium text-calm-text mb-2">
              Name
            </label>
            <input
              id="list-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              placeholder="e.g., Grocery, Books to read"
              autoFocus
              className={`w-full px-4 py-2 bg-calm-bg border rounded-lg text-calm-text placeholder:text-calm-muted focus:outline-none focus:ring-2 focus:ring-calm-text/30 ${
                error ? 'border-red-500' : 'border-calm-border'
              }`}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-calm-border flex flex-col gap-3">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 min-h-[48px] px-4 py-3 bg-calm-border text-calm-text rounded-lg hover:bg-calm-border/80 transition-colors font-medium touch-manipulation"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 min-h-[48px] px-4 py-3 bg-calm-text text-calm-bg rounded-lg hover:bg-calm-text/90 transition-colors font-medium touch-manipulation"
            >
              Save
            </button>
          </div>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="w-full py-2 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
            >
              Delete list
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
