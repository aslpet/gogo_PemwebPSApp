import { useState, useEffect, FormEvent } from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from './Modal';
import api from '../services/api';
import { Habit } from '../types';

interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
}

const EMOJI_OPTIONS = [
  '✅', '💧', '📚', '😴', '🧹', '🏃', '🥗', '🧘', '💪', '🎯',
  '📝', '🎨', '🎵', '🌱', '☕', '🍎', '🚴', '🏊', '📱', '💻',
  '🌟', '⭐', '🔥', '💎', '🎓', '🌈', '🌸', '🌺', '🌻', '🌼'
];

export default function HabitModal({ isOpen, onClose, habit }: HabitModalProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✅');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setEmoji(habit.emoji);
    } else {
      setName('');
      setEmoji('✅');
    }
    setError('');
  }, [habit, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Habit name is required');
      return;
    }

    setLoading(true);

    try {
      if (habit) {
        await api.updateHabit(habit._id, name.trim(), emoji);
      } else {
        await api.createHabit(name.trim(), emoji);
      }
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save habit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habit ? 'Edit Habit' : 'Create New Habit'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Habit Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Habit Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="e.g., Morning Meditation"
            maxLength={100}
            required
          />
        </div>

        {/* Emoji Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Choose an Emoji
          </label>
          <div className="grid grid-cols-10 gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg max-h-48 overflow-y-auto">
            {EMOJI_OPTIONS.map((em) => (
              <button
                key={em}
                type="button"
                onClick={() => setEmoji(em)}
                className={`text-2xl p-2 rounded-lg transition-all ${
                  emoji === em
                    ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-600 dark:ring-blue-400 scale-110'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {em}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
            Preview:
          </p>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{emoji}</span>
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              {name || 'Your habit name'}
            </span>
          </div>
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
            {loading ? 'Saving...' : habit ? 'Update Habit' : 'Create Habit'}
          </button>
        </div>
      </form>
    </Modal>
  );
}