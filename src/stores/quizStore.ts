import { defineStore } from "pinia";
import { ref, type Ref } from "vue";
import {
  getQuizzes,
  getQuizById,
  getQuizzesByTopic,
  addQuiz,
  updateQuiz,
  deleteQuiz,
  attemptQuiz,
} from "../services/quizService";
import type { Quiz, QuizOption } from "../types/Quiz";
import { useProgressStore } from "./progressStore";

type QuizForm = Omit<Quiz, "_id" | "createdAt" | "updatedAt">;
type AttemptPayload = { userId: string; selectedOptionOrder: number; courseId: string; isCorrect: boolean };

export const useQuizStore = defineStore("quizzes", () => {
  // --- State ---
  const quizzes = ref<Quiz[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // --- Internal request handler ---
  const handleRequest = async <T>(
    request: () => Promise<T>,
    onSuccess: (data: T) => void,
    errorMessage: string
  ) => {
    loading.value = true;
    try {
      const data = await request();
      onSuccess(data);
      error.value = null;
    } catch (err) {
      handleError(errorMessage, err);
    } finally {
      loading.value = false;
    }
  };

  // --- Actions ---
  const fetchQuizzes = async (): Promise<void> => {
    await handleRequest(
      () => getQuizzes(),
      (data) => { quizzes.value = data; },
      "Failed to fetch quizzes"
    );
  };

  const fetchQuizById = async (id: string): Promise<void> => {
    await handleRequest(
      () => getQuizById(id),
      (data) => { updateStore(data); },
      "Failed to fetch quiz by ID"
    );
  };

  const fetchQuizzesByTopic = async (topicId: string): Promise<void> => {
    await handleRequest(
      () => getQuizzesByTopic(topicId),
      (data) => { quizzes.value = data; },
      "Failed to fetch quizzes by topic"
    );
  };

  const saveQuiz = async (id: string | null, quizData: QuizForm): Promise<void> => {
    await handleRequest(
      async () => id ? await updateQuiz(id, quizData) : await addQuiz(quizData),
      (updatedQuiz) => { updateStore(updatedQuiz); },
      "Failed to save quiz"
    );
  };

  const deleteQuizById = async (id: string): Promise<void> => {
    await handleRequest(
      async () => { await deleteQuiz(id); return id; },
      (deletedId) => { quizzes.value = quizzes.value.filter(q => q._id !== deletedId); },
      "Failed to delete quiz"
    );
  };

  const attemptQuizById = async (quizId: string, payload: AttemptPayload): Promise<void> => {
    await attemptQuiz(quizId, payload);
  };

  const submitSingleQuiz = async (
    quiz: Quiz,
    selected: number,
    userId: string,
    courseId: string
  ): Promise<{ isCorrect: boolean }> => {
    const selectedOption = quiz.options.find((o: QuizOption) => o.order === selected);
    const isCorrect = selectedOption ? selectedOption.isCorrect : false;
    await attemptQuiz(quiz._id, {
      userId,
      selectedOptionOrder: selected,
      courseId,
      isCorrect,
    });
    return { isCorrect };
  };

  const processQuizSubmission = async (
    quiz: Quiz,
    selected: number,
    userId: string,
    courseId: string,
    results: Record<string, { isCorrect: boolean }>
  ): Promise<boolean> => {
    try {
      const { isCorrect } = await submitSingleQuiz(quiz, selected, userId, courseId);
      results[quiz._id] = { isCorrect };
      return isCorrect;
    } catch (err) {
      console.error("❌ Failed to submit quiz", quiz._id, err);
      return false;
    }
  };

  const handleSingleQuizSubmission = async (
    quiz: Quiz,
    selectedOptions: Record<string, number | undefined>,
    userId: string,
    courseId: string,
    results: Record<string, { isCorrect: boolean }>
  ): Promise<boolean> => {
    const selected = selectedOptions[quiz._id];
    if (selected == null) return true;
    return await processQuizSubmission(quiz, selected, userId, courseId, results);
  };

  const submitAllQuizzes = async (
    quizList: Quiz[],
    selectedOptions: Record<string, number | undefined>,
    userId: string,
    courseId: string,
    topicId: string
  ): Promise<{ allCorrect: boolean; results: Record<string, { isCorrect: boolean }> }> => {
    const results: Record<string, { isCorrect: boolean }> = {};
    let allCorrect = true;

    console.log("Submitting quizzes for topic:", topicId);
    for (const quiz of quizList) {
      const isCorrect = await handleSingleQuizSubmission(quiz, selectedOptions, userId, courseId, results);
      if (!isCorrect) allCorrect = false;
    }
    return { allCorrect, results };
  };

  const hasUnansweredQuestions = (selectedOptions: Record<string, number | undefined>) => {
    return quizzes.value.some(q => selectedOptions[q._id] == null);
  };

  const submitAndLogQuizzes = async (
    quizList: Quiz[],
    selectedOptions: Record<string, number | undefined>,
    userId: string,
    courseId: string,
    topicId: string,
    results: Ref<Record<string, { isCorrect: boolean }>>
  ): Promise<boolean> => {
    const { allCorrect, results: quizResults } = await submitAllQuizzes(
      quizList, selectedOptions, userId, courseId, topicId
    );
    results.value = quizResults;
    const progressStore = useProgressStore();
    await progressStore.fetchProgress(userId);
    if (allCorrect) {
      await progressStore.logProgress({
        user: userId,
        course: courseId,
        topic: topicId,
        activityType: "quiz",
        activityTable: "quizzes",
        activityId: topicId,
        isCorrect: true,
      });
      return true;
    } else {
      return false;
    }
  };

  // --- Reset/utility ---
  const resetQuizState = (
    quizzesRef: Ref<Quiz[]>,
    selectedOptions: Ref<Record<string, number | undefined>>,
    results: Ref<Record<string, { isCorrect: boolean }>>,
    currentQuizIndex: Ref<number>
  ) => {
    currentQuizIndex.value = 0;
    results.value = {};
    quizzesRef.value.forEach(q => {
      selectedOptions.value[q._id] = undefined;
    });
  };

  // --- Helpers ---
  const formatOptions = (options: QuizOption[]) => {
    return options.map((opt, index) => ({
      _id: opt._id || "",
      text: opt.text.trim(),
      isCorrect: Boolean(opt.isCorrect),
      order: opt.order ?? index + 1,
    }));
  };

  const updateStore = (quiz: Quiz) => {
    const idx = quizzes.value.findIndex(q => q._id === quiz._id);
    if (idx !== -1) {
      quizzes.value[idx] = quiz;
    } else {
      quizzes.value.push(quiz);
    }
  };

  const handleError = (message: string, err: unknown) => {
    console.error(`❌ ${message}:`, err);
    error.value = message;
  };

  // --- Return store API ---
  return {
    quizzes,
    loading,
    error,
    fetchQuizzes,
    fetchQuizById,
    fetchQuizzesByTopic,
    saveQuiz,
    deleteQuizById,
    attemptQuizById,
    submitSingleQuiz,
    processQuizSubmission,
    handleSingleQuizSubmission,
    submitAllQuizzes,
    hasUnansweredQuestions,
    submitAndLogQuizzes,
    resetQuizState,
    formatOptions,
    updateStore,
    handleError,
  };
});
