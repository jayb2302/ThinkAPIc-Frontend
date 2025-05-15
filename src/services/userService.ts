import api from "./api";
import type { User, AdminUser } from "../types/User";

// Fetch all users
export const getAllUsers = async (): Promise<User[]> => {
  const { data } = await api.get<User[]>("/users");
  return data;
};

// Fetch a specific user by ID
export const getUserById = async (userId: string): Promise<User> => {
  const { data } = await api.get<User>(`/users/${userId}`);
  return data;
};

// Fetch admin users
export const getAdminUsers = async (): Promise<AdminUser[]> => {
  const { data } = await api.get<AdminUser[]>("/users/admins");
  return data;
};

// Create a new user
export const createUser = async (user: User): Promise<User> => {
  const { data } = await api.post<User>("/users", user);
  return data;
};

// Update an existing user
export const updateUser = async (userId: string, user: User): Promise<User> => {
  const { data } = await api.put<User>(`/users/${userId}`, user);
  return data;
};

// Update user role
export const updateUserRole = async (
  userId: string,
  role: string
): Promise<User> => {
  const { data } = await api.put<User>(`/users/${userId}/role`, { role });
  return data;
};

// Delete a user
export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/users/${userId}`);
};

// Login request
export const loginUser = async (email: string, password: string) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};
