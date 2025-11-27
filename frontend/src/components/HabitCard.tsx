import { Edit2, Trash2, CheckCircle2, Circle, Flame } from 'lucide-react';
import { Habit } from '../types';

interface HabitCardProps {
  habit: Habit;
  onToggle: (habitId: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export default function HabitCard({ habit, onToggle, onEdit, onDelete }: HabitCardProps) {
  return (
    <div className={`card ${habit.completedToday ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : ''}`}>
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(habit._id)}
          className="shrink-0 mt-1"
        >
          {habit.completedToday ? (
            <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
          ) : (
            <Circle className="w-7 h-7 text-gray-400 dark:text-gray-600 hover:text-green-600 dark:hover:text-green-400 transition-colors" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{habit.emoji}</span>
                <h3 className={`text-lg font-semibold ${
                  habit.completedToday 
                    ? 'text-green-700 dark:text-green-300' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {habit.name}
                </h3>
              </div>

              {/* Streak */}
              {habit.currentStreak > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {habit.currentStreak}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    day{habit.currentStreak !== 1 ? 's' : ''} streak
                  </span>
                </div>
              )}

              {habit.currentStreak === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Start your streak today! 💪
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(habit)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Edit habit"
              >
                <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={() => onDelete(habit._id)}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title="Delete habit"
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