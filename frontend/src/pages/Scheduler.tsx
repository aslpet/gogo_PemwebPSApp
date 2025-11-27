import { useState, useEffect } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { Task } from '../types';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';

export default function Scheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    loadTasks();
  }, [selectedDate]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await api.getTasks(dateStr);
      setTasks(response.data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.deleteTask(taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      await api.toggleTaskCompletion(taskId);
      setTasks(tasks.map(t => 
        t._id === taskId ? { ...t, completed: !t.completed } : t
      ));
    } catch (err) {
      alert('Failed to toggle task completion');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingTask(null);
    loadTasks();
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Daily Scheduler
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Time-block your tasks and stay organized
          </p>
        </div>

        <button onClick={handleAddTask} className="btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      {/* Date Navigator */}
      <div className="card">
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </h2>
            {!isToday && (
              <button
                onClick={handleToday}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1"
              >
                Go to Today
              </button>
            )}
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Progress Bar */}
        {tasks.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{completedCount}/{tasks.length} tasks completed</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300"
                style={{ width: `${(completedCount / tasks.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No tasks scheduled for this day
          </p>
          <button onClick={handleAddTask} className="btn-primary">
            Create Your First Task
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map(task => (
            <TaskCard
              key={task._id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={showModal}
        onClose={handleModalClose}
        task={editingTask}
        selectedDate={selectedDate}
      />
    </div>
  );
}