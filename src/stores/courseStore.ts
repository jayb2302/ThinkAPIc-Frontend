import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getCourses } from '../services/courseService';
import type { Course } from '../types/Course';

export const useCourseStore = defineStore('courses', () => {
  const courses = ref<Course[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const fetchCourses = async () => {
    loading.value = true;
    try {
      courses.value = await getCourses();
    } catch (err) {
      console.error('Error fetching courses:', err);
      error.value = 'Failed to load courses';
    } finally {
      loading.value = false;
    }
  };

  return { courses, loading, error, fetchCourses };
});