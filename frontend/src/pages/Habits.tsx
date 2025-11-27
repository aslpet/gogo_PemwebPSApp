import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../services/api';
import { Habit } from '../types';
import HabitCard from '../components/HabitCard';
import HabitModal from '../components/HabitModal';

export default function Habits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      setLoading(true);
      const response = await api.getHabits();
      setHabits(response.data);
    } catch (err) {
      console.error('Failed to load habits:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = () => {
    setEditingHabit(null);
    setShowModal(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowModal(true);
  };

  const handleDeleteHabit = async (habitId: string) => {
    if (!confirm('Are you sure you want to delete this habit?')) return;

    try {
      await api.deleteHabit(habitId);
      setHabits(habits.filter(h => h._id !== habitId));
    } catch (err) {
      alert('Failed to delete habit');
    }
  };

  const handleToggleHabit = async (habitId: string) => {
    try {
      const response = await api.toggleHabitCompletion(habitId);
      setHabits(habits.map(h => 
        h._id === habitId ? response.data : h
      ));
    } catch (err) {
      alert('Failed to toggle habit');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingHabit(null);
    loadHabits();
  };

  const completedToday = habits.filter(h => h.completedToday).length;
  const totalStreaks = habits.reduce((sum, h) => sum + h.currentStreak, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Habit Tracker
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Build consistency and grow your streaks
          </p>
        </div>

        <button onClick={handleAddHabit} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Habit
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Today's Progress
          </h3>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {completedToday}
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              / {habits.length}
            </p>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-green-600 dark:bg-green-500 transition-all duration-300"
              style={{ width: `${habits.length > 0 ? (completedToday / habits.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Total Active Streaks
          </h3>
          <div className="flex items-baseline gap-2">
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {totalStreaks}
            </p>
            <p className="text-2xl">🔥</p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Keep the momentum going!
          </p>
        </div>
      </div>

      {/* Habits List */}
      {loading ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          Loading habits...
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No habits yet. Start building your routine!
          </p>
          <button onClick={handleAddHabit} className="btn-primary">
            Create Your First Habit
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map(habit => (
            <HabitCard
              key={habit._id}
              habit={habit}
              onToggle={handleToggleHabit}
              onEdit={handleEditHabit}
              onDelete={handleDeleteHabit}
            />
          ))}
        </div>
      )}

      {/* Habit Modal */}
      <HabitModal
        isOpen={showModal}
        onClose={handleModalClose}
        habit={editingHabit}
      />
    </div>
  );
}