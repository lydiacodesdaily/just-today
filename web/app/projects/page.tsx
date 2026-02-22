/**
 * /projects page
 * GTD-style Projects view — containers for multi-step outcomes.
 * Each project shows its associated focus items (next actions).
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useProjectsStore } from '@/src/stores/projectsStore';
import { useFocusStore } from '@/src/stores/focusStore';
import { Project } from '@/src/models/Project';
import { FocusItem, FocusDuration } from '@/src/models/FocusItem';
import { ConfirmDialog } from '@/src/components/Dialog';
import { Modal, ModalHeader, ModalBody, ModalFooter } from '@/src/components/Modal';

const DURATIONS: FocusDuration[] = [
  '~5 min',
  '~10 min',
  '~15 min',
  '~25 min',
  '~30 min',
  '~45 min',
  '~1 hour',
  '~2 hours',
];

// ─── Add Action Inline Form ───────────────────────────────────────────────────

interface AddActionFormProps {
  projectId: string;
  onClose: () => void;
}

function AddActionForm({ projectId, onClose }: AddActionFormProps) {
  const { addToToday, addToLater } = useFocusStore();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState<FocusDuration>('~15 min');
  const [location, setLocation] = useState<'today' | 'later'>('later');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Give this action a title');
      return;
    }
    if (location === 'today') {
      addToToday(title.trim(), duration, projectId);
    } else {
      addToLater(title.trim(), duration, undefined, undefined, projectId);
    }
    onClose();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 bg-calm-bg border border-calm-border rounded-lg p-4 space-y-3"
    >
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (error) setError('');
        }}
        placeholder="What needs to happen next?"
        className={`w-full px-3 py-2 bg-calm-surface border rounded-lg text-calm-text placeholder:text-calm-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-calm-text/30 focus:border-transparent ${
          error ? 'border-red-500' : 'border-calm-border'
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}

      <div className="flex gap-2">
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value as FocusDuration)}
          className="flex-1 px-3 py-2 bg-calm-surface border border-calm-border rounded-lg text-calm-text text-sm focus:outline-none focus:ring-2 focus:ring-calm-text/30"
        >
          {DURATIONS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <div className="flex rounded-lg border border-calm-border overflow-hidden">
          <button
            type="button"
            onClick={() => setLocation('today')}
            className={`px-3 py-2 text-sm font-medium transition-colors ${
              location === 'today'
                ? 'bg-calm-primary text-white'
                : 'bg-calm-surface text-calm-muted hover:text-calm-text'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setLocation('later')}
            className={`px-3 py-2 text-sm font-medium transition-colors border-l border-calm-border ${
              location === 'later'
                ? 'bg-calm-primary text-white'
                : 'bg-calm-surface text-calm-muted hover:text-calm-text'
            }`}
          >
            Later
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-3 py-2 text-sm text-calm-muted bg-calm-surface border border-calm-border rounded-lg hover:bg-calm-border/50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 px-3 py-2 text-sm font-medium text-white bg-calm-primary rounded-lg hover:opacity-90 transition-opacity"
        >
          Add action
        </button>
      </div>
    </form>
  );
}

// ─── Action Item Row ──────────────────────────────────────────────────────────

interface ActionRowProps {
  item: FocusItem;
  onMoveToToday?: () => void;
  onMoveToLater?: () => void;
  onDelete: () => void;
}

function ActionRow({ item, onMoveToToday, onMoveToLater, onDelete }: ActionRowProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg hover:bg-calm-bg/60 transition-colors group">
      <div className="flex-1 min-w-0">
        <span className="text-sm text-calm-text">{item.title}</span>
        <span className="ml-2 text-xs text-calm-muted">{item.estimatedDuration}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onMoveToToday && (
          <button
            onClick={onMoveToToday}
            className="px-2 py-1 text-xs text-calm-primary hover:bg-calm-primary/10 rounded transition-colors"
            title="Move to Today"
          >
            → Today
          </button>
        )}
        {onMoveToLater && (
          <button
            onClick={onMoveToLater}
            className="px-2 py-1 text-xs text-calm-muted hover:bg-calm-border/50 rounded transition-colors"
            title="Move to Later"
          >
            → Later
          </button>
        )}

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-calm-border/50 rounded transition-colors"
            aria-label="Options"
          >
            <svg className="w-4 h-4 text-calm-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-50">
              <button
                onClick={() => { onDelete(); setShowMenu(false); }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-calm-bg transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project;
  todayItems: FocusItem[];
  laterItems: FocusItem[];
  onRename: () => void;
  onDelete: () => void;
}

function ProjectCard({ project, todayItems, laterItems, onRename, onDelete }: ProjectCardProps) {
  const { moveToToday, moveToLater, deleteItem } = useFocusStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const totalActions = todayItems.length + laterItems.length;
  const hasNoNextAction = todayItems.length === 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  return (
    <div className="bg-calm-surface border border-calm-border rounded-xl overflow-hidden">
      {/* Project Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center gap-2 text-left hover:opacity-80 transition-opacity min-w-0"
        >
          <svg
            className={`w-4 h-4 text-calm-muted flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-calm-text truncate">{project.name}</span>
          <span className="text-xs text-calm-muted flex-shrink-0">
            {totalActions === 0 ? 'no actions' : `${totalActions} action${totalActions === 1 ? '' : 's'}`}
          </span>
        </button>

        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-calm-bg rounded-lg transition-colors"
            aria-label="Project options"
          >
            <svg className="w-4 h-4 text-calm-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-50">
              <button
                onClick={() => { onRename(); setShowMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors"
              >
                Rename
              </button>
              <button
                onClick={() => { onDelete(); setShowMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-calm-bg transition-colors border-t border-calm-border"
              >
                Delete project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-calm-border px-4 pb-4">
          {/* No next action nudge */}
          {hasNoNextAction && totalActions > 0 && (
            <div className="mt-3 px-3 py-2 bg-calm-steady/10 border border-calm-steady/20 rounded-lg">
              <p className="text-xs text-calm-text/70">
                No actions in Today — consider pulling one in when you have capacity.
              </p>
            </div>
          )}

          {totalActions === 0 && !showAddForm && (
            <div className="mt-3 px-3 py-3 rounded-lg border border-dashed border-calm-border text-center">
              <p className="text-sm text-calm-muted italic">No next actions yet.</p>
              <p className="text-xs text-calm-muted mt-1">Add one to keep this project moving.</p>
            </div>
          )}

          {/* Today items */}
          {todayItems.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-calm-muted uppercase tracking-wide mb-1 px-3">Today</p>
              {todayItems.map((item) => (
                <ActionRow
                  key={item.id}
                  item={item}
                  onMoveToLater={() => moveToLater(item.id)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>
          )}

          {/* Later items */}
          {laterItems.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-calm-muted uppercase tracking-wide mb-1 px-3">Later</p>
              {laterItems.map((item) => (
                <ActionRow
                  key={item.id}
                  item={item}
                  onMoveToToday={() => moveToToday(item.id)}
                  onDelete={() => deleteItem(item.id)}
                />
              ))}
            </div>
          )}

          {/* Add action form / button */}
          {showAddForm ? (
            <AddActionForm
              projectId={project.id}
              onClose={() => setShowAddForm(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-3 w-full px-3 py-2 text-sm text-calm-primary border border-dashed border-calm-primary/30 rounded-lg hover:bg-calm-primary/5 transition-colors"
            >
              + Add next action
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Project Form Modal ───────────────────────────────────────────────────────

interface ProjectFormModalProps {
  project: Project | null;
  onSave: (name: string) => void;
  onCancel: () => void;
}

function ProjectFormModal({ project, onSave, onCancel }: ProjectFormModalProps) {
  const [name, setName] = useState(project?.name ?? '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Give your project a short name');
      return;
    }
    onSave(name.trim());
  };

  return (
    <Modal isOpen onClose={onCancel} maxWidth="md">
      <ModalHeader title={project ? 'Rename project' : 'New project'} />
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <label htmlFor="project-name" className="block text-sm font-medium text-calm-text mb-2">
            Name
          </label>
          <input
            id="project-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
            placeholder="e.g., Home Reno, Side Hustle, Product Launch"
            className={`w-full px-4 py-2 bg-calm-bg border rounded-lg text-calm-text placeholder:text-calm-muted/50 focus:outline-none focus:ring-2 focus:ring-calm-text/30 ${
              error ? 'border-red-500' : 'border-calm-border'
            }`}
            autoFocus
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </ModalBody>
        <ModalFooter>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 min-h-[48px] px-4 py-3 bg-calm-border text-calm-text rounded-lg hover:bg-calm-text/10 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 min-h-[48px] px-4 py-3 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Save
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const { projects, addProject, renameProject, deleteProject } = useProjectsStore();
  const { todayItems, laterItems } = useFocusStore();

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Project | null>(null);
  const [showUnassigned, setShowUnassigned] = useState(false);

  // Items grouped by project
  const getProjectItems = (projectId: string) => ({
    today: todayItems.filter((i) => i.projectId === projectId && !i.completedAt),
    later: laterItems.filter((i) => i.projectId === projectId && !i.completedAt),
  });

  // Unassigned items (no projectId or null)
  const unassignedToday = todayItems.filter((i) => !i.projectId && !i.completedAt);
  const unassignedLater = laterItems.filter((i) => !i.projectId && !i.completedAt);
  const hasUnassigned = unassignedToday.length > 0 || unassignedLater.length > 0;

  const handleSave = (name: string) => {
    if (editingProject) {
      renameProject(editingProject.id, name);
    } else {
      addProject(name);
    }
    setShowModal(false);
    setEditingProject(null);
  };

  const handleRename = (project: Project) => {
    setEditingProject(project);
    setShowModal(true);
  };

  const handleDeleteConfirmed = () => {
    if (deleteConfirm) {
      deleteProject(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="min-h-screen bg-calm-bg">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-semibold text-calm-text">Projects</h1>
            <p className="text-sm text-calm-muted mt-1">
              Containers for multi-step outcomes. Each task below is a next action.
            </p>
          </div>
          <button
            onClick={() => { setEditingProject(null); setShowModal(true); }}
            className="flex-shrink-0 px-4 py-2 bg-calm-text text-calm-bg rounded-lg hover:bg-calm-text/90 transition-colors font-medium text-sm"
          >
            + New Project
          </button>
        </div>

        {/* Empty state */}
        {projects.length === 0 && !hasUnassigned && (
          <div className="mt-12 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-xl bg-calm-surface border border-calm-border flex items-center justify-center">
              <svg className="w-7 h-7 text-calm-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            </div>
            <p className="text-calm-text font-medium">No projects yet</p>
            <p className="text-sm text-calm-muted max-w-xs mx-auto">
              A project is any outcome that takes more than one action step. Add one to start grouping your tasks.
            </p>
          </div>
        )}

        {/* Project Cards */}
        <div className="mt-6 space-y-4">
          {projects.map((project) => {
            const { today, later } = getProjectItems(project.id);
            return (
              <ProjectCard
                key={project.id}
                project={project}
                todayItems={today}
                laterItems={later}
                onRename={() => handleRename(project)}
                onDelete={() => setDeleteConfirm(project)}
              />
            );
          })}
        </div>

        {/* Unassigned Items */}
        {hasUnassigned && (
          <div className="mt-8">
            <button
              onClick={() => setShowUnassigned(!showUnassigned)}
              className="w-full flex items-center justify-between px-4 py-3 bg-calm-surface border border-calm-border rounded-xl hover:border-calm-text/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg
                  className={`w-4 h-4 text-calm-muted transition-transform ${showUnassigned ? 'rotate-90' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm font-medium text-calm-text">Unassigned</span>
                <span className="text-xs text-calm-muted">
                  {unassignedToday.length + unassignedLater.length} item{unassignedToday.length + unassignedLater.length === 1 ? '' : 's'}
                </span>
              </div>
              <span className="text-xs text-calm-muted">not in any project</span>
            </button>

            {showUnassigned && (
              <div className="mt-2 bg-calm-surface border border-calm-border rounded-xl px-4 pb-4">
                {unassignedToday.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-calm-muted uppercase tracking-wide mb-1 px-3">Today</p>
                    {unassignedToday.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 py-2 px-3 rounded-lg">
                        <span className="flex-1 text-sm text-calm-text">{item.title}</span>
                        <span className="text-xs text-calm-muted">{item.estimatedDuration}</span>
                      </div>
                    ))}
                  </div>
                )}
                {unassignedLater.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-calm-muted uppercase tracking-wide mb-1 px-3">Later</p>
                    {unassignedLater.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 py-2 px-3 rounded-lg">
                        <span className="flex-1 text-sm text-calm-text">{item.title}</span>
                        <span className="text-xs text-calm-muted">{item.estimatedDuration}</span>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-3 px-3 text-xs text-calm-muted">
                  Assign these to a project via the edit menu on the Today or Later page.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Bottom spacing for mobile nav */}
        <div className="h-24 md:h-8" />
      </div>

      {/* Project Form Modal */}
      {showModal && (
        <ProjectFormModal
          project={editingProject}
          onSave={handleSave}
          onCancel={() => { setShowModal(false); setEditingProject(null); }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirmed}
        title="Delete project?"
        message={`"${deleteConfirm?.name}" will be removed. Any tasks in this project will stay — they just won't be grouped anymore.`}
        confirmLabel="Delete"
        cancelLabel="Keep it"
        variant="danger"
      />
    </div>
  );
}
