import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getQuizzes, getQuizzesByTopic } from '../services/quizService';
import type { Quiz } from '../types/Quiz';

export const useQuizStore = defineStore('quizzes', () => {
  const quizzes = ref<Quiz[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const fetchQuizzes = async () => {
    loading.value = true;
    try {
      quizzes.value = await getQuizzes();
    } catch (err) {
      console.error('Error fetching quizzes:', err);
      error.value = 'Failed to load quizzes';
    } finally {
      loading.value = false;
    }
  };

  const fetchQuizzesByTopic = async (topicId: string) => {
    loading.value = true;
    try {
      quizzes.value = await getQuizzesByTopic(topicId);
    } catch (err) {
      console.error('Error fetching quizzes by topic:', err);
      error.value = 'Failed to load quizzes';
    } finally {
      loading.value = false;
    }
  };

  return { quizzes, loading, error, fetchQuizzes, fetchQuizzesByTopic };
});