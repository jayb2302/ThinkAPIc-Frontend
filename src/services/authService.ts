import api from './api';

export const login = (email: string, password: string) => {
  return api.post('/auth/login', { email, password });
};

export const logout = () => {
  localStorage.removeItem('token');
};