'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGuideStore } from '@/src/stores/guideStore';
import { GuideItemCheckbox } from '@/src/components/GuideItemCheckbox';
import { CreateGuideModal } from '@/src/components/CreateGuideModal';
import { GuideItem } from '@/src/models/Guide';

export default function GuideDetailPage() {
  const router = useRouter();
  const params = useParams();
  const guideId = params.id as string;

  const {
    getGuideById,
    activeSession,
    startSession,
    toggleItem,
    resetSession,
    endSession,
    editGuide,
    deleteGuide,
    duplicateGuide,
    canCreateCustomGuide,
    _checkSessionStale,
  } = useGuideStore();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const guide = getGuideById(guideId);

  useEffect(() => {
    _checkSessionStale();
    if (guide && (!activeSession || activeSession.guideId !== guideId)) {
      startSession(guideId);
    }
  }, [guideId, guide, activeSession, startSession, _checkSessionStale]);

  if (!guide) {
    return (
      <div className="min-h-screen bg-calm-bg">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-calm-text mb-4">Guide not found</h1>
            <button
              onClick={() => router.push('/guides')}
              className="text-calm-text hover:underline"
            >
              Back to Guides
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isActiveSession = activeSession?.guideId === guideId;
  const checkedItemIds = isActiveSession ? activeSession.checkedItems : [];

  const itemsWithCheckedState: GuideItem[] = guide.items.map((item) => ({
    ...item,
    checked: checkedItemIds.includes(item.id),
  }));

  const checkedCount = itemsWithCheckedState.filter((item) => item.checked).length;
  const totalCount = itemsWithCheckedState.length;
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0;

  const handleEdit = (title: string, items: string[]) => {
    editGuide(guideId, title, items);
    setShowEditModal(false);
  };

  const handleDuplicate = (title: string, items: string[]) => {
    try {
      const newGuideId = duplicateGuide(guideId, title);
      setShowDuplicateModal(false);
      router.push(`/guides/${newGuideId}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to duplicate guide');
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this guide?')) {
      deleteGuide(guideId);
      router.push('/guides');
    }
  };

  return (
    <div className="min-h-screen bg-calm-bg">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/guides')}
            className="flex items-center gap-2 text-calm-muted hover:text-calm-text transition-colors mb-4"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Back to Guides</span>
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-calm-text">{guide.title}</h1>
                {!guide.isDefault && (
                  <span className="px-2 py-1 bg-calm-border rounded text-xs text-calm-muted">
                    Custom
                  </span>
                )}
              </div>
              <p className="text-calm-muted">
                {checkedCount} of {totalCount} complete
              </p>
            </div>

            {/* Menu for custom guides */}
            {!guide.isDefault && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-calm-border/50 rounded-lg transition-colors"
                  aria-label="Options"
                >
                  <svg
                    className="w-6 h-6 text-calm-muted"
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

                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-10">
                    <button
                      onClick={() => {
                        setShowEditModal(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors"
                    >
                      Edit Guide
                    </button>
                    <button
                      onClick={() => {
                        handleDelete();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-calm-bg transition-colors"
                    >
                      Delete Guide
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {checkedCount > 0 && (
          <div className="mb-6">
            <div className="w-full bg-calm-border rounded-full h-2 overflow-hidden">
              <div
                className="bg-calm-success h-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Checklist */}
        <div className="bg-calm-surface border border-calm-border rounded-xl p-6 mb-6">
          <div className="divide-y divide-calm-border">
            {itemsWithCheckedState.map((item) => (
              <GuideItemCheckbox
                key={item.id}
                id={item.id}
                text={item.text}
                checked={item.checked}
                onToggle={toggleItem}
              />
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {checkedCount > 0 && (
            <button
              onClick={resetSession}
              className="flex-1 px-4 py-3 bg-calm-border text-calm-text rounded-lg hover:bg-calm-border/80 transition-colors font-medium"
            >
              Reset Checklist
            </button>
          )}

          {guide.isDefault && canCreateCustomGuide() && (
            <button
              onClick={() => setShowDuplicateModal(true)}
              className="flex-1 px-4 py-3 bg-calm-text text-calm-surface rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Duplicate & Customize
            </button>
          )}
        </div>

        {/* Edit Modal */}
        {!guide.isDefault && (
          <CreateGuideModal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSave={handleEdit}
            editingGuide={guide}
          />
        )}

        {/* Duplicate Modal */}
        <CreateGuideModal
          isOpen={showDuplicateModal}
          onClose={() => setShowDuplicateModal(false)}
          onSave={handleDuplicate}
          editingGuide={guide}
        />
      </div>
    </div>
  );
}
