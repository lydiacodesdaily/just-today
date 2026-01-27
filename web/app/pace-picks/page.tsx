/**
 * /pace-picks page
 * Full Pace Picks management with 3-column layout for all paces
 */

'use client';

import { useState } from 'react';
import { usePacePicksStore } from '@/src/stores/pacePicksStore';
import { PaceTag, PacePickItem } from '@/src/models/PacePick';
import { PacePickModal } from '@/src/components/PacePickModal';
import { ConfirmDialog } from '@/src/components/Dialog';

// Map internal storage keys to user-facing pace labels
const PACE_CONFIG: Record<
  PaceTag,
  { label: string; icon: string; description: string; emptyText: string; color: string }
> = {
  low: {
    label: 'Gentle',
    icon: '💤',
    description: 'For days when you need gentleness',
    emptyText: 'No picks yet. Add something gentle.',
    color: 'text-blue-600',
  },
  steady: {
    label: 'Steady',
    icon: '🌿',
    description: 'Your usual pace',
    emptyText: 'No picks yet. Add something steady.',
    color: 'text-green-600',
  },
  flow: {
    label: 'Deep',
    icon: '✨',
    description: 'When you have extra capacity',
    emptyText: 'No picks yet. Add something deep.',
    color: 'text-orange-600',
  },
};

export default function PacePicksPage() {
  const { menuItems, deleteMenuItem } = usePacePicksStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PacePickItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreateNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: PacePickItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMenuItem(deleteConfirm);
    }
  };

  const getItemsForPace = (pace: PaceTag) => {
    return menuItems.filter((item) => item.paceTag === pace);
  };

  return (
    <div className="min-h-screen bg-calm-bg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-calm-text mb-2">Pace Picks</h1>
          <p className="text-calm-muted mb-6">
            Optional things that tend to feel good at each pace
          </p>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-calm-text text-calm-bg rounded-lg hover:bg-calm-text/90 transition-colors font-medium"
          >
            + Create New Pick
          </button>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['low', 'steady', 'flow'] as PaceTag[]).map((pace) => {
            const config = PACE_CONFIG[pace];
            const items = getItemsForPace(pace);

            return (
              <div key={pace} className="flex flex-col">
                {/* Column Header */}
                <div className="bg-calm-surface border border-calm-border rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{config.icon}</span>
                    <h2 className={`text-xl font-semibold ${config.color}`}>
                      {config.label}
                    </h2>
                  </div>
                  <p className="text-sm text-calm-muted">{config.description}</p>
                  <p className="text-xs text-calm-muted/70 mt-2">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>

                {/* Items List */}
                <div className="space-y-3 flex-1">
                  {items.length === 0 ? (
                    <div className="bg-calm-surface/50 border border-dashed border-calm-border rounded-lg p-6 text-center">
                      <p className="text-sm text-calm-muted italic">
                        {config.emptyText}
                      </p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-calm-surface border border-calm-border rounded-lg p-4 hover:border-calm-text/30 transition-colors group"
                      >
                        <div className="mb-3">
                          <h3 className="text-base font-medium text-calm-text mb-1">
                            {item.title}
                          </h3>
                          {item.estimatedDuration && (
                            <p className="text-sm text-calm-muted">{item.estimatedDuration}</p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="flex-1 px-3 py-1.5 bg-calm-border text-calm-text rounded-lg hover:bg-calm-text hover:text-calm-surface transition-colors text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1.5 bg-calm-border text-calm-text rounded-lg hover:bg-red-500 hover:text-white transition-colors text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer spacing for mobile bottom nav - ensures tooltips and content aren't hidden */}
        <div className="h-24 md:h-0"></div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <PacePickModal
          item={editingItem}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Pick?"
        message="This Pace Pick will be removed. You can always recreate it later."
        confirmLabel="Delete"
        cancelLabel="Keep It"
        variant="danger"
      />
    </div>
  );
}
