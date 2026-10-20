import axios from 'axios';

// One axios instance for the whole app, pointing at the NestJS API
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

// Before every request, attach the saved JWT so the backend knows who we are
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nestnode_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errorMessage = (err) => {
  const m = err?.response?.data?.message;
  return Array.isArray(m) ? m[0] : m || 'Something went wrong. Please try again.';
};

export default api;
