import { defineStore } from "pinia";
import { ref } from "vue";
import { getQuizzes, getQuizById, getQuizzesByTopic, addQuiz, updateQuiz, deleteQuiz } from "../services/quizService";
import type { Quiz } from "../types/Quiz";

export const useQuizStore = defineStore("quizzes", () => {
  const quizzes = ref<Quiz[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  
  // ✅ Fetch all quizzes
  const fetchQuizzes = async () => {
    loading.value = true;
    error.value = null;
    try {
      const data = await getQuizzes();
      quizzes.value = data;
    } catch (err) {
      console.error("❌ Error fetching quizzes:", err);
      error.value = "Failed to load quizzes.";
    } finally {
      loading.value = false;
    }
  };

  // ✅ Fetch a single quiz by ID
  const fetchQuizById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const quiz = await getQuizById(id);
      if (quiz && !quizzes.value.some(q => q._id === quiz._id)) {
        quizzes.value.push(quiz); 
      }
      return quiz;
    } catch (err) {
      console.error("❌ Error fetching quiz:", err);
      error.value = "Failed to load quiz.";
    } finally {
      loading.value = false;
    }
  };

  // ✅ Fetch quizzes by topic
  const fetchQuizzesByTopic = async (topicId: string) => {
    loading.value = true;
    error.value = null;
    try {
      const data = await getQuizzesByTopic(topicId);
      quizzes.value = data;
    } catch (err) {
      console.error("❌ Error fetching quizzes by topic:", err);
      error.value = "Failed to load quizzes.";
    } finally {
      loading.value = false;
    }
  };

  // ✅ Create a new quiz
  const createQuiz = async (quizData: Omit<Quiz, "_id" | "createdAt" | "updatedAt">) => {
    loading.value = true;
    error.value = null;
    try {
      const newQuiz = await addQuiz(quizData);
      if (!quizzes.value.some(q => q._id === newQuiz._id)) {
        quizzes.value = [...quizzes.value, newQuiz];
      }
      return newQuiz;
    } catch (err) {
      console.error("❌ Error adding quiz:", err);
      error.value = "Failed to add quiz.";
    } finally {
      loading.value = false;
    }
  };

  // ✅ Update an existing quiz
  const updateQuizById = async (id: string, quizData: Omit<Quiz, "_id" | "createdAt" | "updatedAt">) => {
    loading.value = true;
    error.value = null;
    try {
      const updatedQuiz = await updateQuiz(id, quizData);
      if (updatedQuiz) {
        // ✅ Find the quiz index
        const index = quizzes.value.findIndex(q => q._id === id);
        if (index !== -1) {
          // ✅ Replace the entire array to force reactivity
          quizzes.value = [
            ...quizzes.value.slice(0, index),
            updatedQuiz,
            ...quizzes.value.slice(index + 1)
          ];
        } else {
          console.warn("⚠️ Updated quiz not found in store, refetching quizzes.");
          await fetchQuizzes(); // Fetch fresh data if needed
        }
      } else {
        console.warn("⚠️ Updated quiz returned null, fetching fresh data.");
        await fetchQuizzes(); 
      }
      return updatedQuiz;
    } catch (err) {
      console.error("❌ Error updating quiz:", err);
      error.value = "Failed to update quiz.";
    } finally {
      loading.value = false;
    }
  };

  // ✅ Delete a quiz
  const deleteQuizById = async (id: string) => {
    loading.value = true;
    error.value = null;
    try {
      const quizExists = quizzes.value.some(q => q._id === id);
      if (!quizExists) {
        console.warn("⚠️ Trying to delete a quiz that doesn't exist in state.");
      }
      await deleteQuiz(id);
      quizzes.value = quizzes.value.filter((quiz) => quiz._id !== id);
    } catch (err) {
      console.error("❌ Error deleting quiz:", err);
      error.value = "Failed to delete quiz.";
    } finally {
      loading.value = false;
    }
  };

  return {
    quizzes,
    loading,
    error,
    fetchQuizzes,
    fetchQuizById,
    fetchQuizzesByTopic,
    createQuiz,
    updateQuizById,
    deleteQuizById
  };
});