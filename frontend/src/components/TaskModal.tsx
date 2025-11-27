import { useState, useEffect, FormEvent } from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from './Modal';
import api from '../services/api';
import { Task } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  selectedDate: Date;
}

export default function TaskModal({ isOpen, onClose, task, selectedDate }: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setCategory(task.category);
      setStartTime(task.startTime);
      setEndTime(task.endTime);
    } else {
      setTitle('');
      setDescription('');
      setCategory('');
      setStartTime('09:00');
      setEndTime('10:00');
    }
    setError('');
  }, [task, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!category.trim()) {
      setError('Category is required');
      return;
    }

    if (startTime >= endTime) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        startTime,
        endTime,
        date: selectedDate.toISOString().split('T')[0],
        attachments: task?.attachments || [],
      };

      if (task) {
        await api.updateTask(task._id, taskData);
      } else {
        await api.createTask(taskData);
      }

      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Create New Task'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Task Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="e.g., Work on Skripsi Chapter 2"
            maxLength={200}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field resize-none"
            rows={3}
            placeholder="Add notes or details about this task..."
            maxLength={1000}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
            placeholder="e.g., Study, Work, Personal, Skripsi"
            maxLength={50}
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter any custom category you want
          </p>
        </div>

        {/* Time Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Time *
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Time *
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Note about attachments */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            💡 File upload feature is available via API. For demo purposes, attachments are simulated.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}