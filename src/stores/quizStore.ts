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
import { useTopicStore } from "./topicStore";

type QuizForm = Omit<Quiz, "_id" | "createdAt" | "updatedAt">;
type AttemptPayload = {
  userId: string;
  selectedOptionOrder: number;
  courseId: string;
  isCorrect: boolean;
};

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
      (data) => {
        quizzes.value = data;
      },
      "Failed to fetch quizzes"
    );
  };

  const fetchQuizById = async (id: string): Promise<void> => {
    await handleRequest(
      () => getQuizById(id),
      (data) => {
        updateStore(data);
      },
      "Failed to fetch quiz by ID"
    );
  };

  const fetchQuizzesByTopic = async (topicId: string): Promise<void> => {
    loading.value = true;
    try {
      const data = await getQuizzesByTopic(topicId);
      quizzes.value = data;
      error.value = null;
    } catch (err: any) {
      if (err.response?.status === 404) {
        quizzes.value = []; // clear quizzes if none found
      } else {
        handleError("Failed to fetch quizzes by topic", err);
      }
    } finally {
      loading.value = false;
    }
  };

  const saveQuiz = async (
    id: string | null,
    quizData: QuizForm
  ): Promise<void> => {
    await handleRequest(
      async () =>
        id ? await updateQuiz(id, quizData) : await addQuiz(quizData),
      (updatedQuiz) => {
        updateStore(updatedQuiz);
      },
      "Failed to save quiz"
    );
  };

  const deleteQuizById = async (id: string): Promise<void> => {
    await handleRequest(
      async () => {
        await deleteQuiz(id);
        return id;
      },
      (deletedId) => {
        quizzes.value = quizzes.value.filter((q) => q._id !== deletedId);
      },
      "Failed to delete quiz"
    );
  };

  const attemptQuizById = async (
    quizId: string,
    payload: AttemptPayload
  ): Promise<void> => {
    await attemptQuiz(quizId, payload);
  };

  const submitSingleQuiz = async (
    quiz: Quiz,
    payload: AttemptPayload
  ): Promise<{ isCorrect: boolean }> => {
    await attemptQuiz(quiz._id, payload);
    return { isCorrect: payload.isCorrect };
  };

  const processQuizSubmission = async (
    quiz: Quiz,
    payload: AttemptPayload,
    results: Record<string, { isCorrect: boolean }>
  ): Promise<boolean> => {
    try {
      const { isCorrect } = await submitSingleQuiz(quiz, payload);
      results[quiz._id] = { isCorrect };
      return isCorrect;
    } catch (err) {
      console.error("❌ Failed to submit quiz", quiz._id, err);
      return false;
    }
  };

  const buildAttemptPayload = (
    quiz: Quiz,
    selected: number,
    userId: string,
    courseId: string
  ): AttemptPayload => {
    const selectedOption = quiz.options.find((o) => o.order === selected);
    const isCorrect = selectedOption ? selectedOption.isCorrect : false;

    return {
      userId,
      selectedOptionOrder: selected,
      courseId,
      isCorrect,
    };
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

    const payload = buildAttemptPayload(quiz, selected, userId, courseId);
    return await processQuizSubmission(quiz, payload, results);
  };

  const submitAllQuizzes = async (
    quizList: Quiz[],
    selectedOptions: Record<string, number | undefined>,
    userId: string,
    courseId: string,
    topicId: string
  ): Promise<{
    allCorrect: boolean;
    results: Record<string, { isCorrect: boolean }>;
  }> => {
    const results: Record<string, { isCorrect: boolean }> = {};
    let allCorrect = true;

    console.log("Submitting quizzes for topic:", topicId);
    for (const quiz of quizList) {
      const isCorrect = await handleSingleQuizSubmission(
        quiz,
        selectedOptions,
        userId,
        courseId,
        results
      );
      if (!isCorrect) allCorrect = false;
    }
    return { allCorrect, results };
  };

  const hasUnansweredQuestions = (
    selectedOptions: Record<string, number | undefined>
  ) => {
    return quizzes.value.some((q) => selectedOptions[q._id] == null);
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
      quizList,
      selectedOptions,
      userId,
      courseId,
      topicId
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
    quizzesRef.value.forEach((q) => {
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
    const idx = quizzes.value.findIndex((q) => q._id === quiz._id);
    if (idx !== -1) {
      quizzes.value[idx] = quiz;
    } else {
      quizzes.value.push(quiz);
    }
  };

  const handleError = (message: string, err: unknown) => {
    error.value = message;
    if (err instanceof Error) {
      //console.error(`❌ ${message}:`, err.message);
    }
  };

  const filterQuizzesByCourseAndTopic = (
    courseId: string | null,
    topicId: string | null
  ) => {
    return quizzes.value.filter((quiz) => {
      const topic = useTopicStore().topics.find(
        (t) => t._id === quiz.topic?._id
      );
      const matchesCourse = courseId ? topic?.course?._id === courseId : true;
      const matchesTopic = topicId ? quiz.topic?._id === topicId : true;
      return matchesCourse && matchesTopic;
    });
  };

  const fetchQuizCountForTopics = async (
    topicIds: string[]
  ): Promise<Record<string, number>> => {
    const counts: Record<string, number> = {};

    for (const topicId of topicIds) {
      try {
        const data = await getQuizzesByTopic(topicId);
        counts[topicId] = data.length;
      } catch (err: any) {
        counts[topicId] = 0;
      }
    }

    return counts;
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
    filterQuizzesByCourseAndTopic,
    fetchQuizCountForTopics,
  };
});
