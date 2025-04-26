import { defineStore } from 'pinia';
import { getUserProgress, addProgressLog } from '../services/progressService';

export const useProgressStore = defineStore('progress', {
  state: () => ({
    logs: [] as any[],
  }),
  actions: {
    async fetchProgress(userId: string) {
      try {
        this.logs = await getUserProgress(userId);
      } catch (error) {
        console.error('❌ Failed to fetch progress', error);
      }
    },
    async logProgress(progressData: any) {
      try {
        await addProgressLog(progressData);
        console.log('✅ Progress logged successfully');
      } catch (error) {
        console.error('❌ Failed to log progress', error);
      }
    },
  },
  getters: {
    completedTopics(state) {
      const topicsMap = buildTopicsMap(state.logs);
      return calculateTopicCompletion(topicsMap);
    }
  }
});

function buildTopicsMap(logs: any[]) {
  const map = new Map<string, any>();

  for (const log of logs) {
    if (log.activityType !== 'quiz') continue;

    const topicId = typeof log.topic === 'object' ? log.topic._id : log.topic;
    const topicTitle = typeof log.topic === 'object' ? log.topic.title : 'Unknown Topic';
    const courseId = typeof log.course === 'object' ? log.course._id : log.course;

    if (!topicId) continue;

    if (!map.has(topicId)) {
      map.set(topicId, {
        topicId,
        courseId,
        topicTitle,
        courseTitle: log.course?.title || 'Unknown Course',
        quizzes: new Map<string, any>(),
        lastCompletedAt: log.completedAt,
      });
    }

    const topicData = map.get(topicId);
    topicData.quizzes.set(log.activityId.toString(), log);
    topicData.lastCompletedAt = log.completedAt;
  }

  return map;
}

function calculateTopicCompletion(topicsMap: Map<string, any>) {
  return Array.from(topicsMap.values()).map(topic => {
    const allCorrect = Array.from(topic.quizzes.values()).every((log: any) => log.isCorrect);

    return {
      ...topic,
      quizzesCompleted: topic.quizzes.size,
      totalQuizzes: topic.quizzes.size,
      isCompleted: allCorrect,
    };
  });
}