<script setup lang="ts">
import { ref, watch, onMounted, type Ref, nextTick } from "vue";
import { useCourseStore } from "../../stores/courseStore";
import { useTopicStore } from "../../stores/topicStore";
import type { Course } from "../../types/Course";

// Emits and props
const emit = defineEmits(["close", "courseUpdated", "successMessage", "update:showTopicForm"]);
const props = defineProps<{ course?: Course | null }>();
const topicStore = useTopicStore();
const courseStore = useCourseStore();

// Form state
const title = ref("");
const description = ref("");
const teacher = ref("");
const scope = ref<string | number>("");
const semester = ref<string | number>("");
const learningObjectives = ref<string[]>([]);
const newLearningObjective = ref("");
const skills = ref<string[]>([]);
const newSkill = ref("");
const competencies = ref<string[]>([]);
const newCompetency = ref("");
const selectedTopics = ref<string[]>([]);
const successMessage = ref<string>("");
const errorMessage = ref("");
const isEditing = ref(false);
const showTopicForm = ref(false);
const createdCourseId = ref<string | null>(null);

// Fetch topics on mount
onMounted(async () => {
  await topicStore.fetchTopics();
});

// **Reset Form**
const resetForm = () => {
  title.value = "";
  description.value = "";
  teacher.value = "";
  scope.value = "";
  semester.value = "";
  learningObjectives.value = [];
  skills.value = [];
  competencies.value = [];
  selectedTopics.value = [];
  isEditing.value = false;
};

// **Watch for existing course (edit mode)**
watch(
  () => props.course,
  (newCourse) => {
    if (newCourse && newCourse._id) {
      isEditing.value = true;
      title.value = newCourse.title;
      description.value = newCourse.description;
      teacher.value = newCourse.teacher;
      scope.value = newCourse.scope ?? "";
      semester.value = newCourse.semester ?? "";
      learningObjectives.value = newCourse.learningObjectives || [];
      skills.value = newCourse.skills || [];
      competencies.value = newCourse.competencies || [];
      selectedTopics.value = Array.isArray(newCourse.topics)
        ? [...newCourse.topics]
        : [];
      nextTick(() => {
        showTopicForm.value = true;
      });
      emit('update:showTopicForm', true);
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

// **Helper to Add Items (Avoid Repetition)**
const addItem = (list: Ref<string[]>, newItem: Ref<string>) => {
  if (newItem.value.trim()) {
    list.value.push(newItem.value.trim());
    newItem.value = "";
  }
};

// **Form Sections (Reusing Logic)**
const formSections: {
  label: string;
  list: Ref<string[]>;
  model: Ref<string>;
}[] = [
  {
    label: "Learning Objectives",
    list: ref(learningObjectives),
    model: newLearningObjective,
  },
  { label: "Skills", list: ref(skills), model: newSkill },
  { label: "Competencies", list: ref(competencies), model: newCompetency },
];

// **Helper to Remove Items**
const removeItem = (list: Ref<string[]>, index: number) => {
  list.value.splice(index, 1);
};

// **Submit Course**
const buildCourseData = () => ({
  title: title.value,
  description: description.value,
  teacher: teacher.value,
  scope: String(scope.value),
  semester: String(semester.value),
  learningObjectives: learningObjectives.value,
  skills: skills.value,
  competencies: competencies.value,
  topics: selectedTopics.value,
});

const submitCourse = async () => {
  try {
    successMessage.value = "";
    errorMessage.value = "";

    const courseData = buildCourseData();

    let response;
    if (isEditing.value && props.course?._id) {
      response = await courseStore.updateCourse(props.course._id, courseData);
      successMessage.value = "✅ Course updated successfully!";
    } else {
      response = await courseStore.createCourse(courseData);
      successMessage.value = "✅ Course added successfully!";
      createdCourseId.value = response._id;

      emit("update:showTopicForm", true);
    }

    emit("courseUpdated", response);
    emit("successMessage", successMessage.value); // Emit the success message to parent
    resetForm();
  } catch (err: any) {
    console.error("❌ Error submitting course:", err);
    errorMessage.value =
      err.response?.data?.error || err.message || "Failed to submit course.";
  }
};

// **Close Form**
const closeForm = () => {
  resetForm();
  emit("close");
};
</script>

<template>
  <div class="p-6 bg-white shadow rounded-md">
    <h1 class="text-2xl font-bold mb-4">
      {{ isEditing ? "Edit Course" : "Add New Course" }}
    </h1>

    <form @submit.prevent="submitCourse" class="p-4 shadow-md rounded-md">
      <label class="block mb-2">Course Title:</label>
      <input
        v-model="title"
        type="text"
        class="border p-2 w-full mb-4"
        required
      />

      <label class="block mb-2">Description:</label>
      <textarea
        v-model="description"
        class="border p-2 w-full mb-4"
        required
      ></textarea>

      <label class="block mb-2">Teacher:</label>
      <input
        v-model="teacher"
        type="text"
        class="border p-2 w-full mb-4"
        required
      />

      <label class="block mb-2">Scope:</label>
      <input
        v-model="scope"
        type="text"
        class="border p-2 w-full mb-4"
        required
      />

      <label class="block mb-2">Semester:</label>
      <input
        v-model.number="semester"
        type="text"
        class="border p-2 w-full mb-4"
        required
      />

      <div v-if="isEditing">
        <label class="block mb-2">Topics for this course:</label>
        <ul class="mb-2">
          <li
            v-for="(topicId, index) in selectedTopics"
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
              @click="selectedTopics.splice(index, 1)"
            >
              ✖ Remove
            </button>
          </li>
        </ul>
        <button
          type="button"
          class="bg-blue-500 text-white px-2 py-1 rounded mb-4"
          @click="showTopicForm = true"
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
