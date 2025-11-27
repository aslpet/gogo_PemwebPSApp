import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Calendar, Target, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { Task, Habit, DailyReview } from '../types';
import Heatmap from '../components/Heatmap';

export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [latestReview, setLatestReview] = useState<DailyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [endDayLoading, setEndDayLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      const [tasksRes, habitsRes, reviewsRes] = await Promise.all([
        api.getTasks(today),
        api.getHabits(),
        api.getReviews(1),
      ]);

      setTasks(tasksRes.data);
      setHabits(habitsRes.data);
      if (reviewsRes.data.length > 0) {
        setLatestReview(reviewsRes.data[0]);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEndDay = async () => {
    try {
      setEndDayLoading(true);
      setError('');
      const response = await api.endDay();
      setLatestReview(response.data);
      alert('Daily review created! Check your productivity score below.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create daily review');
    } finally {
      setEndDayLoading(false);
    }
  };

  const completedTasks = tasks.filter(t => t.completed).length;
  const completedHabits = habits.filter(h => h.completedToday).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600 dark:text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your productivity overview
          </p>
        </div>

        {/* End Day Button */}
        <button
          onClick={handleEndDay}
          disabled={endDayLoading}
          className="flex items-center gap-2 btn-primary disabled:opacity-50"
        >
          <Sparkles className="w-5 h-5" />
          {endDayLoading ? 'Processing...' : 'End Day'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedTasks}/{tasks.length}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/scheduler')}
            className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            View Scheduler →
          </button>
        </div>

        {/* Habits Completed */}
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Habits Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {completedHabits}/{habits.length}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/habits')}
            className="mt-4 text-sm text-green-600 dark:text-green-400 hover:underline"
          >
            Track Habits →
          </button>
        </div>

        {/* Latest Score */}
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Latest Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {latestReview ? `${latestReview.productivityScore}/100` : 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="mt-4 text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            View History →
          </button>
        </div>
      </div>

      {/* Latest Review */}
      {latestReview && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Latest Daily Review
            </h2>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {new Date(latestReview.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
              {latestReview.aiComment}
            </p>
          </div>
        </div>
      )}

      {/* Productivity Heatmap */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Productivity Heatmap
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Your activity over the last year
        </p>
        <Heatmap />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => navigate('/scheduler')}
          className="card hover:shadow-lg transition-shadow text-left"
        >
          <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Plan Your Day
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Add tasks and organize your schedule
          </p>
        </button>

        <button
          onClick={() => navigate('/habits')}
          className="card hover:shadow-lg transition-shadow text-left"
        >
          <Target className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Track Habits
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Build consistency and grow your streaks
          </p>
        </button>
      </div>
    </div>
  );
}