<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, onMounted, watch, nextTick, computed } from "vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { useCourseStore } from "../../stores/courseStore";
import { useTopicStore } from "../../stores/topicStore";
import ManageCourseForm from "./ManageCourseForm.vue";
import ManageTopicForm from "./ManageTopicForm.vue";
import type { Topic } from "../../types/Topic";
import type { Course } from "../../types/Course";
import type { AdminUser } from "../../types/User";
import { getAdminUsers } from "../../services/userService";

const confirm = useConfirm();
const toast = useToast();

const courseStore = useCourseStore();
const topicStore = useTopicStore();

const { selectedCourse, showForm } = storeToRefs(courseStore);
const {
  closeForm,
  handleCourseUpdated,
  setSelectedCourseId,
  editCourse,
  resetCourseDraft,
  fetchCourses,
} = courseStore;

const { handleTopicCreated } = topicStore;

const showTopicForm = ref(false);
const successMessage = ref<string>("");

const newCourse = () => {
  resetCourseDraft();
  setSelectedCourseId(null);
  showForm.value = true;
};

const selectedCourseForTopicForm = computed<Course | null>(() => {
  const id = courseStore.selectedCourseId;
  if (!id) return null;
  return courseStore.courses.find((c) => c._id === id) || null;
});

const adminUsers = ref<AdminUser[]>([]);

const topicPopoverRef = ref();
const selectedCourseTopics = ref<Topic[] | null>(null);

const getCourseTopics = (course: Course) => {
  return [
    ...new Set(
      course.topics.map((id) => topicStore.topics.find((t) => t._id === id))
    ),
  ];
};

const displayTopics = (event: Event, course: Course) => {
  topicPopoverRef.value?.hide();
  const topics = getCourseTopics(course).filter(Boolean) as Topic[];
  if (selectedCourseTopics.value === topics) {
    selectedCourseTopics.value = null;
  } else {
    selectedCourseTopics.value = topics;
    nextTick(() => {
      topicPopoverRef.value?.show(event);
    });
  }
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
    //console.log("✅ Topics updated, refreshing UI");
  }
);

// Delete course and refresh list
const deleteCourse = async (event: MouseEvent, course: Course) => {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: `Are you sure you want to delete the course "${course.title}"?`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Yes",
    rejectLabel: "No",
    accept: async () => {
      await courseStore.deleteCourse(course._id);
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

const closeTopicForm = () => {
  showTopicForm.value = false;
};
</script>

<template>
  <div class="p-2 shadow rounded-md">
    <h2 class="text-2xl font-bold mb-4">Manage Courses</h2>
    <Button
      @click="newCourse"
      label="New Course"
      icon="pi pi-plus"
      class="mb-4"
    />

    <!-- Course Form -->
    <ManageCourseForm
      :visible="showForm"
      @update:visible="showForm = $event"
      :course="selectedCourse"
      @close="closeForm"
      @courseUpdated="handleCourseUpdated"
      @successMessage="successMessage = $event"
      @update:showTopicForm="showTopicForm = $event"
      @newCourseId="(id) => setSelectedCourseId(id)"
    />

    <!-- Topic Form -->
    <ManageTopicForm
      v-model:visible="showTopicForm"
      :course="selectedCourseForTopicForm"
      @topic-updated="handleTopicCreated"
      @close="closeTopicForm"
    />
    <div class="rounded-md shadow border border-gray-200">
      <DataTable :value="courseStore.courses" paginator :rows="6" tableStyle="">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Courses</h2>
            <Button
              icon="pi pi-refresh"
              aria-label="Refresh"
              rounded
              outlined
              raised
              @click="fetchCourses()"
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
            <Button
              icon="pi pi-eye"
              text
              @click="displayTopics($event, slotProps.data)"
              aria-label="View Topics"
            />
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
              @click="(e) => deleteCourse(e, slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>
    <ConfirmPopup />
    <Popover ref="topicPopoverRef">
      <div v-if="selectedCourseTopics" class="p-2 w-72 max-h-48 overflow-auto">
        <ul
          class="text-sm list-disc px-4 py-2 text-gray-700 dark:text-gray-100"
        >
          <li
            v-for="topic in selectedCourseTopics"
            class="pl-2"
            :key="topic._id"
          >
            {{ topic.title || "Unknown Topic" }}
          </li>
        </ul>
      </div>
    </Popover>
  </div>
</template>
