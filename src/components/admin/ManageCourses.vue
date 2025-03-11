<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useCourseStore } from "../../stores/courseStore";
import { useTopicStore } from "../../stores/topicStore";
import ManageCourseForm from "./ManageCourseForm.vue";
import type { Course } from "../../types/Course";

const courseStore = useCourseStore();
const topicStore = useTopicStore();

const showForm = ref(false);
const selectedCourse = ref<Course | null>(null);

// Fetch courses on mount
onMounted(async () => {
  await courseStore.fetchCourses();
  await topicStore.fetchTopics();
});

// Automatically refresh when topics change
watch(
  () => topicStore.topics,
  () => {
    console.log("✅ Topics updated, refreshing UI");
  }
);
const handleCourseUpdated = (updatedCourse: Course) => {
  if (!updatedCourse) return;

  // Find and update the course in the list
  const index = courseStore.courses.findIndex(
    (c) => c._id === updatedCourse._id
  );
  if (index !== -1) {
    // ✅ Update existing course
    courseStore.courses[index] = updatedCourse;
  } else {
    // ✅ Add new course if it doesn’t exist (for newly created courses)
    courseStore.courses.push(updatedCourse);
  }

  showForm.value = false;
  selectedCourse.value = null;
};

// Open edit mode
const editCourse = (course: any) => {
  selectedCourse.value = { ...course };
  showForm.value = true;
};

// Delete course and refresh list
const deleteCourse = async (courseId: string) => {
  if (confirm("Are you sure you want to delete this course?")) {
    await courseStore.deleteCourse(courseId);
    await courseStore.fetchCourses();
  }
};

// Reset form state
const closeForm = () => {
  selectedCourse.value = null;
  showForm.value = false;
};
</script>

<template>
  <div class="p-6 shadow rounded-md">
    <h2 class="text-2xl font-bold mb-4">Manage Courses</h2>

    <button
      @click="showForm = true"
      class="bg-blue-500 text-white px-4 py-2 rounded mb-4"
    >
      ➕ Add New Course
    </button>

    <!-- Course Form -->
    <ManageCourseForm
      v-if="showForm"
      :course="selectedCourse ?? {} as Course"
      @close="closeForm"
      @courseUpdated="handleCourseUpdated"
    />

    <!-- Course List -->
    <table
      class="w-full table-auto text-left border-collapse border border-gray-300"
    >
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-4 py-2">Title</th>
          <th class="border px-4 py-2">Teacher</th>
          <th class="border px-4 py-2">Topics</th>
          <th class="border px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="course in courseStore.courses"
          :key="course._id"
          class="border-b"
        >
          <td class="border px-4 py-2">{{ course.title }}</td>
          <td class="border px-4 py-2">{{ course.teacher }}</td>
          <td class="border px-4 py-2">
            <ul>
              <li v-for="topicId in course.topics" :key="topicId">
                {{ topicStore.topics.find((t) => t._id === topicId)?.title || "Unknown Topic" }}
              </li>
            </ul>
          </td>
          <td class="border px-4 py-2">
            <button @click="editCourse(course)" class="text-blue-300 mr-2">
              ✏️ Edit
            </button>
            <button @click="deleteCourse(course._id)" class="text-red-300">
              🗑 Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
