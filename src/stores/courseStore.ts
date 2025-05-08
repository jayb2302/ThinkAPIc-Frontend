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

const blankCourse: Course = {
  _id: "",
  title: "",
  description: "",
  teacher: "",
  scope: "",
  semester: "",
  learningObjectives: [],
  skills: [],
  competencies: [],
  topics: [],
  createdAt: "",
  updatedAt: "",
};

export const useCourseStore = defineStore("courses", () => {
  const courses = ref<Course[]>([]);
  const loading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const isEditing = ref(false);

  const selectedCourse = ref<Course | null>(null);
  const selectedCourseId = ref<string | null>(null);

  const showForm = ref(false);
  const showTopicForm = ref(false);

  const draftCourse = ref<Course>({ ...blankCourse });

  const successMessage = ref("");
  const errorMessage = ref("");

  const withLoading = async (fn: () => Promise<any>) => {
    loading.value = true;
    try {
      return await fn();
    } finally {
      loading.value = false;
    }
  };

  // API actions
  const fetchCourses = () =>
    withLoading(async () => {
      courses.value = await getCourses();
    });

  const createCourse = (
    courseData: Partial<Course>,
    topicsData: Partial<Topic>[] = []
  ) =>
    withLoading(async () => {
      const response = await createCourseService(courseData, topicsData);
      courses.value.push(response);
      return response;
    });

  const updateCourse = (id: string, courseData: Partial<Course>) =>
    withLoading(async () => {
      const response = await updateCourseByIdService(id, courseData);
      const index = courses.value.findIndex((course) => course._id === id);
      if (index !== -1) courses.value[index] = response;
      return response;
    });

  const deleteCourse = (id: string) =>
    withLoading(async () => {
      await deleteCourseService(id);
      courses.value = courses.value.filter((course) => course._id !== id);
    });

  // UI state helpers
  const editCourse = (course: Course) => {
    selectedCourse.value = { ...course };
    selectedCourseId.value = course._id;
    showForm.value = true;
  };

  const closeForm = () => {
    selectedCourse.value = null;
    showForm.value = false;
  };

  const handleCourseUpdated = (updatedCourse: Course) => {
    const index = courses.value.findIndex((c) => c._id === updatedCourse._id);
    const exists = index !== -1;

    if (exists) courses.value[index] = updatedCourse;
    else courses.value.push(updatedCourse);

    selectedCourse.value = exists ? null : updatedCourse;
    showForm.value = false;
    showTopicForm.value = !exists;
  };

  // Course submission helpers
  const submitCourse = async (
    courseData: {
      title: string;
      description: string;
      teacher: string;
      scope: string | number;
      semester: string | number;
      learningObjectives: string[];
      skills: string[];
      competencies: string[];
      topics: string[];
    },
    isEditing: boolean,
    propsCourse: Course | null
  ) => {
    const data = {
      ...courseData,
      scope: String(courseData.scope),
      semester: String(courseData.semester),
    };

    return isEditing && propsCourse?._id
      ? updateCourse(propsCourse._id, data)
      : createCourse(data);
  };

  const submitDraftCourse = async (isEditing: boolean) => {
    successMessage.value = "";
    errorMessage.value = "";

    const {
      title,
      description,
      teacher,
      scope,
      semester,
      learningObjectives,
      skills,
      competencies,
      topics,
    } = draftCourse.value;

    if (!title || !description || !teacher) {
      throw new Error("Title, description, and teacher are required");
    }

    const courseToSubmit = {
      title,
      description,
      teacher,
      scope,
      semester,
      learningObjectives,
      skills,
      competencies,
      topics,
    };

    const response = await submitCourse(
      courseToSubmit,
      isEditing,
      selectedCourse.value
    );
    successMessage.value = "✅ Course submitted successfully!";
    return response;
  };

  // State resetters
  const resetCourseDraft = () => {
    // Reset the draft course to a blank state
    draftCourse.value = structuredClone(blankCourse);
    successMessage.value = "";
    errorMessage.value = "";
  };

  const setSelectedCourseId = (id: string | null) => {
    selectedCourseId.value = id;
  };

  return {
    closeForm,
    courses,
    createCourse,
    deleteCourse,
    draftCourse,
    editCourse,
    error,
    errorMessage,
    fetchCourses,
    handleCourseUpdated,
    isEditing,
    loading,
    resetCourseDraft,
    selectedCourse,
    selectedCourseId,
    setSelectedCourseId,
    showForm,
    showTopicForm,
    submitCourse,
    submitDraftCourse,
    successMessage,
    updateCourse,
  };
});
