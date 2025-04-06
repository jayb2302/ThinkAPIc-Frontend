import { defineStore } from "pinia";
import { computed, ref } from "vue";
import {
  getTopics,
  getTopicById,
  createTopic,
  updateTopicById,
  deleteTopicById,
} from "../services/topicService";
import type { Topic } from "../types/Topic";
import type { Course } from "../types/Course";
import { useCourse } from "../stores/courseStore";

export const useTopicStore = defineStore("topics", () => {
  const topics = ref<Topic[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const courseStore = useCourse();

  // 🔹 Fetch all topics
  const fetchTopics = async () => {
    loading.value = true;
    try {
      topics.value = await getTopics();
    } catch (err) {
      console.error("❌ Error fetching topics:", err);
      error.value = "Failed to load topics.";
    } finally {
      loading.value = false;
    }
  };

  // 🔹 Fetch a single topic by ID
  const fetchTopicById = async (id: string) => {
    loading.value = true;
    try {
      const topic = await getTopicById(id);
      if (!topics.value.some((t) => t._id === id)) {
        topics.value.push(topic);
      }
      return topic;
    } catch (err) {
      console.error("❌ Error fetching topic:", err);
      error.value = "Failed to load topic.";
    } finally {
      loading.value = false;
    }
  };

  // 🔹 Add a new topic
  const addTopic = async (newTopic: Omit<Topic, "_id">) => {
    loading.value = true;
    try {
      const createdTopic = await createTopic(newTopic);
      topics.value.push(createdTopic);
    } catch (err) {
      console.error("❌ Error adding topic:", err);
      error.value = "Failed to add topic.";
    } finally {
      loading.value = false;
    }
  };

  // 🔹 Update an existing topic
  const updateTopic = async (updatedTopic: Topic) => {
    loading.value = true;
    try {
      const response = await updateTopicById(updatedTopic._id, updatedTopic);
      const index = topics.value.findIndex((t) => t._id === updatedTopic._id);
      if (index !== -1) topics.value[index] = response;
    } catch (err) {
      console.error("❌ Error updating topic:", err);
      error.value = "Failed to update topic.";
    } finally {
      loading.value = false;
    }
  };

  // 🔹 Delete a topic
  const deleteTopic = async (id: string) => {
    loading.value = true;
    try {
      await deleteTopicById(id);
      removeTopicFromCourses(id);

      topics.value = topics.value.filter((topic) => topic._id !== id);
    } catch (err) {
      console.error("❌ Error deleting topic:", err);
      error.value = "Failed to delete topic.";
    } finally {
      loading.value = false;
    }
  };
  
  const removeTopicFromCourses = (topicId: string) => {
    // Loop through all courses and remove the topic from the topics array
    courseStore.courses.forEach((course: Course) => {
      if (course.topics.includes(topicId)) {
        course.topics = course.topics.filter((topicIdInCourse: string) => topicIdInCourse !== topicId);
      }
    });
  };

  // 🔹 Get topic title by ID
  const getTopicTitleById = computed(() => (id: string) => {
    return (
      topics.value.find((topic) => topic._id === id)?.title || "Unknown Topic"
    );
  });

  return {
    topics,
    loading,
    error,
    fetchTopics,
    fetchTopicById,
    addTopic,
    updateTopic,
    deleteTopic,
    getTopicTitleById,
  };
});
