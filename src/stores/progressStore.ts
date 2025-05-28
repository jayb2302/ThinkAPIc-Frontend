import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { getUserProgress, addProgressLog } from "../services/progressService";

export const useProgressStore = defineStore("progress", () => {
  // State
  const logs = ref<any[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Actions
  const fetchProgress = async (userId: string) => {
    loading.value = true;
    try {
      logs.value = await getUserProgress(userId);
    } catch (err) {
      error.value = "Failed to fetch progress.";
    } finally {
      loading.value = false;
    }
  };

  const logProgress = async (progressData: any) => {
    loading.value = true;
    try {
      await addProgressLog(progressData);
      console.log("✅ Progress logged successfully");
    } catch (err) {
      error.value = "Failed to log progress.";
    } finally {
      loading.value = false;
    }
  };

  // Computed
  const completedTopics = computed(() => {
    const topicsMap = buildTopicsMap(logs.value);
    return calculateTopicCompletion(topicsMap);
  });

  const courseOptions = computed(() => {
    const courses = completedTopics.value.map((t) => ({
      label: t.courseTitle,
      value: t.courseId,
    }));
    return Array.from(new Map(courses.map((c) => [c.value, c])).values());
  });

  const totalQuizzesCompleted = computed(() => {
    return logs.value.filter(log => log.activityType === "quiz").length;
  });

  const correctRate = computed(() => {
    const quizLogs = logs.value.filter(log => log.activityType === "quiz");
    if (!quizLogs.length) return 0;
    const correct = quizLogs.filter(log => log.isCorrect).length;
    return Math.round((correct / quizLogs.length) * 100);
  });

  const topicsCompletionRate = computed(() => {
    if (!completedTopics.value.length) return 0;
    const completed = completedTopics.value.filter(topic => topic.isCompleted).length;
    return Math.round((completed / completedTopics.value.length) * 100);
  });

  // Helpers
  const extractTopicDetails = (log: any) => {
    const topicId = typeof log.topic === "object" ? log.topic._id : log.topic;
    const topicTitle = typeof log.topic === "object" ? log.topic.title : "Unknown Topic";
    const courseId = typeof log.course === "object" ? log.course._id : log.course;
    const courseTitle = log.course?.title || "Unknown Course";
    return { topicId, topicTitle, courseId, courseTitle };
  };

  const initializeTopicEntry = (map: Map<string, any>, topicId: string, topicTitle: string, courseId: string, courseTitle: string, completedAt: string) => {
    map.set(topicId, {
      topicId,
      courseId,
      topicTitle,
      courseTitle,
      quizzes: new Map<string, any>(),
      lastCompletedAt: completedAt,
    });
  };

  const buildTopicsMap = (logs: any[]) => {
    const map = new Map<string, any>();

    logs.forEach((log) => {
      if (log.activityType !== "quiz") return;

      const { topicId, topicTitle, courseId, courseTitle } = extractTopicDetails(log);
      if (!topicId) return;

      if (!map.has(topicId)) {
        initializeTopicEntry(map, topicId, topicTitle, courseId, courseTitle, log.completedAt);
      }

      const topicData = map.get(topicId);
      topicData.quizzes.set(log.activityId.toString(), log);
      topicData.lastCompletedAt = log.completedAt;
    });

    return map;
  };

  const calculateTopicCompletion = (topicsMap: Map<string, any>) => {
    return Array.from(topicsMap.values()).map((topic) => {
      const allCorrect = Array.from(topic.quizzes.values()).every((log: any) => log.isCorrect);
      return {
        ...topic,
        quizzesCompleted: topic.quizzes.size,
        totalQuizzes: topic.quizzes.size,
        isCompleted: allCorrect,
      };
    });
  };

  return {
    logs,
    loading,
    error,
    fetchProgress,
    logProgress,
    completedTopics,
    courseOptions,
    totalQuizzesCompleted,
    correctRate,
    topicsCompletionRate,
  };
});
