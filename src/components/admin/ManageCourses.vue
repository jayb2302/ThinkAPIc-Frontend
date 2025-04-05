<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useCourseStore } from "../../stores/courseStore";
import { useTopicStore } from "../../stores/topicStore";
import ManageCourseForm from "./ManageCourseForm.vue";
import ManageTopicForm from "./ManageTopicForm.vue";
import type { Topic } from "../../types/Topic";
import type { Course } from "../../types/Course";

const courseStore = useCourseStore();
const topicStore = useTopicStore();

const showForm = ref(false);
const showTopicForm = ref(false); // Added ref for topic form
const selectedCourse = ref<Course | null>(null);
const createdCourseId = ref<string | null>(null); // Added ref for created course ID
const successMessage = ref<string>("");

// const getCourseTopics = (course: Course) => {
//   return course.topics.map((id) => topicStore.topics.find((t) => t._id === id));
// };
const getCourseTopics = (course: Course) => {
  return [...new Set(course.topics.map((id) => topicStore.topics.find((t) => t._id === id)))];
};

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

  const index = courseStore.courses.findIndex(
    (c) => c._id === updatedCourse._id
  );

  if (index !== -1) {
    // When updating an existing course
    courseStore.courses[index] = updatedCourse;
    showForm.value = false;
    selectedCourse.value = null;
    showTopicForm.value = false;
  } else {
    // When a new course is created
    courseStore.courses.push(updatedCourse);
    showForm.value = false;
    selectedCourse.value = null;
    createdCourseId.value = updatedCourse._id;

    // **Automatically show topic form when creating a new course**
    showTopicForm.value = true;
  }
};

const handleTopicCreated = (newTopic: Topic) => {
  // Check if the topic already exists to prevent duplicates
  if (!topicStore.topics.some((t) => t._id === newTopic._id)) {
    topicStore.topics.push(newTopic);
  }

  const courseId =
    typeof newTopic.course === "string" ? newTopic.course : newTopic.course._id;

  // Find the course from the course store
  const course = courseStore.courses.find((c) => c._id === courseId);
  
  if (course && Array.isArray(course.topics)) {
    // Add the new topic to the course's topic list if it doesn't already exist
    if (!course.topics.includes(newTopic._id)) {
      course.topics.push(newTopic._id);
    }
  }

  // Update the selected course to reflect the new topic
  if (selectedCourse.value && selectedCourse.value._id === courseId) {
    selectedCourse.value = {
      ...selectedCourse.value,
      topics: [...selectedCourse.value.topics, newTopic._id],
    };
  }

  showTopicForm.value = false;
};
// Open edit mode
const editCourse = (course: any) => {
  selectedCourse.value = { ...course };
  showForm.value = true;

  showTopicForm.value = false;
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

const closeTopicForm = () => {
  showTopicForm.value = false;
};
</script>

<template>
  <div class="p-6 shadow rounded-md">
    <h2 class="text-2xl font-bold mb-4">Manage Courses</h2>
    <p v-if="successMessage" class="text-green-500 mt-4">
      {{ successMessage }}
    </p>
    <p>{{ showTopicForm }}</p>
    <button
      @click="showForm = true"
      class="bg-blue-500 text-white px-4 py-2 rounded mb-4"
    >
      ➕ Add New Course
    </button>

    <!-- Course Form -->
    <ManageCourseForm
      v-if="showForm"
      :course="selectedCourse"
      @close="closeForm"
      @courseUpdated="handleCourseUpdated"
      @successMessage="successMessage = $event"
      @update:showTopicForm="showTopicForm = $event" 
    />

    <!-- Topic Form -->
    <ManageTopicForm
      v-show="showTopicForm"
      :courseId="selectedCourse?._id || createdCourseId"
      @topic-updated="handleTopicCreated"
      @close="closeTopicForm"
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
              <li v-for="topic in getCourseTopics(course)" :key="topic?._id">
                {{ topic?.title || "Unknown Topic" }}
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
