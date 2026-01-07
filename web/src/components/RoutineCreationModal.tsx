/**
 * RoutineCreationModal.tsx
 * Modal for creating new routine templates
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { RoutineTask, RoutineTemplate } from '@/src/models/RoutineTemplate';
import { useRoutineStore } from '@/src/stores/routineStore';

interface RoutineCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingRoutine?: RoutineTemplate | null;
}

export function RoutineCreationModal({ isOpen, onClose, editingRoutine }: RoutineCreationModalProps) {
  const { addTemplate, updateTemplate } = useRoutineStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState<Array<Omit<RoutineTask, 'id' | 'order'>>>([]);
  const [errors, setErrors] = useState<{ name?: string; tasks?: string }>({});
  const nameInputRef = useRef<HTMLInputElement>(null);

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
        name: task.name,
        durationMs: task.durationMs,
        lowSafe: task.lowSafe,
        flowExtra: task.flowExtra,
        autoAdvance: task.autoAdvance,
        subtasks: task.subtasks,
      })));
      setErrors({});
    } else if (isOpen && !editingRoutine) {
      // Reset form for new routine
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
    const newTask: Omit<RoutineTask, 'id' | 'order'> = {
      name: '',
      durationMs: 5 * 60 * 1000, // 5 minutes default
      lowSafe: false,
      flowExtra: false,
      autoAdvance: false,
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (index: number, updates: Partial<Omit<RoutineTask, 'id' | 'order'>>) => {
    const updated = [...tasks];
    updated[index] = { ...updated[index], ...updates };
    setTasks(updated);
  };

  const handleDeleteTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // Validation
    const newErrors: { name?: string; tasks?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter a routine name';
    }

    if (tasks.length === 0) {
      newErrors.tasks = 'Please add at least one task';
    } else {
      const unnamedTasks = tasks.filter(t => !t.name.trim());
      if (unnamedTasks.length > 0) {
        newErrors.tasks = 'All tasks must have a name';
      }

      const invalidDurations = tasks.filter(t => !t.durationMs || t.durationMs <= 0);
      if (invalidDurations.length > 0) {
        newErrors.tasks = 'All tasks must have a valid duration';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Format tasks
    const formattedTasks: RoutineTask[] = tasks.map((task, i) => ({
      id: editingRoutine?.tasks[i]?.id || `task-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 11)}`,
      name: task.name.trim(),
      durationMs: Math.max(0, task.durationMs || 0),
      order: i,
      lowSafe: task.lowSafe || false,
      flowExtra: task.flowExtra || false,
      autoAdvance: task.autoAdvance || false,
      subtasks: task.subtasks,
    }));

    if (editingRoutine) {
      // Update existing routine
      updateTemplate(editingRoutine.id, {
        name: name.trim(),
        description: description.trim(),
        tasks: formattedTasks,
      });
    } else {
      // Create new routine
      const templateId = addTemplate(name.trim(), description.trim());
      updateTemplate(templateId, { tasks: formattedTasks });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-calm-surface rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
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

            <div className="space-y-3">
              {tasks.map((task, index) => (
                <TaskInput
                  key={index}
                  task={task}
                  onUpdate={(updates) => handleUpdateTask(index, updates)}
                  onDelete={() => handleDeleteTask(index)}
                  autoFocus={index === tasks.length - 1}
                />
              ))}

              <button
                onClick={handleAddTask}
                className="w-full px-4 py-3 bg-calm-text/5 hover:bg-calm-text/10 text-calm-text rounded-lg transition-colors font-medium text-sm"
              >
                + Add Task
              </button>
            </div>
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
            className="px-5 py-2.5 bg-calm-text text-calm-surface hover:opacity-90 rounded-lg transition-opacity font-semibold"
          >
            {editingRoutine ? 'Save Changes' : 'Create Routine'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface TaskInputProps {
  task: Omit<RoutineTask, 'id' | 'order'>;
  onUpdate: (updates: Partial<Omit<RoutineTask, 'id' | 'order'>>) => void;
  onDelete: () => void;
  autoFocus?: boolean;
}

function TaskInput({ task, onUpdate, onDelete, autoFocus }: TaskInputProps) {
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
      <div className="flex gap-3">
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
          onClick={() => onUpdate({ lowSafe: !task.lowSafe })}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            task.lowSafe
              ? 'bg-calm-text text-calm-surface'
              : 'bg-calm-border/50 text-calm-muted hover:bg-calm-border'
          }`}
        >
          💤 Low
        </button>

        <button
          onClick={() => onUpdate({ flowExtra: !task.flowExtra })}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            task.flowExtra
              ? 'bg-calm-text text-calm-surface'
              : 'bg-calm-border/50 text-calm-muted hover:bg-calm-border'
          }`}
        >
          ✨ Flow
        </button>

        <button
          onClick={() => onUpdate({ autoAdvance: !task.autoAdvance })}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
            task.autoAdvance
              ? 'bg-calm-text text-calm-surface'
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
      {(task.lowSafe || task.flowExtra || task.autoAdvance) && (
        <p className="text-xs text-calm-muted leading-relaxed">
          {task.autoAdvance && 'Auto-advances • '}
          {task.lowSafe && task.flowExtra
            ? 'All energy modes'
            : task.lowSafe
            ? 'Low energy mode'
            : task.flowExtra
            ? 'Flow mode only'
            : 'Steady & Flow modes'}
        </p>
      )}
    </div>
  );
}
