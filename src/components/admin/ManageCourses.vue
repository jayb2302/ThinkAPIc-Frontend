<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useCourse } from "../../stores/courseStore";
import { useTopicStore } from "../../stores/topicStore";
import ManageCourseForm from "./ManageCourseForm.vue";
import ManageTopicForm from "./ManageTopicForm.vue";
import type { Topic } from "../../types/Topic";
import type { Course } from "../../types/Course";
import { getAdminUsers } from "../../services/userService";
import type { AdminUser } from "../../types/User";

const confirm = useConfirm();
const toast = useToast();

const courseStore = useCourse();
const topicStore = useTopicStore();

const showForm = ref(false);
const showTopicForm = ref(false); // Added ref for topic form
const selectedCourse = ref<Course | null>(null);
const createdCourseId = ref<string | null>(null); // Added ref for created course ID
const successMessage = ref<string>("");
const adminUsers = ref<AdminUser[]>([]); // Added ref for storing admin users

// const getCourseTopics = (course: Course) => {
//   return course.topics.map((id) => topicStore.topics.find((t) => t._id === id));
// };
const getCourseTopics = (course: Course) => {
  return [
    ...new Set(
      course.topics.map((id) => topicStore.topics.find((t) => t._id === id))
    ),
  ];
};

// Fetch courses on mount
onMounted(async () => {
  await courseStore.fetchCourses();
  await topicStore.fetchTopics();
  try {
    adminUsers.value = await getAdminUsers();
  } catch (err) {
    console.error("Failed to load admin users:", err);
  }
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
const deleteCourse = async (event: MouseEvent, courseId: string) => {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: "Are you sure you want to delete this course?",
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Yes",
    rejectLabel: "No",
    accept: async () => {
      await courseStore.deleteCourse(courseId);
      await courseStore.fetchCourses();
      toast.add({
        severity: "success",
        summary: "Deleted",
        detail: "Course deleted",
        life: 3000,
      });
    },
    reject: () => {
      toast.add({
        severity: "info",
        summary: "Cancelled",
        detail: "Deletion cancelled",
        life: 2500,
      });
    },
  });
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
  <div class="p-6 shadow rounded-md dark:bg-gray-800">
    <h2 class="text-2xl font-bold mb-4">Manage Courses</h2>
    <p v-if="successMessage" class="text-green-500 mt-4">
      {{ successMessage }}
    </p>
    <Button @click="showForm = true"> ➕ Add New Course </Button>

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
      :courseId="selectedCourse?.['_id'] || null"
      @topic-updated="handleTopicCreated"
      @close="closeTopicForm"
    />
    <div class="rounded-lg overflow-hidden shadow border border-gray-200">
      <DataTable :value="courseStore.courses" tableStyle="min-width: 50rem">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Courses</h2>
            <Button
              icon="pi pi-refresh"
              rounded
              raised
              @click="courseStore.fetchCourses()"
            />
          </div>
        </template>

        <!-- Title -->
        <Column field="title" header="Title" />

        <!-- Teacher -->
        <Column header="Teacher">
          <template #body="slotProps">
            {{
              adminUsers.find((admin) => admin._id === slotProps.data.teacher)
                ?.username || "Unknown"
            }}
          </template>
        </Column>

        <!-- Topics -->
        <Column header="Topics">
          <template #body="slotProps">
            <ul class="list-disc ml-4">
              <li
                v-for="topic in getCourseTopics(slotProps.data)"
                :key="topic?._id"
              >
                {{ topic?.title || "Unknown Topic" }}
              </li>
            </ul>
          </template>
        </Column>

        <!-- Actions -->
        <Column header="Actions" class="space-x-2">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              severity="info"
              fluid
              @click="editCourse(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              severity="danger"
              fluid
              @click="deleteCourse($event, slotProps.data._id)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
    <Toast />
    <ConfirmPopup />
  </div>
</template>
