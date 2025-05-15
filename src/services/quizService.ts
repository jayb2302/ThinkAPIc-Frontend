import api from "./api";
import type { Quiz } from "../types/Quiz";

export const getQuizzes = async () => {
  const { data } = await api.get("/quizzes");
  return data;
};

export const getQuizById = async (id: string) => {
  const { data } = await api.get(`/quizzes/${id}`);
  return data;
};

export const getQuizzesByTopic = async (topicId: string) => {
  const { data } = await api.get(`/quizzes/topic/${topicId}`);
  return data;
};

export const addQuiz = async (
  quizData: Omit<Quiz, "_id" | "createdAt" | "updatedAt">
) => {
  const { data } = await api.post("/quizzes", quizData);
  return data;
};

export const updateQuiz = async (
  id: string,
  quizData: Omit<Quiz, "_id" | "createdAt" | "updatedAt">
) => {
  const { data } = await api.put(`/quizzes/${id}`, quizData);
  return data;
};

export const deleteQuiz = async (id: string) => {
  await api.delete(`/quizzes/${id}`);
};

export const attemptQuiz = async (
  quizId: string,
  payload: {
    userId: string;
    selectedOptionOrder: number;
    courseId: string;
    isCorrect: boolean;
  }
) => {
  const { data } = await api.post(`/quizzes/${quizId}/attempt`, payload);
  return data;
};
