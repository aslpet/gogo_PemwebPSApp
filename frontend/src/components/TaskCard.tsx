import { Clock, Edit2, Trash2, Paperclip, CheckCircle2, Circle } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) {
  return (
    <div className={`card ${task.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task._id)}
          className="flex-shrink-0 mt-1"
        >
          {task.completed ? (
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
          ) : (
            <Circle className="w-6 h-6 text-gray-400 dark:text-gray-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${
                task.completed 
                  ? 'text-gray-500 dark:text-gray-500 line-through' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {task.title}
              </h3>

              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-3">
                {/* Time */}
                <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>{task.startTime} - {task.endTime}</span>
                </div>

                {/* Category */}
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                  {task.category}
                </span>

                {/* Attachments */}
                {task.attachments && task.attachments.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <Paperclip className="w-4 h-4" />
                    <span>{task.attachments.length} file(s)</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(task)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Edit task"
              >
                <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}