<script setup lang="ts">
import { ref, watch, onMounted, type Ref, nextTick } from "vue";
import { useCourse } from "../../stores/courseStore";
import { useTopicStore } from "../../stores/topicStore";
import { getAdminUsers } from "../../services/userService";
import type { Course } from "../../types/Course";
import type { AdminUser } from "../../types/User";

const { submitCourse } = useCourse();
const topicStore = useTopicStore();

// Emits and props
const emit = defineEmits([
  "close",
  "courseUpdated",
  "successMessage",
  "update:showTopicForm",
]);
const props = defineProps<{ course?: Course | null }>();

// Form state
const newCourse = ref({
 
  title: "",
  description: "",
  teacher: "",
  scope: "",
  semester: "",
  learningObjectives: [] as string[],
  skills: [] as string[],
  competencies: [] as string[],
  topics: [] as string[],
});

const successMessage = ref<string>("");
const errorMessage = ref("");

const isEditing = ref(false);
const showTopicForm = ref(false);
const selectedCourse = ref<string | null>(null);
const newLearningObjective = ref("");
const newSkill = ref("");
const newCompetency = ref("");
const adminUsers = ref<AdminUser[]>([]);

// Fetch topics and admin users on mount
onMounted(async () => {
  await topicStore.fetchTopics();
  try {
    adminUsers.value = await getAdminUsers();
  } catch (err) {
    console.error("Failed to load admin users:", err);
  }
});

// **Reset Form**
const resetForm = () => {
  newCourse.value = {
    ...newCourse.value,
  };
  isEditing.value = false;
};

// **Watch for existing course (edit mode)**
watch(
  () => props.course,
  (newCourseData) => {
    if (newCourseData && newCourseData._id) {
      isEditing.value = true;
      // Populate form with the existing course data
      newCourse.value = {
        
        title: newCourseData.title,
        description: newCourseData.description,
        teacher: newCourseData.teacher,
        scope: newCourseData.scope ?? "",
        semester: newCourseData.semester ?? "",
        learningObjectives: newCourseData.learningObjectives || [],
        skills: newCourseData.skills || [],
        competencies: newCourseData.competencies || [],
        topics: Array.isArray(newCourseData.topics) ? [...newCourseData.topics] : [],
      };

      
    } else {
      // Reset form if no course is selected
      resetForm();
    }
  },
  { immediate: true } // Automatically trigger the watch logic on mount
);
// **Helper to Add Items (Avoid Repetition)**
const addItem = (list: Ref<string[]>, newItem: Ref<string>) => {
  if (newItem.value.trim()) {
    list.value.push(newItem.value.trim());
    newItem.value = "";
  }
};

// **Form Sections (Reusing Logic)**
const formSections = [
  { label: "Learning Objectives", list: ref(newCourse.value.learningObjectives), model: newLearningObjective },
  { label: "Skills", list: ref(newCourse.value.skills), model: newSkill },
  { label: "Competencies", list: ref(newCourse.value.competencies), model: newCompetency },
];

// **Helper to Remove Items**
const removeItem = (list: Ref<string[]>, index: number) => {
  list.value.splice(index, 1);
};

// **Submit Course**
const handleSubmit = async () => {
  try {
    successMessage.value = "";
    errorMessage.value = "";

    const response = await submitCourse(
      newCourse.value,
      isEditing.value,
      props.course ?? null
    );

    successMessage.value = "✅ Course submitted successfully!";
    emit("courseUpdated", response);
    emit("successMessage", successMessage.value);

    selectedCourse.value = response._id;
    nextTick(() => {
        showTopicForm.value = true;
      });

      emit("update:showTopicForm", true);
  } catch (err) {
    errorMessage.value = "❌ Failed to submit course";
  }
};

// **Close Form**
const closeForm = () => {
  resetForm();
  emit("close");
};
</script>

<template>
  <div class="p-6 shadow rounded-md">
    <h1 class="text-2xl font-bold mb-4">
      {{ isEditing ? "Edit Course" : "Add New Course" }}
    </h1>

    <form @submit.prevent="handleSubmit" class="p-4 shadow-md rounded-md">
      <label class="block mb-2">Course Title:</label>
      <input
        v-model="newCourse.title"
        type="text"
        class="border p-2 w-full mb-4"
        required
      />

      <label class="block mb-2">Description:</label>
      <textarea
        v-model="newCourse.description"
        class="border p-2 w-full mb-4"
        required
      ></textarea>

      <label class="block mb-2">Teacher:</label>
      <select
        v-model="newCourse.teacher"
        class="border p-2 w-full mb-4"
        required
      >
        <option value="" disabled>Select a teacher</option>
        <option
          v-for="admin in adminUsers"
          :key="admin._id"
          :value="admin._id"
        >
          {{ admin.username }}
        </option>
      </select>

      <label class="block mb-2">Scope:</label>
      <input
        v-model="newCourse.scope"
        type="text"
        class="border p-2 w-full mb-4"
        required
      />

      <label class="block mb-2">Semester:</label>
      <input
        v-model.number="newCourse.semester"
        type="text"
        class="border p-2 w-full mb-4"
        required
      />

      <div v-if="isEditing">
        <label class="block mb-2">Topics for this course:</label>
        <ul class="mb-2">
          <li
            v-for="(topicId, index) in newCourse.topics"
            :key="topicId"
            class="flex items-center justify-between"
          >
            <span>
              {{
                topicStore.topics.find((t) => t._id === topicId)?.title ||
                "Unknown Topic"
              }}
            </span>
            <button
              type="button"
              class="text-red-500 text-sm"
              @click="newCourse.topics.splice(index, 1)"
            >
              ✖ Remove
            </button>
          </li>
        </ul>
        <button
          type="button"
          class="bg-blue-500 text-white px-2 py-1 rounded mb-4"
          @click="emit('update:showTopicForm', true)"
        >
          ➕ Add Topic
        </button>
      </div>

      <!-- **Reusable Inputs for Learning Objectives, Skills, Competencies** -->
      <div v-for="section in formSections" :key="section.label">
        <label class="block mb-2">{{ section.label }}:</label>

        <div
          v-for="(item, index) in section.list.value"
          :key="index"
          class="flex items-center mb-2"
        >
          <span class="flex-grow">{{ item }}</span>
          <button
            type="button"
            @click="removeItem(section.list, index)"
            class="text-red-500 ml-2"
          >
            ❌
          </button>
        </div>

        <input
          v-model="section.model.value"
          type="text"
          class="border p-2 w-full mb-2"
          placeholder="Add a value"
        />

        <button
          type="button"
          @click="addItem(section.list, section.model)"
          class="bg-blue-500 text-white px-2 py-1 rounded-md mb-4"
        >
          ➕ Add {{ section.label }}
        </button>
      </div>

      <button
        type="submit"
        class="bg-green-500 text-white px-4 py-2 rounded-md"
      >
        {{ isEditing ? "Update Course" : "Submit Course" }}
      </button>
      <button
        type="button"
        @click="closeForm"
        class="ml-2 bg-gray-500 text-white px-4 py-2 rounded-md"
      >
        Cancel
      </button>

      <p v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</p>
    </form>
  </div>
</template>
