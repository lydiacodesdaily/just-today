'use client';

import { useState } from 'react';
import { useGuideStore } from '@/src/stores/guideStore';
import { DEFAULT_GUIDES } from '@/src/constants/defaultGuides';
import { GuideCard } from '@/src/components/GuideCard';
import { CreateGuideModal } from '@/src/components/CreateGuideModal';
import { AlertDialog } from '@/src/components/Dialog';

export default function GuidesPage() {
  const { customGuides, createGuide, canCreateCustomGuide, getCustomGuideCount } = useGuideStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGuide = (title: string, items: string[]) => {
    try {
      createGuide(title, items);
      setShowCreateModal(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create guide');
    }
  };

  return (
    <div className="min-h-screen bg-calm-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-calm-text mb-2">Guides</h1>
          <p className="text-calm-muted">
            Quick checklists for context transitions — not tasks, just support.
          </p>
        </header>

        <div className="space-y-8">
          {/* Default Guides Section */}
          <section>
            <h2 className="text-xl font-semibold text-calm-text mb-4">Default Guides</h2>
            <div className="space-y-3">
              {DEFAULT_GUIDES.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          </section>

          {/* Custom Guides Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-calm-text">
                Your Custom Guides{' '}
                <span className="text-sm text-calm-muted font-normal">
                  ({getCustomGuideCount()} / 3)
                </span>
              </h2>
            </div>

            <div className="space-y-3">
              {customGuides.length > 0 ? (
                <>
                  {customGuides.map((guide) => (
                    <GuideCard key={guide.id} guide={guide} />
                  ))}
                  {canCreateCustomGuide() && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="w-full px-6 py-5 border-2 border-dashed border-calm-border rounded-lg text-calm-muted hover:border-calm-text/30 hover:text-calm-text transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        <span className="text-base">Create Custom Guide</span>
                      </div>
                    </button>
                  )}
                </>
              ) : (
                <div className="bg-calm-surface border border-calm-border rounded-lg p-8 text-center">
                  <p className="text-calm-text mb-2">No custom guides yet</p>
                  <p className="text-sm text-calm-muted mb-6">
                    Default guides help with transitions. Create your own for routines you do often.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-calm-text text-calm-surface rounded-lg hover:opacity-90 transition-opacity font-medium text-sm"
                  >
                    Create Your First Guide
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Create Guide Modal */}
        <CreateGuideModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateGuide}
        />

        {/* Error Dialog */}
        <AlertDialog
          isOpen={!!error}
          onClose={() => setError('')}
          title="Could Not Create Guide"
          message={error}
        />
      </div>
    </div>
  );
}
