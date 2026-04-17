import { api } from './client';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  authProvider: 'EMAIL' | 'GOOGLE' | 'APPLE';
  avatarUrl: string | null;
  isVerified: boolean;
  role: 'USER' | 'ADMIN';
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export async function registerUser(data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data: res } = await api.post('/auth/register', data);
  return res;
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const { data: res } = await api.post('/auth/login', data);
  return res;
}

export async function googleLogin(data: {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
}): Promise<AuthResponse> {
  const { data: res } = await api.post('/auth/google', data);
  return res;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get('/auth/me');
  return data;
}

export async function updateProfile(data: {
  firstName?: string;
  lastName?: string;
}): Promise<User> {
  const { data: res } = await api.patch('/auth/me', data);
  return res;
}

