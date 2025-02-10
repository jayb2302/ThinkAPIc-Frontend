import api from './api';
import type { Quiz } from '../types/Quiz';

export const getQuizzes = async (): Promise<Quiz[]> => {
    const { data } = await api.get<Quiz[]>('/quizzes');
    return data;
};

export const getQuizzesByTopic = async (topicId: string): Promise<Quiz[]> => {
    const { data } = await api.get<Quiz[]>(`/quizzes?topic_id=${topicId}`);
    return data;
  };
