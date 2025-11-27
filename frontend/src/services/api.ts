import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(username: string, email: string, password: string) {
    const response = await this.api.post('/auth/register', { username, email, password });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async updateDarkMode(darkMode: boolean) {
    const response = await this.api.patch('/auth/dark-mode', { darkMode });
    return response.data;
  }

  // Task endpoints
  async getTasks(date: string) {
    const response = await this.api.get('/tasks', { params: { date } });
    return response.data;
  }

  async createTask(taskData: any) {
    const response = await this.api.post('/tasks', taskData);
    return response.data;
  }

  async updateTask(id: string, taskData: any) {
    const response = await this.api.put(`/tasks/${id}`, taskData);
    return response.data;
  }

  async deleteTask(id: string) {
    const response = await this.api.delete(`/tasks/${id}`);
    return response.data;
  }

  async toggleTaskCompletion(id: string) {
    const response = await this.api.patch(`/tasks/${id}/toggle`);
    return response.data;
  }

  // Habit endpoints
  async getHabits() {
    const response = await this.api.get('/habits');
    return response.data;
  }

  async createHabit(name: string, emoji: string) {
    const response = await this.api.post('/habits', { name, emoji });
    return response.data;
  }

  async updateHabit(id: string, name: string, emoji: string) {
    const response = await this.api.put(`/habits/${id}`, { name, emoji });
    return response.data;
  }

  async deleteHabit(id: string) {
    const response = await this.api.delete(`/habits/${id}`);
    return response.data;
  }

  async toggleHabitCompletion(id: string) {
    const response = await this.api.patch(`/habits/${id}/toggle`);
    return response.data;
  }

  // Review endpoints
  async endDay() {
    const response = await this.api.post('/reviews/end-day');
    return response.data;
  }

  async getReviews(limit?: number) {
    const response = await this.api.get('/reviews', { params: { limit } });
    return response.data;
  }

  async getHeatmapData() {
    const response = await this.api.get('/reviews/heatmap');
    return response.data;
  }

  // Upload endpoint
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export default new ApiService();