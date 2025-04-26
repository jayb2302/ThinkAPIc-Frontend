import { defineStore } from "pinia";
import { ref } from "vue";
import {
  getQuizzes,
  getQuizById,
  getQuizzesByTopic,
  addQuiz,
  updateQuiz,
  deleteQuiz,
  attemptQuiz
} from "../services/quizService";
import type { Quiz, QuizOption } from "../types/Quiz";

export const useQuizStore = defineStore("quizzes", () => {
  const quizzes = ref<Quiz[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // 🔹 Format options consistently
  const formatOptions = (options: QuizOption[]) =>
    options.map((opt, index) => ({
      _id: opt._id || "",
      text: opt.text.trim(),
      isCorrect: Boolean(opt.isCorrect),
      order: opt.order ?? index + 1, // Assign order if missing
    }));

  // 🔹 Update quizzes in store efficiently
  const updateStore = (quiz: Quiz) => {
    const index = quizzes.value.findIndex((q) => q._id === quiz._id);
    if (index !== -1) {
      quizzes.value[index] = quiz; // Update existing quiz
    } else {
      quizzes.value.push(quiz); // Add new quiz
    }
  };

  // 🔹 Handle API errors
  const handleError = (message: string, err: unknown) => {
    console.error(`❌ ${message}:`, err);
    error.value = message;
  };

  // ✅ Fetch all quizzes
  const fetchQuizzes = async () => {
    try {
      loading.value = true;
      const data = await getQuizzes();
      quizzes.value = data.map((quiz: Quiz) => ({
        ...quiz,
        options: formatOptions(quiz.options),
      }));
    } catch (err) {
      handleError("Failed to load quizzes", err);
    } finally {
      loading.value = false;
    }
  };

  // ✅ Fetch a single quiz
  const fetchQuizById = async (id: string) => {
    try {
      loading.value = true;
      const quiz = await getQuizById(id);
      if (quiz) {
        const formattedQuiz = { ...quiz, options: formatOptions(quiz.options) };
        updateStore(formattedQuiz);
        return formattedQuiz;
      }
    } catch (err) {
      handleError("Failed to load quiz", err);
    } finally {
      loading.value = false;
    }
  };

  // ✅ Fetch quizzes by topic
  const fetchQuizzesByTopic = async (topicId: string) => {
    try {
      loading.value = true;
      const data = await getQuizzesByTopic(topicId);
      quizzes.value = data.map((quiz: Quiz) => ({
        ...quiz,
        options: formatOptions(quiz.options),
      }));
    } catch (err) {
      handleError("Failed to load quizzes by topic", err);
    } finally {
      loading.value = false;
    }
  };

  // ✅ Save quiz (Create or Update)
  const saveQuiz = async (
    id: string | null,
    quizData: Omit<Quiz, "_id" | "createdAt" | "updatedAt">
  ) => {
    try {
      loading.value = true;
      const formattedQuiz = {
        ...quizData,
        options: formatOptions(quizData.options),
      };
      const response = id
        ? await updateQuiz(id, formattedQuiz)
        : await addQuiz(formattedQuiz);
      if (response) updateStore(response);
      return response;
    } catch (err) {
      handleError(`Failed to ${id ? "update" : "add"} quiz`, err);
    } finally {
      loading.value = false;
    }
  };

  // ✅ Delete a quiz
  const deleteQuizById = async (id: string) => {
    try {
      loading.value = true;
      await deleteQuiz(id);
      quizzes.value = quizzes.value.filter((quiz) => quiz._id !== id);
    } catch (err) {
      handleError("Failed to delete quiz", err);
    } finally {
      loading.value = false;
    }
  };

  const attemptQuizById = async (
    quizId: string,
    payload: { userId: string; selectedOptionOrder: number; courseId: string; isCorrect: boolean }
  ) => {
    const res = await attemptQuiz(quizId, payload);
    return res;
  };

  return {
    quizzes,
    loading,
    error,
    attemptQuizById,
    fetchQuizzes,
    fetchQuizById,
    fetchQuizzesByTopic,
    saveQuiz,
    deleteQuizById,
  };
});
