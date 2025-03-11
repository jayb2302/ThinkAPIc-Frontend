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

  // delete course
  const deleteCourse = async (id: string) => {
    loading.value = true;
    try {
      await deleteCourse(id);
      courses.value = courses.value.filter((course) => course._id !== id);
    } catch (err) {
      console.error('Error deleting course:', err);
      error.value = 'Failed to delete course';
    } finally {
      loading.value = false;
    }
  };

  return { courses, loading, error, fetchCourses, deleteCourse };
});