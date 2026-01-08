/**
 * /energy-menu page
 * Full Energy Menu management with 3-column layout for all energy levels
 */

'use client';

import { useState } from 'react';
import { useEnergyMenuStore } from '@/src/stores/energyMenuStore';
import { EnergyLevel, EnergyMenuItem } from '@/src/models/EnergyMenuItem';
import { EnergyMenuItemModal } from '@/src/components/EnergyMenuItemModal';

const ENERGY_LEVEL_CONFIG: Record<
  EnergyLevel,
  { label: string; icon: string; description: string; color: string }
> = {
  low: {
    label: 'Low',
    icon: '💤',
    description: 'Just the essentials',
    color: 'text-blue-600',
  },
  steady: {
    label: 'Steady',
    icon: '🌱',
    description: 'Your usual pace',
    color: 'text-green-600',
  },
  flow: {
    label: 'Flow',
    icon: '🔥',
    description: 'Feeling good today',
    color: 'text-orange-600',
  },
};

export default function EnergyMenuPage() {
  const { menuItems, deleteMenuItem } = useEnergyMenuStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EnergyMenuItem | null>(null);

  const handleCreateNew = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: EnergyMenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this Energy Menu item?')) {
      deleteMenuItem(id);
    }
  };

  const getItemsForLevel = (level: EnergyLevel) => {
    return menuItems.filter((item) => item.energyLevel === level);
  };

  return (
    <div className="min-h-screen bg-calm-bg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-calm-text mb-2">Energy Menu</h1>
          <p className="text-calm-muted mb-6">
            Build your menu of optional activities — things you might do when energy allows. Add them to Today when you&apos;re ready.
          </p>
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 bg-calm-text text-calm-bg rounded-lg hover:bg-calm-text/90 transition-colors font-medium"
          >
            + Create New Item
          </button>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(['low', 'steady', 'flow'] as EnergyLevel[]).map((level) => {
            const config = ENERGY_LEVEL_CONFIG[level];
            const items = getItemsForLevel(level);

            return (
              <div key={level} className="flex flex-col">
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
                      <p className="text-sm text-calm-text mb-1">No items yet</p>
                      <p className="text-xs text-calm-muted">
                        Add optional activities that match this energy level
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
      </div>

      {/* Modal */}
      {isModalOpen && (
        <EnergyMenuItemModal
          item={editingItem}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
