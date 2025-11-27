export interface User {
  id: string;
  username: string;
  email: string;
  darkMode: boolean;
}

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  startTime: string;
  endTime: string;
  date: string;
  completed: boolean;
  attachments: string[];
  createdAt: string;
}

export interface Habit {
  _id: string;
  userId: string;
  name: string;
  emoji: string;
  currentStreak: number;
  logs: HabitLog[];
  createdAt: string;
  completedToday?: boolean;
}

export interface HabitLog {
  date: string;
  completed: boolean;
}

export interface DailyReview {
  _id: string;
  userId: string;
  date: string;
  tasksCompleted: number;
  tasksTotal: number;
  habitsCompleted: number;
  habitsTotal: number;
  productivityScore: number;
  aiComment: string;
  createdAt: string;
}

export interface HeatmapData {
  date: string;
  tasks: number;
  habits: number;
  total: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}