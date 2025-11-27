import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;

    // Handle different error scenarios
    if (response) {
      const { status, data } = response;

      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token');
          if (window.location.pathname !== '/login') {
            toast.error('Session expired. Please log in again.');
            window.location.href = '/login';
          }
          break;

        case 403:
          // Forbidden
          toast.error('You do not have permission to perform this action.');
          break;

        case 404:
          // Not found
          toast.error('Resource not found.');
          break;

        case 422:
          // Validation error
          if (data.details && Array.isArray(data.details)) {
            data.details.forEach(detail => {
              toast.error(`${detail.field}: ${detail.message}`);
            });
          } else {
            toast.error(data.error || 'Validation failed');
          }
          break;

        case 429:
          // Too many requests
          toast.error('Too many requests. Please try again later.');
          break;

        case 500:
          // Server error
          toast.error('Server error. Please try again later.');
          break;

        default:
          // Generic error
          toast.error(data.error || 'An unexpected error occurred');
      }
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      toast.error('Request timeout. Please check your connection.');
    } else if (!error.response) {
      // Network error
      toast.error('Network error. Please check your internet connection.');
    }

    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
  refreshToken: () => api.post('/auth/refresh-token'),
};

export const eventsAPI = {
  getAll: (params) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
  getMyEvents: (params) => api.get('/events/my-events/all', { params }),
  getUpcoming: (params) => api.get('/events/upcoming', { params }),
  search: (query) => api.get('/events/search', { params: { search: query } }),
  getStats: (id) => api.get(`/events/${id}/stats`),
  validate: (id) => api.put(`/events/${id}/validate`),
};

export const ticketsAPI = {
  purchase: (ticketData) => api.post('/tickets/purchase', ticketData),
  getMyTickets: (params) => api.get('/tickets/my-tickets', { params }),
  getById: (id) => api.get(`/tickets/my-tickets/${id}`),
  cancel: (id) => api.put(`/tickets/${id}/cancel`),
  refund: (id) => api.put(`/tickets/${id}/refund`),
  getEventTickets: (eventId) => api.get(`/tickets/event/${eventId}`),
  validate: (ticketNumber, validationCode) => 
    api.get(`/tickets/validate/${ticketNumber}/${validationCode}`),
};

export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (profileData) => api.put('/users/profile', profileData),
  deleteAccount: (password) => api.delete('/users/account', { data: { password } }),
  getDashboardStats: () => api.get('/users/dashboard/stats'),
  getMyEvents: (params) => api.get('/users/my-events', { params }),
};

export const adminAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserStats: () => api.get('/admin/users/stats'),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  deactivateUser: (userId) => api.put(`/admin/users/${userId}/deactivate`),
  activateUser: (userId) => api.put(`/admin/users/${userId}/activate`),
  deleteUser: (userId) => api.delete(`/admin/users/${userId}`),
  getAllEvents: (params) => api.get('/admin/events', { params }),
  getValidationQueue: () => api.get('/admin/events/validation-queue'),
  validateEvent: (eventId) => api.put(`/admin/events/${eventId}/validate`),
  rejectEvent: (eventId, reason) => api.put(`/admin/events/${eventId}/reject`, { reason }),
  getPlatformStats: () => api.get('/admin/stats'),
};

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export const uploadFile = async (file, folder = 'uploads') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  try {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('File upload failed');
  }
};

export default api;