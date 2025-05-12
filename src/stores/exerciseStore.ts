import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as exerciseService from '../services/exerciseService';
import type { Exercise } from '../types/Exercise';

export const useExerciseStore = defineStore('exercise', () => {
  const exercises = ref<Exercise[]>([]);
  const loading = ref(false);

  const fetchExercises = async () => {
    loading.value = true;
    const data = await exerciseService.getExercises();
    exercises.value = data;
    loading.value = false;
  };

  const createExercise = async (payload: Omit<Exercise, '_id' | 'createdAt' | 'updatedAt'>) => {
    const newExercise = await exerciseService.addExercise(payload);
    exercises.value.push(newExercise);
    return newExercise;
  };

  const updateExercise = async (id: string, payload: Omit<Exercise, '_id' | 'createdAt' | 'updatedAt'>) => {
    const updated = await exerciseService.updateExercise(id, payload);
    const index = exercises.value.findIndex(e => e._id === id);
    if (index !== -1) exercises.value[index] = updated;
    return updated;
  };

  const deleteExercise = async (id: string) => {
    await exerciseService.deleteExercise(id);
    exercises.value = exercises.value.filter(e => e._id !== id);
  };

  return {
    exercises,
    loading,
    fetchExercises,
    createExercise,
    updateExercise,
    deleteExercise,
  };
});