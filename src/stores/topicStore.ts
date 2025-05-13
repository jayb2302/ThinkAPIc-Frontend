import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import {
  getTopics,
  getTopicById,
  createTopic,
  updateTopicById,
  deleteTopicById,
} from "../services/topicService";
import type {
  NewTopicInput,
  Topic,
  TopicInput,
  UpdateTopicInput,
} from "../types/Topic";
import type { Course } from "../types/Course";
import { useCourseStore } from "../stores/courseStore";
import {
  createTopicHelper,
  getCourseId,
  updateTopicHelper,
} from "../helpers/topicHelpers";

export const useTopicStore = defineStore("topics", () => {
  // State and store setup
  const topics = ref<Topic[]>([]);
  const topicsLoaded = ref<boolean>(false);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const courseStore = useCourseStore();
  const { findCourseById } = courseStore;

  // Topic CRUD operations
  const fetchTopics = async () => {
    loading.value = true;
    try {
      topics.value = await getTopics();
      topicsLoaded.value = true;
    } catch (err) {
      error.value = "Failed to load topics.";
    } finally {
      loading.value = false;
    }
  };

  const fetchTopicById = async (id: string) => {
    loading.value = true;
    try {
      const topic = await getTopicById(id);
      addToTopicsIfMissing(topic);
      return topic;
    } catch (err) {
      error.value = "Failed to load topic.";
    } finally {
      loading.value = false;
    }
  };

  const addTopic = async (newTopic: NewTopicInput) => {
    loading.value = true;
    try {
      const createdTopic = await createTopic(newTopic);
      topics.value.push(createdTopic);
    } catch (err) {
      error.value = "Failed to add topic.";
    } finally {
      loading.value = false;
    }
  };

  const updateTopic = async (updatedTopic: UpdateTopicInput) => {
    loading.value = true;
    try {
      const response = await updateTopicById(updatedTopic._id, updatedTopic);
      const index = topics.value.findIndex((t) => t._id === updatedTopic._id);
      if (index !== -1) topics.value[index] = response;
    } catch (err) {
      error.value = "Failed to update topic.";
    } finally {
      loading.value = false;
    }
  };

  const saveTopic = async (
    topicData: TopicInput,
    topicId?: string
  ): Promise<Topic> => {
    loading.value = true;
    try {
      return topicId
        ? await updateTopicHelper(topicId, { ...topicData, _id: topicId })
        : await createTopicHelper(topicData);
    } catch (err) {
      error.value = "Failed to save topic.";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const deleteTopic = async (id: string) => {
    loading.value = true;
    try {
      await deleteTopicById(id);
      removeTopicFromCourses(id);

      topics.value = topics.value.filter((topic) => topic._id !== id);
    } catch (err) {
      error.value = "Failed to delete topic.";
    } finally {
      loading.value = false;
    }
  };

  // Topic-course relationship handlers
  const handleTopicCreated = (newTopic: Topic) => {
    addToTopicsIfMissing(newTopic);
    syncTopicWithCourse(newTopic);
    updateSelectedCourseIfNeeded(newTopic);
    closeTopicForm();
  };

  const addToTopicsIfMissing = (topic: Topic) => {
    if (!topics.value.some((t) => t._id === topic._id)) {
      topics.value.push(topic);
    }
  };

  const syncTopicWithCourse = (topic: Topic) => {
    const courseId = getCourseId(topic.course);
    const course = findCourseById(courseId);
    if (course) addTopicToCourseIfMissing(course, topic._id);
  };

  const addTopicToCourseIfMissing = (course: Course, topicId: string) => {
    if (!course.topics.includes(topicId)) {
      course.topics.push(topicId);
    }
  };

  const updateSelectedCourseIfNeeded = (topic: Topic) => {
    const courseId = getCourseId(topic.course);
    const { selectedCourse } = storeToRefs(courseStore);

    if (selectedCourse.value && selectedCourse.value._id === courseId) {
      selectedCourse.value = {
        ...selectedCourse.value,
        topics: [...selectedCourse.value.topics, topic._id],
      };
    }
  };

  const closeTopicForm = () => {
    const { showTopicForm } = storeToRefs(courseStore);
    showTopicForm.value = false;
  };

  // Utility functions
  const removeTopicFromCourses = (topicId: string) => {
    // Loop through all courses and remove the topic from the topics array
    courseStore.courses.forEach((course: Course) => {
      if (course.topics.includes(topicId)) {
        course.topics = course.topics.filter(
          (topicIdInCourse: string) => topicIdInCourse !== topicId
        );
      }
    });
  };

  // Computed properties
  const getTopicTitleById = computed(() => (id: string) => {
    return (
      topics.value.find((topic) => topic._id === id)?.title || "Unknown Topic"
    );
  });

  // Validation functions
  const isTopicValid = (topic: Partial<Topic>): boolean => {
    return Boolean(
      topic.title &&
        typeof topic.week === "number" &&
        !isNaN(topic.week) &&
        topic.summary &&
        topic.course
    );
  };

  return {
    topics,
    loading,
    error,
    fetchTopics,
    fetchTopicById,
    addTopic,
    updateTopic,
    saveTopic,
    deleteTopic,
    getTopicTitleById,
    isTopicValid,
    handleTopicCreated,
    topicsLoaded,
  };
});
