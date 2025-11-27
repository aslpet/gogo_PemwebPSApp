import { useState, useEffect } from 'react';
import { History as HistoryIcon, TrendingUp, Calendar, Target } from 'lucide-react';
import api from '../services/api';
import { DailyReview } from '../types';

export default function History() {
  const [reviews, setReviews] = useState<DailyReview[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await api.getReviews();
      setReviews(response.data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
    if (score >= 55) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/30';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return '🎉 Excellent';
    if (score >= 70) return '✨ Great';
    if (score >= 55) return '💪 Good';
    if (score >= 40) return '🌱 Keep Going';
    return '🌤️ New Start';
  };

  const averageScore = reviews.length > 0
    ? Math.round(reviews.reduce((sum, r) => sum + r.productivityScore, 0) / reviews.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <HistoryIcon className="w-8 h-8" />
          Review History
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track your productivity journey over time
        </p>
      </div>

      {/* Summary Stats */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Score</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {averageScore}/100
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Reviews</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {reviews.length}
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Latest Score</p>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {reviews[0].productivityScore}/100
            </p>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          Loading reviews...
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12">
          <HistoryIcon className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            No reviews yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Click "End Day" on the Dashboard to create your first review
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="card">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {new Date(review.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(review.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Score Badge */}
                <div className={`px-4 py-2 rounded-lg ${getScoreColor(review.productivityScore)}`}>
                  <p className="text-sm font-medium">{getScoreBadge(review.productivityScore)}</p>
                  <p className="text-2xl font-bold text-center mt-1">
                    {review.productivityScore}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tasks</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {review.tasksCompleted}/{review.tasksTotal}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {review.tasksTotal > 0 
                      ? `${Math.round((review.tasksCompleted / review.tasksTotal) * 100)}% complete`
                      : 'No tasks'}
                  </p>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Habits</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {review.habitsCompleted}/{review.habitsTotal}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {review.habitsTotal > 0
                      ? `${Math.round((review.habitsCompleted / review.habitsTotal) * 100)}% complete`
                      : 'No habits'}
                  </p>
                </div>
              </div>

              {/* AI Comment */}
              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 border-blue-600 dark:border-blue-400">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {review.aiComment}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}