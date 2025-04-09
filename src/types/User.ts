export type UserRole = 'student' | 'admin';

export interface User {
  _id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface AdminUser {
  _id: string;
  username: string;
}