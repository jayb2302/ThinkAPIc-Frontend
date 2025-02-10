import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getTopics } from '../services/topicService';
import type { Topic } from '../types/Topic';

export const useTopicStore = defineStore('topics', () => {
  const topics = ref<Topic[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const fetchTopics = async () => {
    loading.value = true;
    try {
      topics.value = await getTopics();
    } catch (err) {
      console.error('Error fetching topics:', err);
      error.value = 'Failed to load topics';
    } finally {
      loading.value = false;
    }
  };

  return { topics, loading, error, fetchTopics };
});