/**
 * /projects page
 * GTD-style Projects view grouped by Area.
 * Area > Project > Next Actions
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useProjectsStore } from '@/src/stores/projectsStore';
import { useAreaStore } from '@/src/stores/areaStore';
import { useFocusStore } from '@/src/stores/focusStore';
import { Project } from '@/src/models/Project';
import { Area } from '@/src/models/Area';
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

// ─── Chevron Icon ─────────────────────────────────────────────────────────────

function Chevron({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-calm-muted flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

// ─── Kebab Menu Icon ──────────────────────────────────────────────────────────

function KebabIcon() {
  return (
    <svg className="w-4 h-4 text-calm-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
    </svg>
  );
}

// ─── Add Action Inline Form ───────────────────────────────────────────────────

interface AddActionFormProps {
  projectId: string;
  onClose: () => void;
}

function AddActionForm({ projectId, onClose }: AddActionFormProps) {
  const { addToToday, addToLater } = useFocusStore();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState<FocusDuration>('~15 min');
  const [location, setLocation] = useState<'today' | 'tomorrow' | 'later'>('later');
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
    } else if (location === 'tomorrow') {
      addToLater(title.trim(), duration, undefined, undefined, projectId, 'TOMORROW');
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
          {(['today', 'tomorrow', 'later'] as const).map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => setLocation(loc)}
              className={`px-3 py-2 text-sm font-medium transition-colors first:border-none border-l border-calm-border capitalize ${
                location === loc
                  ? 'bg-calm-primary text-white'
                  : 'bg-calm-surface text-calm-muted hover:text-calm-text'
              }`}
            >
              {loc.charAt(0).toUpperCase() + loc.slice(1)}
            </button>
          ))}
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
  onMoveToTomorrow?: () => void;
  onMoveToLater?: () => void;
  onMarkDone: () => void;
  onDelete: () => void;
  onEdit: (title: string, duration: FocusDuration) => void;
  onAssignProject?: (projectId: string) => void;
  availableProjects?: { id: string; name: string }[];
}

function ActionRow({ item, onMoveToToday, onMoveToTomorrow, onMoveToLater, onMarkDone, onDelete, onEdit, onAssignProject, availableProjects }: ActionRowProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDuration, setEditDuration] = useState<FocusDuration>(item.estimatedDuration);
  const menuRef = useRef<HTMLDivElement>(null);
  const canceledByEscapeRef = useRef(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowAssignMenu(false);
      }
    }
    if (showMenu || showAssignMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu, showAssignMenu]);

  const startEditing = () => {
    setEditTitle(item.title);
    setEditDuration(item.estimatedDuration);
    setIsEditing(true);
  };

  const saveEdit = () => {
    const trimmed = editTitle.trim();
    if (trimmed) onEdit(trimmed, editDuration);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="py-2 px-3 rounded-lg bg-calm-bg/60">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); saveEdit(); }
            else if (e.key === 'Escape') { canceledByEscapeRef.current = true; setIsEditing(false); }
          }}
          onBlur={() => {
            if (!canceledByEscapeRef.current) saveEdit();
            canceledByEscapeRef.current = false;
          }}
          className="w-full text-sm text-calm-text bg-transparent border-none outline-none p-0 mb-2"
          autoFocus
        />
        <div className="flex flex-wrap gap-1">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setEditDuration(d)}
              className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                editDuration === d
                  ? 'bg-calm-primary/10 border-calm-primary text-calm-primary font-medium'
                  : 'bg-calm-surface border-calm-border text-calm-muted hover:border-calm-text/30'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg hover:bg-calm-bg/60 transition-colors group">
      <div className="flex-1 min-w-0 cursor-text" onClick={startEditing}>
        <span className="text-sm text-calm-text">{item.title}</span>
        <span className="ml-2 text-xs text-calm-muted">{item.estimatedDuration}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onMoveToToday && (
          <button onClick={onMoveToToday} className="px-2 py-1 text-xs text-calm-primary hover:bg-calm-primary/10 rounded transition-colors" title="Move to Today">
            → Today
          </button>
        )}
        {onMoveToTomorrow && (
          <button onClick={onMoveToTomorrow} className="px-2 py-1 text-xs text-calm-muted hover:bg-calm-border/50 rounded transition-colors" title="Move to Tomorrow">
            → Tomorrow
          </button>
        )}
        {onMoveToLater && (
          <button onClick={onMoveToLater} className="px-2 py-1 text-xs text-calm-muted hover:bg-calm-border/50 rounded transition-colors" title="Move to Later">
            → Later
          </button>
        )}
        <button onClick={onMarkDone} className="px-2 py-1 text-xs text-calm-muted hover:bg-calm-border/50 rounded transition-colors" title="Mark done">
          ✓ Done
        </button>

        <div className="relative" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className="p-1 hover:bg-calm-border/50 rounded transition-colors" aria-label="Options">
            <KebabIcon />
          </button>
          {showMenu && !showAssignMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-50">
              <button onClick={() => { startEditing(); setShowMenu(false); }} className="w-full px-3 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors">Edit</button>
              {onAssignProject && availableProjects && availableProjects.length > 0 && (
                <button onClick={() => setShowAssignMenu(true)} className="w-full px-3 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors border-t border-calm-border">Assign to project...</button>
              )}
              <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-calm-bg transition-colors border-t border-calm-border">Remove</button>
            </div>
          )}
          {showAssignMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-50">
              <button onClick={() => { setShowAssignMenu(false); setShowMenu(true); }} className="w-full px-3 py-2 text-left text-sm text-calm-muted hover:bg-calm-bg transition-colors border-b border-calm-border">← Back</button>
              {availableProjects?.map((p) => (
                <button key={p.id} onClick={() => { onAssignProject?.(p.id); setShowAssignMenu(false); }} className="w-full px-3 py-2 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors">
                  {p.name}
                </button>
              ))}
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
  completedItems: FocusItem[];
  onRename: () => void;
  onDelete: () => void;
  onMoveToArea: (areaId: string | undefined) => void;
  areas: Area[];
  initialExpanded?: boolean;
}

function ProjectCard({
  project,
  todayItems,
  laterItems,
  completedItems,
  onRename,
  onDelete,
  onMoveToArea,
  areas,
  initialExpanded = false,
}: ProjectCardProps) {
  const { moveToToday, moveToTomorrow, moveToLater, completeItem, deleteItem, updateTodayItem, updateLaterItem, setItemTimeBucket } = useFocusStore();

  const tomorrowItems = laterItems.filter((i) => i.timeBucket === 'TOMORROW');
  const genericLaterItems = laterItems.filter((i) => i.timeBucket !== 'TOMORROW');
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const totalActions = todayItems.length + laterItems.length;
  const hasNoNextAction = todayItems.length === 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
        setShowMoveMenu(false);
      }
    }
    if (showMenu || showMoveMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu, showMoveMenu]);

  const otherAreas = areas.filter((a) => a.id !== project.areaId);

  return (
    <div className="bg-calm-surface border border-calm-border rounded-xl">
      {/* Project Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center gap-2 text-left hover:opacity-80 transition-opacity min-w-0"
        >
          <Chevron expanded={isExpanded} />
          <span className="font-medium text-calm-text truncate">{project.name}</span>
          <span className="text-xs text-calm-muted flex-shrink-0">
            {totalActions === 0 ? 'no actions' : `${totalActions} action${totalActions === 1 ? '' : 's'}`}
          </span>
        </button>

        <div className="relative flex-shrink-0" ref={menuRef}>
          <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 hover:bg-calm-bg rounded-lg transition-colors" aria-label="Project options">
            <KebabIcon />
          </button>
          {showMenu && !showMoveMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-50">
              <button onClick={() => { onRename(); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors">Rename</button>
              {areas.length > 0 && (
                <button onClick={() => setShowMoveMenu(true)} className="w-full px-4 py-2.5 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors border-t border-calm-border">Move to area...</button>
              )}
              <button onClick={() => { onDelete(); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-calm-bg transition-colors border-t border-calm-border">Delete project</button>
            </div>
          )}
          {showMoveMenu && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-50">
              <button onClick={() => { setShowMoveMenu(false); setShowMenu(true); }} className="w-full px-4 py-2.5 text-left text-sm text-calm-muted hover:bg-calm-bg transition-colors border-b border-calm-border">← Back</button>
              {otherAreas.map((a) => (
                <button key={a.id} onClick={() => { onMoveToArea(a.id); setShowMoveMenu(false); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors">
                  {a.name}
                </button>
              ))}
              {project.areaId && (
                <button onClick={() => { onMoveToArea(undefined); setShowMoveMenu(false); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-calm-muted hover:bg-calm-bg transition-colors border-t border-calm-border">
                  Remove from area
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-calm-border px-4 pb-4">
          {hasNoNextAction && totalActions > 0 && (
            <div className="mt-3 px-3 py-2 bg-calm-steady/10 border border-calm-steady/20 rounded-lg">
              <p className="text-xs text-calm-text/70">No actions in Today — consider pulling one in when you have capacity.</p>
            </div>
          )}

          {totalActions === 0 && !showAddForm && (
            <div className="mt-3 px-3 py-3 rounded-lg border border-dashed border-calm-border text-center">
              <p className="text-sm text-calm-muted italic">No next actions yet.</p>
              <p className="text-xs text-calm-muted mt-1">Add one to keep this project moving.</p>
            </div>
          )}

          {todayItems.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-calm-muted uppercase tracking-wide mb-1 px-3">Today</p>
              {todayItems.map((item) => (
                <ActionRow
                  key={item.id}
                  item={item}
                  onMoveToTomorrow={() => moveToTomorrow(item.id)}
                  onMoveToLater={() => moveToLater(item.id)}
                  onMarkDone={() => completeItem(item.id)}
                  onDelete={() => deleteItem(item.id)}
                  onEdit={(title, duration) => updateTodayItem(item.id, title, duration)}
                />
              ))}
            </div>
          )}

          {tomorrowItems.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-calm-muted uppercase tracking-wide mb-1 px-3">Tomorrow</p>
              {tomorrowItems.map((item) => (
                <ActionRow
                  key={item.id}
                  item={item}
                  onMoveToToday={() => moveToToday(item.id)}
                  onMoveToLater={() => setItemTimeBucket(item.id, 'NONE')}
                  onMarkDone={() => completeItem(item.id)}
                  onDelete={() => deleteItem(item.id)}
                  onEdit={(title, duration) => updateLaterItem(item.id, title, duration)}
                />
              ))}
            </div>
          )}

          {genericLaterItems.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-calm-muted uppercase tracking-wide mb-1 px-3">Later</p>
              {genericLaterItems.map((item) => (
                <ActionRow
                  key={item.id}
                  item={item}
                  onMoveToToday={() => moveToToday(item.id)}
                  onMoveToTomorrow={() => setItemTimeBucket(item.id, 'TOMORROW')}
                  onMarkDone={() => completeItem(item.id)}
                  onDelete={() => deleteItem(item.id)}
                  onEdit={(title, duration) => updateLaterItem(item.id, title, duration)}
                />
              ))}
            </div>
          )}

          {showAddForm ? (
            <AddActionForm projectId={project.id} onClose={() => setShowAddForm(false)} />
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-3 w-full px-3 py-2 text-sm text-calm-primary border border-dashed border-calm-primary/30 rounded-lg hover:bg-calm-primary/5 transition-colors"
            >
              + Add next action
            </button>
          )}

          {completedItems.length > 0 && (
            <div className="mt-3">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="flex items-center gap-1.5 px-3 py-1 text-xs text-calm-muted hover:text-calm-text transition-colors"
              >
                <Chevron expanded={showCompleted} />
                <span>{completedItems.length} completed</span>
              </button>
              {showCompleted && (
                <div className="mt-1 space-y-0.5">
                  {[...completedItems]
                    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
                    .map((item) => (
                      <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-calm-muted">
                        <svg className="w-3.5 h-3.5 flex-shrink-0 text-calm-steady" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="line-through truncate">{item.title}</span>
                        {item.completedAt && (
                          <span className="ml-auto flex-shrink-0 text-xs text-calm-muted/60">
                            {new Date(item.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Area Section ─────────────────────────────────────────────────────────────

interface AreaSectionProps {
  area: Area;
  projects: Project[];
  areas: Area[];
  getProjectItems: (id: string) => { today: FocusItem[]; later: FocusItem[]; completed: FocusItem[] };
  newlyCreatedProjectId: string | null;
  onRenameProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onMoveProjectToArea: (projectId: string, areaId: string | undefined) => void;
  onRenameArea: () => void;
  onDeleteArea: () => void;
}

function AreaSection({
  area,
  projects,
  areas,
  getProjectItems,
  newlyCreatedProjectId,
  onRenameProject,
  onDeleteProject,
  onMoveProjectToArea,
  onRenameArea,
  onDeleteArea,
}: AreaSectionProps) {
  const { toggleCollapsed } = useAreaStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isCollapsed = area.collapsed;

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
    <div>
      {/* Area Header */}
      <div className="flex items-center gap-2 px-1 py-2">
        <button
          onClick={() => toggleCollapsed(area.id)}
          className="flex-1 flex items-center gap-2 text-left hover:opacity-80 transition-opacity min-w-0"
        >
          <Chevron expanded={!isCollapsed} />
          <span className="font-semibold text-calm-text">{area.name}</span>
          <span className="text-xs text-calm-muted">
            {projects.length === 0 ? 'no projects' : `${projects.length} project${projects.length === 1 ? '' : 's'}`}
          </span>
        </button>

        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 hover:bg-calm-border/50 rounded-lg transition-colors"
            aria-label="Area options"
          >
            <KebabIcon />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-calm-surface border border-calm-border rounded-lg shadow-lg overflow-hidden z-50">
              <button onClick={() => { onRenameArea(); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-calm-text hover:bg-calm-bg transition-colors">Rename</button>
              <button onClick={() => { onDeleteArea(); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-calm-bg transition-colors border-t border-calm-border">Delete area</button>
            </div>
          )}
        </div>
      </div>

      {/* Projects inside area */}
      {!isCollapsed && (
        <div className="ml-4 space-y-3 mb-2">
          {projects.length === 0 ? (
            <div className="px-3 py-3 rounded-xl border border-dashed border-calm-border text-center">
              <p className="text-sm text-calm-muted italic">No projects in this area.</p>
            </div>
          ) : (
            projects.map((project) => {
              const { today, later, completed } = getProjectItems(project.id);
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  todayItems={today}
                  laterItems={later}
                  completedItems={completed}
                  onRename={() => onRenameProject(project)}
                  onDelete={() => onDeleteProject(project)}
                  onMoveToArea={(areaId) => onMoveProjectToArea(project.id, areaId)}
                  areas={areas}
                  initialExpanded={project.id === newlyCreatedProjectId}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Area Form Modal ──────────────────────────────────────────────────────────

interface AreaFormModalProps {
  area: Area | null;
  onSave: (name: string) => void;
  onCancel: () => void;
}

function AreaFormModal({ area, onSave, onCancel }: AreaFormModalProps) {
  const [name, setName] = useState(area?.name ?? '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Give your area a name');
      return;
    }
    onSave(name.trim());
  };

  return (
    <Modal isOpen onClose={onCancel} maxWidth="md">
      <ModalHeader title={area ? 'Rename area' : 'New area'} />
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <label htmlFor="area-name" className="block text-sm font-medium text-calm-text mb-2">Name</label>
          <input
            id="area-name"
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
            placeholder="e.g., Career, Learning, Personal"
            className={`w-full px-4 py-2 bg-calm-bg border rounded-lg text-calm-text placeholder:text-calm-muted/50 focus:outline-none focus:ring-2 focus:ring-calm-text/30 ${error ? 'border-red-500' : 'border-calm-border'}`}
            autoFocus
          />
          {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </ModalBody>
        <ModalFooter>
          <button type="button" onClick={onCancel} className="flex-1 min-h-[48px] px-4 py-3 bg-calm-border text-calm-text rounded-lg hover:bg-calm-text/10 transition-colors font-medium">Cancel</button>
          <button type="submit" className="flex-1 min-h-[48px] px-4 py-3 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium">Save</button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

// ─── Project Form Modal ───────────────────────────────────────────────────────

interface ProjectFormModalProps {
  project: Project | null;
  areas: Area[];
  defaultAreaId?: string;
  onSave: (name: string, areaId?: string) => void;
  onCancel: () => void;
}

function ProjectFormModal({ project, areas, defaultAreaId, onSave, onCancel }: ProjectFormModalProps) {
  const [name, setName] = useState(project?.name ?? '');
  const [areaId, setAreaId] = useState<string>(project?.areaId ?? defaultAreaId ?? '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Give your project a short name');
      return;
    }
    onSave(name.trim(), areaId || undefined);
  };

  return (
    <Modal isOpen onClose={onCancel} maxWidth="md">
      <ModalHeader title={project ? 'Rename project' : 'New project'} />
      <form onSubmit={handleSubmit}>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <label htmlFor="project-name" className="block text-sm font-medium text-calm-text mb-2">Name</label>
              <input
                id="project-name"
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
                placeholder="e.g., Home Reno, Side Hustle, Product Launch"
                className={`w-full px-4 py-2 bg-calm-bg border rounded-lg text-calm-text placeholder:text-calm-muted/50 focus:outline-none focus:ring-2 focus:ring-calm-text/30 ${error ? 'border-red-500' : 'border-calm-border'}`}
                autoFocus
              />
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>

            {areas.length > 0 && (
              <div>
                <label htmlFor="project-area" className="block text-sm font-medium text-calm-text mb-2">Area</label>
                <select
                  id="project-area"
                  value={areaId}
                  onChange={(e) => setAreaId(e.target.value)}
                  className="w-full px-4 py-2 bg-calm-bg border border-calm-border rounded-lg text-calm-text focus:outline-none focus:ring-2 focus:ring-calm-text/30"
                >
                  <option value="">Unsorted</option>
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <button type="button" onClick={onCancel} className="flex-1 min-h-[48px] px-4 py-3 bg-calm-border text-calm-text rounded-lg hover:bg-calm-text/10 transition-colors font-medium">Cancel</button>
          <button type="submit" className="flex-1 min-h-[48px] px-4 py-3 bg-calm-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium">Save</button>
        </ModalFooter>
      </form>
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const { projects, addProject, renameProject, deleteProject, setProjectArea } = useProjectsStore();
  const { areas, addArea, renameArea, deleteArea } = useAreaStore();
  const { todayItems, laterItems, completedItems, moveToToday, moveToTomorrow, moveToLater, completeItem, deleteItem, updateTodayItem, updateLaterItem, setItemProject, setItemTimeBucket } = useFocusStore();

  // Project modal state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [defaultAreaForNewProject, setDefaultAreaForNewProject] = useState<string | undefined>(undefined);
  const [deleteProjectConfirm, setDeleteProjectConfirm] = useState<Project | null>(null);
  const [newlyCreatedProjectId, setNewlyCreatedProjectId] = useState<string | null>(null);

  // Area modal state
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [editingArea, setEditingArea] = useState<Area | null>(null);
  const [deleteAreaConfirm, setDeleteAreaConfirm] = useState<Area | null>(null);

  // Unassigned items (no projectId)
  const [showUnassigned, setShowUnassigned] = useState(false);

  const getProjectItems = (projectId: string) => ({
    today: todayItems.filter((i) => i.projectId === projectId && !i.completedAt),
    later: laterItems.filter((i) => i.projectId === projectId && !i.completedAt),
    completed: completedItems.filter((i) => i.projectId === projectId),
  });

  const unassignedToday = todayItems.filter((i) => !i.projectId && !i.completedAt);
  const unassignedTomorrow = laterItems.filter((i) => !i.projectId && !i.completedAt && i.timeBucket === 'TOMORROW');
  const unassignedLater = laterItems.filter((i) => !i.projectId && !i.completedAt && i.timeBucket !== 'TOMORROW');
  const hasUnassigned = unassignedToday.length > 0 || unassignedTomorrow.length > 0 || unassignedLater.length > 0;

  // Projects grouped by area
  const sortedAreas = [...areas].sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
  const unsortedProjects = projects.filter((p) => !p.areaId);

  const getAreaProjects = (areaId: string) =>
    projects.filter((p) => p.areaId === areaId);

  const isEmpty = projects.length === 0 && areas.length === 0 && !hasUnassigned;

  // Handlers: Project
  const handleSaveProject = (name: string, areaId?: string) => {
    if (editingProject) {
      renameProject(editingProject.id, name);
      if (areaId !== editingProject.areaId) {
        setProjectArea(editingProject.id, areaId);
      }
    } else {
      const newId = addProject(name, areaId);
      setNewlyCreatedProjectId(newId);
    }
    setShowProjectModal(false);
    setEditingProject(null);
    setDefaultAreaForNewProject(undefined);
  };

  const handleRenameProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleDeleteProjectConfirmed = () => {
    if (deleteProjectConfirm) {
      deleteProject(deleteProjectConfirm.id);
      setDeleteProjectConfirm(null);
    }
  };

  // Handlers: Area
  const handleSaveArea = (name: string) => {
    if (editingArea) {
      renameArea(editingArea.id, name);
    } else {
      addArea(name);
    }
    setShowAreaModal(false);
    setEditingArea(null);
  };

  const handleRenameArea = (area: Area) => {
    setEditingArea(area);
    setShowAreaModal(true);
  };

  const handleDeleteAreaConfirmed = () => {
    if (deleteAreaConfirm) {
      deleteArea(deleteAreaConfirm.id);
      setDeleteAreaConfirm(null);
    }
  };

  const openNewProject = (areaId?: string) => {
    setEditingProject(null);
    setDefaultAreaForNewProject(areaId);
    setShowProjectModal(true);
  };

  return (
    <div className="min-h-screen bg-calm-bg">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <h1 className="text-3xl font-semibold text-calm-text">Projects</h1>
            <p className="text-sm text-calm-muted mt-1">
              Grouped by area. Each project contains next actions.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => { setEditingArea(null); setShowAreaModal(true); }}
              className="px-3 py-2 bg-calm-surface border border-calm-border text-calm-text rounded-lg hover:border-calm-text/30 transition-colors font-medium text-sm"
            >
              + Area
            </button>
            <button
              onClick={() => openNewProject()}
              className="px-4 py-2 bg-calm-text text-calm-bg rounded-lg hover:bg-calm-text/90 transition-colors font-medium text-sm"
            >
              + Project
            </button>
          </div>
        </div>

        {/* Empty state */}
        {isEmpty && (
          <div className="mt-12 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-xl bg-calm-surface border border-calm-border flex items-center justify-center">
              <svg className="w-7 h-7 text-calm-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            </div>
            <p className="text-calm-text font-medium">No projects yet</p>
            <p className="text-sm text-calm-muted max-w-xs mx-auto">
              Create an area to group related projects, then add projects inside it.
            </p>
          </div>
        )}

        {/* Area sections */}
        {(sortedAreas.length > 0 || unsortedProjects.length > 0) && (
          <div className="mt-6 space-y-6">
            {sortedAreas.map((area) => (
              <AreaSection
                key={area.id}
                area={area}
                projects={getAreaProjects(area.id)}
                areas={areas}
                getProjectItems={getProjectItems}
                newlyCreatedProjectId={newlyCreatedProjectId}
                onRenameProject={handleRenameProject}
                onDeleteProject={(p) => setDeleteProjectConfirm(p)}
                onMoveProjectToArea={(projectId, areaId) => setProjectArea(projectId, areaId)}
                onRenameArea={() => handleRenameArea(area)}
                onDeleteArea={() => setDeleteAreaConfirm(area)}
              />
            ))}

            {/* Unsorted projects */}
            {unsortedProjects.length > 0 && (
              <div>
                <div className="flex items-center gap-2 px-1 py-2">
                  <span className="font-semibold text-calm-muted text-sm">Unsorted</span>
                  <span className="text-xs text-calm-muted">
                    {unsortedProjects.length} project{unsortedProjects.length === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="ml-4 space-y-3 mb-2">
                  {unsortedProjects.map((project) => {
                    const { today, later, completed } = getProjectItems(project.id);
                    return (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        todayItems={today}
                        laterItems={later}
                        completedItems={completed}
                        onRename={() => handleRenameProject(project)}
                        onDelete={() => setDeleteProjectConfirm(project)}
                        onMoveToArea={(areaId) => setProjectArea(project.id, areaId)}
                        areas={areas}
                        initialExpanded={project.id === newlyCreatedProjectId}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Unassigned focus items (no project) */}
        {hasUnassigned && (
          <div className="mt-8">
            <button
              onClick={() => setShowUnassigned(!showUnassigned)}
              className="w-full flex items-center justify-between px-4 py-3 bg-calm-surface border border-calm-border rounded-xl hover:border-calm-text/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Chevron expanded={showUnassigned} />
                <span className="text-sm font-medium text-calm-text">Unassigned actions</span>
                <span className="text-xs text-calm-muted">
                  {unassignedToday.length + unassignedTomorrow.length + unassignedLater.length} item{unassignedToday.length + unassignedTomorrow.length + unassignedLater.length === 1 ? '' : 's'}
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
                      <ActionRow key={item.id} item={item}
                        onMoveToTomorrow={() => moveToTomorrow(item.id)}
                        onMoveToLater={() => moveToLater(item.id)}
                        onMarkDone={() => completeItem(item.id)}
                        onDelete={() => deleteItem(item.id)}
                        onEdit={(title, duration) => updateTodayItem(item.id, title, duration)}
                        onAssignProject={(projectId) => setItemProject(item.id, projectId)}
                        availableProjects={projects}
                      />
                    ))}
                  </div>
                )}
                {unassignedTomorrow.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-calm-muted uppercase tracking-wide mb-1 px-3">Tomorrow</p>
                    {unassignedTomorrow.map((item) => (
                      <ActionRow key={item.id} item={item}
                        onMoveToToday={() => moveToToday(item.id)}
                        onMoveToLater={() => setItemTimeBucket(item.id, 'NONE')}
                        onMarkDone={() => completeItem(item.id)}
                        onDelete={() => deleteItem(item.id)}
                        onEdit={(title, duration) => updateLaterItem(item.id, title, duration)}
                        onAssignProject={(projectId) => setItemProject(item.id, projectId)}
                        availableProjects={projects}
                      />
                    ))}
                  </div>
                )}
                {unassignedLater.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-calm-muted uppercase tracking-wide mb-1 px-3">Later</p>
                    {unassignedLater.map((item) => (
                      <ActionRow key={item.id} item={item}
                        onMoveToToday={() => moveToToday(item.id)}
                        onMoveToTomorrow={() => setItemTimeBucket(item.id, 'TOMORROW')}
                        onMarkDone={() => completeItem(item.id)}
                        onDelete={() => deleteItem(item.id)}
                        onEdit={(title, duration) => updateLaterItem(item.id, title, duration)}
                        onAssignProject={(projectId) => setItemProject(item.id, projectId)}
                        availableProjects={projects}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="h-24 md:h-8" />
      </div>

      {/* Project Form Modal */}
      {showProjectModal && (
        <ProjectFormModal
          project={editingProject}
          areas={areas}
          defaultAreaId={defaultAreaForNewProject}
          onSave={handleSaveProject}
          onCancel={() => { setShowProjectModal(false); setEditingProject(null); setDefaultAreaForNewProject(undefined); }}
        />
      )}

      {/* Area Form Modal */}
      {showAreaModal && (
        <AreaFormModal
          area={editingArea}
          onSave={handleSaveArea}
          onCancel={() => { setShowAreaModal(false); setEditingArea(null); }}
        />
      )}

      {/* Delete Project Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteProjectConfirm}
        onClose={() => setDeleteProjectConfirm(null)}
        onConfirm={handleDeleteProjectConfirmed}
        title="Delete project?"
        message={`"${deleteProjectConfirm?.name}" will be removed. Any tasks in this project will stay — they just won't be grouped anymore.`}
        confirmLabel="Delete"
        cancelLabel="Keep it"
        variant="danger"
      />

      {/* Delete Area Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteAreaConfirm}
        onClose={() => setDeleteAreaConfirm(null)}
        onConfirm={handleDeleteAreaConfirmed}
        title="Delete area?"
        message={`"${deleteAreaConfirm?.name}" will be removed. Projects inside it will move to Unsorted.`}
        confirmLabel="Delete"
        cancelLabel="Keep it"
        variant="danger"
      />
    </div>
  );
}
