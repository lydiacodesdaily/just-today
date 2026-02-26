/**
 * RoutineCreationModal.tsx
 * Modal for creating new routine templates
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { RoutineTask, RoutineTemplate } from '@/src/models/RoutineTemplate';
import { useRoutineStore } from '@/src/stores/routineStore';
import { Modal } from './Modal';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface RoutineCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRoutine?: RoutineTemplate | null;
}

type TaskDraft = Omit<RoutineTask, 'id' | 'order'> & { _key: string };

function makeKey() {
  return `draft-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function RoutineCreationModal({ isOpen, onClose, editingRoutine }: RoutineCreationModalProps) {
  const { addTemplate, updateTemplate } = useRoutineStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState<TaskDraft[]>([]);
  const [errors, setErrors] = useState<{ name?: string; tasks?: string }>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setTasks((items) => {
        const oldIndex = items.findIndex((t) => t._key === active.id);
        const newIndex = items.findIndex((t) => t._key === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Auto-focus name input when modal opens
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Populate form when editing a routine
  useEffect(() => {
    if (isOpen && editingRoutine) {
      setName(editingRoutine.name);
      setDescription(editingRoutine.description || '');
      setTasks(editingRoutine.tasks.map(task => ({
        _key: task.id,
        name: task.name,
        durationMs: task.durationMs,
        lowIncluded: task.lowIncluded ?? task.lowSafe ?? false,
        steadyIncluded: task.steadyIncluded ?? (!task.flowExtra || task.lowSafe ? true : false),
        flowIncluded: task.flowIncluded ?? (task.flowExtra || task.lowSafe ? true : false),
        autoAdvance: task.autoAdvance,
        subtasks: task.subtasks,
      })));
      setErrors({});
    } else if (isOpen && !editingRoutine) {
      setName('');
      setDescription('');
      setTasks([]);
      setErrors({});
    }
  }, [isOpen, editingRoutine]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setName('');
      setDescription('');
      setTasks([]);
      setErrors({});
    }
  }, [isOpen]);

  const handleAddTask = () => {
    const newTask: TaskDraft = {
      _key: makeKey(),
      name: '',
      durationMs: 5 * 60 * 1000,
      lowIncluded: false,
      steadyIncluded: true,
      flowIncluded: false,
      autoAdvance: false,
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleUpdateTask = (key: string, updates: Partial<Omit<RoutineTask, 'id' | 'order'>>) => {
    setTasks((prev) =>
      prev.map((t) => (t._key === key ? { ...t, ...updates } : t))
    );
  };

  const handleDeleteTask = (key: string) => {
    setTasks((prev) => prev.filter((t) => t._key !== key));
  };

  const handleSave = () => {
    const newErrors: { name?: string; tasks?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter a routine name';
    }

    if (tasks.length === 0) {
      newErrors.tasks = 'Please add at least one task';
    } else {
      if (tasks.some((t) => !t.name.trim())) {
        newErrors.tasks = 'All tasks must have a name';
      } else if (tasks.some((t) => !t.durationMs || t.durationMs <= 0)) {
        newErrors.tasks = 'All tasks must have a valid duration';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Build a map of original task ids by their key (for edits preserving ids)
    const originalIdByKey = new Map(editingRoutine?.tasks.map((t) => [t.id, t.id]) ?? []);

    const formattedTasks: RoutineTask[] = tasks.map((task, i) => ({
      id: originalIdByKey.get(task._key) ?? task._key,
      name: task.name.trim(),
      durationMs: Math.max(0, task.durationMs || 0),
      order: i,
      lowIncluded: task.lowIncluded || false,
      steadyIncluded: task.steadyIncluded ?? true,
      flowIncluded: task.flowIncluded || false,
      autoAdvance: task.autoAdvance || false,
      subtasks: task.subtasks,
    }));

    if (editingRoutine) {
      updateTemplate(editingRoutine.id, {
        name: name.trim(),
        description: description.trim(),
        tasks: formattedTasks,
      });
    } else {
      const templateId = addTemplate(name.trim(), description.trim());
      updateTemplate(templateId, { tasks: formattedTasks });
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      {/* Header */}
      <div className="px-6 py-5 border-b border-calm-border">
        <h2 className="text-2xl font-bold text-calm-text">
          {editingRoutine ? 'Edit Routine' : 'New Routine'}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Routine Name */}
          <div>
            <label htmlFor="routine-name" className="block text-sm font-medium text-calm-text mb-2">
              Routine Name
            </label>
            <input
              ref={nameInputRef}
              id="routine-name"
              type="text"
              className="w-full px-4 py-3 bg-calm-background border border-calm-border rounded-lg text-calm-text placeholder-calm-muted focus:outline-none focus:ring-2 focus:ring-calm-text/20"
              placeholder="Morning Routine"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: undefined });
              }}
            />
            {errors.name && (
              <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="routine-description" className="block text-sm font-medium text-calm-text mb-2">
              Description (optional)
            </label>
            <input
              id="routine-description"
              type="text"
              className="w-full px-4 py-3 bg-calm-background border border-calm-border rounded-lg text-calm-text placeholder-calm-muted focus:outline-none focus:ring-2 focus:ring-calm-text/20"
              placeholder="A peaceful way to start the day"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Tasks */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-calm-text">Tasks</label>
              {errors.tasks && (
                <p className="text-sm text-red-600">{errors.tasks}</p>
              )}
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={tasks.map((t) => t._key)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <SortableTaskInput
                      key={task._key}
                      id={task._key}
                      task={task}
                      onUpdate={(updates) => handleUpdateTask(task._key, updates)}
                      onDelete={() => handleDeleteTask(task._key)}
                      autoFocus={index === tasks.length - 1}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button
              onClick={handleAddTask}
              className="mt-3 w-full px-4 py-3 bg-calm-text/5 hover:bg-calm-text/10 text-calm-text rounded-lg transition-colors font-medium text-sm"
            >
              + Add Task
            </button>
          </div>
        </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-calm-border flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-5 py-2.5 text-calm-text hover:bg-calm-border/50 rounded-lg transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 bg-calm-primary text-white hover:opacity-90 rounded-lg transition-opacity font-semibold"
        >
          {editingRoutine ? 'Save Changes' : 'Create Routine'}
        </button>
      </div>
    </Modal>
  );
}

interface SortableTaskInputProps {
  id: string;
  task: TaskDraft;
  onUpdate: (updates: Partial<Omit<RoutineTask, 'id' | 'order'>>) => void;
  onDelete: () => void;
  autoFocus?: boolean;
}

function SortableTaskInput({ id, task, onUpdate, onDelete, autoFocus }: SortableTaskInputProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskInput
        task={task}
        dragHandleProps={{ ...attributes, ...listeners }}
        onUpdate={onUpdate}
        onDelete={onDelete}
        autoFocus={autoFocus}
      />
    </div>
  );
}

interface TaskInputProps {
  task: Omit<RoutineTask, 'id' | 'order'>;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  onUpdate: (updates: Partial<Omit<RoutineTask, 'id' | 'order'>>) => void;
  onDelete: () => void;
  autoFocus?: boolean;
}

function TaskInput({ task, dragHandleProps, onUpdate, onDelete, autoFocus }: TaskInputProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 100);
    }
  }, [autoFocus]);

  const minutes = Math.floor((task.durationMs || 0) / 60000);

  return (
    <div className="bg-calm-background border border-calm-border rounded-lg p-4 space-y-3">
      {/* Task name and duration */}
      <div className="flex gap-3 items-center">
        <button
          {...dragHandleProps}
          className="text-calm-muted/40 hover:text-calm-muted cursor-grab active:cursor-grabbing touch-none flex-shrink-0"
          aria-label="Drag to reorder"
          tabIndex={-1}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="5" cy="4" r="1.5"/>
            <circle cx="11" cy="4" r="1.5"/>
            <circle cx="5" cy="8" r="1.5"/>
            <circle cx="11" cy="8" r="1.5"/>
            <circle cx="5" cy="12" r="1.5"/>
            <circle cx="11" cy="12" r="1.5"/>
          </svg>
        </button>
        <input
          ref={nameInputRef}
          type="text"
          className="flex-1 px-3 py-2 bg-calm-surface border border-calm-border rounded-lg text-calm-text placeholder-calm-muted focus:outline-none focus:ring-2 focus:ring-calm-text/20 text-sm"
          placeholder="What needs doing?"
          value={task.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
        />
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            className="w-16 px-3 py-2 bg-calm-surface border border-calm-border rounded-lg text-calm-text text-center focus:outline-none focus:ring-2 focus:ring-calm-text/20 text-sm font-semibold"
            value={minutes}
            onChange={(e) => {
              const mins = parseInt(e.target.value, 10);
              const validMins = isNaN(mins) ? 1 : Math.max(1, mins);
              onUpdate({ durationMs: validMins * 60000 });
            }}
          />
          <span className="text-sm text-calm-muted font-medium">min</span>
        </div>
      </div>

      {/* Energy mode tags and options */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onUpdate({ lowIncluded: !task.lowIncluded })}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            task.lowIncluded
              ? 'bg-calm-primary text-white'
              : 'bg-calm-border/50 text-calm-muted hover:bg-calm-border'
          }`}
        >
          💤 Low
        </button>

        <button
          onClick={() => onUpdate({ steadyIncluded: !task.steadyIncluded })}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            task.steadyIncluded
              ? 'bg-calm-primary text-white'
              : 'bg-calm-border/50 text-calm-muted hover:bg-calm-border'
          }`}
        >
          🎯 Steady
        </button>

        <button
          onClick={() => onUpdate({ flowIncluded: !task.flowIncluded })}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            task.flowIncluded
              ? 'bg-calm-primary text-white'
              : 'bg-calm-border/50 text-calm-muted hover:bg-calm-border'
          }`}
        >
          ✨ Flow
        </button>

        <button
          onClick={() => onUpdate({ autoAdvance: !task.autoAdvance })}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            task.autoAdvance
              ? 'bg-calm-primary text-white'
              : 'bg-calm-border/50 text-calm-muted hover:bg-calm-border'
          }`}
        >
          ⏭️ Auto
        </button>

        <button
          onClick={onDelete}
          className="ml-auto px-3 py-1.5 text-xs font-medium text-calm-muted hover:text-red-600 transition-colors"
        >
          Remove
        </button>
      </div>

      {/* Help text */}
      {(task.lowIncluded || task.steadyIncluded || task.flowIncluded || task.autoAdvance) && (
        <p className="text-xs text-calm-muted leading-relaxed">
          {task.autoAdvance && 'Auto-advances • '}
          {(() => {
            const modes = [];
            if (task.lowIncluded) modes.push('Low');
            if (task.steadyIncluded) modes.push('Steady');
            if (task.flowIncluded) modes.push('Flow');
            if (modes.length === 0) return 'Steady mode (default)';
            if (modes.length === 3) return 'All energy modes';
            return modes.join(' + ') + ' mode' + (modes.length > 1 ? 's' : '');
          })()}
        </p>
      )}
    </div>
  );
}
