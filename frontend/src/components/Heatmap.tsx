import { useState, useEffect } from 'react';
import api from '../services/api';
import { HeatmapData } from '../types';

export default function Heatmap() {
  const [data, setData] = useState<HeatmapData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  useEffect(() => {
    loadHeatmapData();
  }, []);

  const loadHeatmapData = async () => {
    try {
      setLoading(true);
      const response = await api.getHeatmapData();
      setData(response.data);
    } catch (err) {
      console.error('Failed to load heatmap data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getColorIntensity = (count: number): string => {
    if (count === 0) return 'bg-gray-200 dark:bg-gray-700';
    if (count <= 2) return 'bg-green-200 dark:bg-green-900';
    if (count <= 5) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-600 dark:bg-green-500';
  };

  const getLast365Days = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    
    return days;
  };

  const getDayData = (dateStr: string): HeatmapData | null => {
    return data.find(d => d.date.split('T')[0] === dateStr) || null;
  };

  const getTooltipText = (dateStr: string): string => {
    const dayData = getDayData(dateStr);
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    if (!dayData || dayData.total === 0) {
      return `${dateFormatted}: No activities`;
    }

    return `${dateFormatted}: ${dayData.tasks} tasks, ${dayData.habits} habits`;
  };

  const days = getLast365Days();
  
  // Group days by week
  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        Loading heatmap...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-end gap-2 text-xs text-gray-600 dark:text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="w-3 h-3 rounded bg-green-200 dark:bg-green-900" />
          <div className="w-3 h-3 rounded bg-green-400 dark:bg-green-700" />
          <div className="w-3 h-3 rounded bg-green-600 dark:bg-green-500" />
        </div>
        <span>More</span>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => {
                const dayData = getDayData(day);
                const count = dayData?.total || 0;
                
                return (
                  <div
                    key={day}
                    className={`w-3 h-3 rounded-sm ${getColorIntensity(count)} transition-all cursor-pointer hover:ring-2 hover:ring-blue-500`}
                    onMouseEnter={() => setHoveredDate(day)}
                    onMouseLeave={() => setHoveredDate(null)}
                    title={getTooltipText(day)}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDate && (
        <div className="p-3 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg shadow-lg">
          {getTooltipText(hoveredDate)}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
        <span>
          {data.length} active days in the last year
        </span>
        <span>
          {data.reduce((sum, d) => sum + d.total, 0)} total activities
        </span>
      </div>
    </div>
  );
}