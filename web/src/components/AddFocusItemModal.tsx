/**
 * AddFocusItemModal.tsx
 * Shared modal for adding a new focus item to Today or Later.
 */

'use client';

import { useState, useEffect } from 'react';
import { FocusDuration } from '@/src/models/FocusItem';
import { useFocusStore } from '@/src/stores/focusStore';
import { useProjectsStore } from '@/src/stores/projectsStore';
import { useFocusTrap } from '@/src/hooks/useFocusTrap';

const DURATION_OPTIONS: FocusDuration[] = [
  '~5 min',
  '~10 min',
  '~15 min',
  '~25 min',
  '~30 min',
  '~45 min',
  '~1 hour',
  '~2 hours',
];

interface AddFocusItemModalProps {
  destination: 'today' | 'later';
  onClose: () => void;
}

export function AddFocusItemModal({ destination, onClose }: AddFocusItemModalProps) {
  const { addToToday, addToLater } = useFocusStore();
  const { projects, addProject } = useProjectsStore();
  const modalRef = useFocusTrap<HTMLDivElement>(true);

  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState<FocusDuration>('~15 min');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const doAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    if (destination === 'today') {
      addToToday(trimmed, duration, projectId);
    } else {
      addToLater(trimmed, duration, undefined, undefined, projectId);
    }
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doAdd();
  };

  const handleCreateProject = () => {
    const name = newProjectName.trim();
    if (!name) return;
    addProject(name);
    // Zustand set() is synchronous — getState() reflects the update immediately
    const updated = useProjectsStore.getState().projects;
    const newProject = updated[updated.length - 1];
    if (newProject) setProjectId(newProject.id);
    setShowNewProject(false);
    setNewProjectName('');
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-item-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-calm-surface border border-calm-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-calm-border">
          <h2 id="add-item-modal-title" className="text-xl font-semibold text-calm-text">
            {destination === 'today' ? 'Add to Today' : 'Add to Later'}
          </h2>
        </div>

        {/* Body */}
        <form
          id="add-focus-item-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          {/* Title */}
          <div>
            <label htmlFor="add-item-title" className="block text-sm font-medium text-calm-text mb-2">
              {destination === 'today'
                ? 'What do you want to focus on?'
                : 'What do you want to park for later?'}
            </label>
            <input
              id="add-item-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  doAdd();
                }
              }}
              placeholder={
                destination === 'today'
                  ? 'e.g., Review pull requests'
                  : 'e.g., Research new framework'
              }
              className="w-full px-4 py-2 bg-calm-bg border border-calm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-calm-text/30 text-calm-text"
              autoFocus
            />
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="add-item-duration" className="block text-sm font-medium text-calm-text mb-2">
              Estimated duration
            </label>
            <p className="text-xs text-calm-muted mb-2">
              How long do you think this will take? It&apos;s okay to adjust as you go.
            </p>
            <select
              id="add-item-duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value as FocusDuration)}
              className="w-full px-4 py-2 bg-calm-bg border border-calm-border rounded-lg focus:outline-none focus:ring-2 focus:ring-calm-text/30 text-calm-text"
            >
              {DURATION_OPTIONS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-calm-text mb-2">
              Project <span className="text-calm-muted text-xs">(optional)</span>
            </label>

            {!showNewProject ? (
              <div className="flex gap-2">
                <select
                  id="add-item-project"
                  value={projectId ?? ''}
                  onChange={(e) => setProjectId(e.target.value || null)}
                  className="flex-1 px-4 py-2 bg-calm-bg border border-calm-border rounded-lg text-calm-text focus:outline-none focus:ring-2 focus:ring-calm-text/30"
                >
                  <option value="">No project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewProject(true)}
                  className="px-3 py-2 text-sm text-calm-primary border border-calm-border rounded-lg hover:bg-calm-bg transition-colors whitespace-nowrap"
                >
                  + New project
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { e.preventDefault(); handleCreateProject(); }
                    if (e.key === 'Escape') { setShowNewProject(false); setNewProjectName(''); }
                  }}
                  placeholder="Project name"
                  className="flex-1 px-4 py-2 bg-calm-bg border border-calm-border rounded-lg text-calm-text focus:outline-none focus:ring-2 focus:ring-calm-text/30"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                  className="px-3 py-2 text-sm bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewProject(false); setNewProjectName(''); }}
                  className="px-3 py-2 text-sm text-calm-muted border border-calm-border rounded-lg hover:bg-calm-bg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-calm-border flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[48px] px-4 py-3 bg-calm-border text-calm-text rounded-lg hover:bg-calm-border/80 transition-colors touch-manipulation"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-focus-item-form"
            disabled={!title.trim()}
            className="flex-1 min-h-[48px] px-4 py-3 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
