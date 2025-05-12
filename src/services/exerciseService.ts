import api from './api';
import type { Exercise } from '../types/Exercise';

export const getExercises = async () => {
  const { data } = await api.get('/exercises');
  return data;
};

export const getExerciseById = async (id: string) => {
  const { data } = await api.get(`/exercises/${id}`);
  return data;
};

export const addExercise = async (
  exerciseData: Omit<Exercise, '_id' | 'createdAt' | 'updatedAt'>
) => {
  const { data } = await api.post('/exercises', exerciseData);
  return data;
};

export const updateExercise = async (
  id: string,
  exerciseData: Omit<Exercise, '_id' | 'createdAt' | 'updatedAt'>
) => {
  const { data } = await api.put(`/exercises/${id}`, exerciseData);
  return data;
};

export const deleteExercise = async (id: string) => {
  await api.delete(`/exercises/${id}`);
};

export const attemptExercise = async (
  exerciseId: string,
  payload: { userId: string; timeSpent: number; success: boolean }
) => {
  const { data } = await api.post(`/exercises/${exerciseId}/attempt`, payload);
  return data;
};