/**
 * SubtaskList.tsx
 * Checklist for task subtasks.
 */

import React from 'react';
import { RunSubtask } from '@/src/models/RoutineRun';

interface SubtaskListProps {
  subtasks: RunSubtask[];
  onToggle: (subtaskId: string) => void;
}

export function SubtaskList({ subtasks, onToggle }: SubtaskListProps) {
  if (!subtasks || subtasks.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {subtasks.map((subtask) => (
        <label
          key={subtask.id}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <input
            type="checkbox"
            checked={subtask.checked}
            onChange={() => onToggle(subtask.id)}
            className="w-5 h-5 rounded border-calm-border text-calm-primary focus:ring-2 focus:ring-calm-primary focus:ring-offset-0"
          />
          <span
            className={`text-base ${
              subtask.checked
                ? 'text-calm-muted line-through'
                : 'text-calm-text group-hover:text-calm-primary'
            } transition-colors`}
          >
            {subtask.text}
          </span>
        </label>
      ))}
    </div>
  );
}
