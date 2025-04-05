import { defineStore } from "pinia";
import { ref } from "vue";
import { 
  getCourses, 
  createCourseService,
  updateCourseByIdService, 
  deleteCourseService,
} from "../services/courseService";
import type { Course } from "../types/Course";
import type { Topic } from "../types/Topic";

export const useCourseStore = defineStore("courses", () => {
  const courses = ref<Course[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const fetchCourses = async () => {
    loading.value = true;
    try {
      courses.value = await getCourses();
    } catch (err) {
      console.error("Error fetching courses:", err);
      error.value = "Failed to load courses";
    } finally {
      loading.value = false;
    }
  };

  const createCourse = async (courseData: Partial<Course>, topicsData: Partial<Topic>[] = []) => {
    loading.value = true;
    try {
      const response = await createCourseService(courseData, topicsData); 
      courses.value.push(response);
      return response;
    } catch (err) {
      console.error("Error creating course:", err);
      error.value = "Failed to create course";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const updateCourse = async (id: string, courseData: Partial<Course>) => {
    loading.value = true;
    try {
      const response = await updateCourseByIdService(id, courseData);
      const index = courses.value.findIndex((course) => course._id === id);
      if (index !== -1) {
        courses.value[index] = response;
      }
      return response;
    } catch (err) {
      console.error("Error updating course:", err);
      error.value = "Failed to update course";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // delete course
  const deleteCourse = async (id: string) => {
    loading.value = true;
    try {
      await deleteCourseService(id);
      courses.value = courses.value.filter((course) => course._id !== id);
    } catch (err) {
      console.error("Error deleting course:", err);
      error.value = "Failed to delete course";
    } finally {
      loading.value = false;
    }
  };

  return {
    courses,
    loading,
    error,
    fetchCourses,
    deleteCourse,
    createCourse,
    updateCourse,
  };
});
