import api from './api';
import type { User, AdminUser } from '../types/User';

// Fetch all users
export const getUsers = async (): Promise<User[]> => {
  const { data } = await api.get<User[]>('/users');
  return data;
}

// Fetch admin users
export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const { data } = await api.get<AdminUser[]>('/users/admins');
  return data;
}

// Login request (API only, no state handling)
export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  console.log("🔍 Raw login response:", response.data); // Add this
  return response.data;
};
