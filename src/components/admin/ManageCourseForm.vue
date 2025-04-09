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
  "newCourseId",
  "update:showTopicForm",
]);
const props = defineProps<{
  course?: Course | null;
  courseId?: string | null;
}>();

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
const selectedCourse = ref<string | null>(props.courseId || null);
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
watch(selectedCourse, (newId) => {
  if (newId) {
    //console.log("✅ Selected course ID for topic form:", newId);
  }
});

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
        topics: Array.isArray(newCourseData.topics)
          ? [...newCourseData.topics]
          : [],
      };
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
const formSections = [
  {
    label: "Learning Objectives",
    list: ref(newCourse.value.learningObjectives),
    model: newLearningObjective,
  },
  { label: "Skills", list: ref(newCourse.value.skills), model: newSkill },
  {
    label: "Competencies",
    list: ref(newCourse.value.competencies),
    model: newCompetency,
  },
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
    emit("newCourseId", response._id);

    selectedCourse.value = response._id;
    nextTick(() => {
      showTopicForm.value = true;
    });

    if (!isEditing.value) {
      emit("update:showTopicForm", true);
    }
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

    <form
      @submit.prevent="handleSubmit"
      class="p-4 shadow-md space-y-2 rounded-md"
    >
      <FloatLabel variant="on">
        <InputText
          v-model="newCourse.title"
          type="text"
          required
          id="course_title"
          fluid
        />
        <label for="course_title" class="">Course Title:</label>
      </FloatLabel>

      <FloatLabel variant="on">
        <Textarea
          id="course_description"
          class="border w-full mb-4"
          v-model="newCourse.description"
          rows="5"
          cols="30"
          style="resize: none"
          required
          fluid
        />
        <label for="course_description" class="block mb-2">Description</label>
      </FloatLabel>

      <FloatLabel class="w-full" variant="on">
        <Select
          v-model="newCourse.teacher"
          inputId="teacher_label"
          :options="adminUsers"
          optionLabel="username"
          optionValue="_id"
          class="w-full"
          required
          fluid
        />
        <label for="teacher_label">Teacher</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputText
          v-model="newCourse.scope"
          type="text"
          required
          id="course_scope"
          fluid
        />
        <label for="course_scope" class="">Scope</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputText
          v-model="newCourse.semester"
          type="text"
          required
          id="course_semester"
          fluid
        />
        <label for="course_semester" class="">Semester</label>
      </FloatLabel>

      <div v-if="isEditing">
        <label class="block mb-2 font-bold">Topics for this course:</label>
        <ul class="mb-2 shadow p-2 bg-gray-50 divide-gray-300 divide-y rounded">
          <li
            v-for="(topicId, index) in newCourse.topics"
            :key="topicId"
            class="flex items-center justify-between"
          >
            <span>
              -
              {{
                topicStore.topics.find((t) => t._id === topicId)?.title ||
                "Unknown Topic"
              }}
            </span>
            <Button
              type="button"
              severity="danger"
              icon="pi pi-times"
              class="text-red-500 text-sm"
              @click="newCourse.topics.splice(index, 1)"
            />
          </li>
        </ul>
        <Button
          type="button"
          label="Add Topic"
          icon="pi pi-plus"
          class="bg-blue-500 text-white px-2 py-1 rounded mb-4"
          @click="emit('update:showTopicForm', true)"
        />
      </div>

      <!-- **Reusable Inputs for Learning Objectives, Skills, Competencies** -->
      <div v-for="section in formSections" :key="section.label">
        <label class="block font-bold mb-2">{{ section.label }}</label>

        <div
          v-for="(item, index) in section.list.value"
          :key="index"
          class="flex items-center mb-2 shadow p-2 bg-gray-50 rounded"
        >
          <span class="flex-grow">{{ item }}</span>
          <Button
            type="button"
            icon="pi pi-times"
            severity="danger"
            @click="removeItem(section.list, index)"
            class="text-red-500 ml-2"
          />
        </div>
        <div class="form-section flex gap-2 ">
          <FloatLabel variant="on" class="flex-grow">
            <InputText
              id="new_{{ section.label }}"
              v-model="section.model.value"
              type="text"
              class="border p-2 w-full"
            />
            <label for="new_{{ section.label }}">{{ section.label }}</label>
          </FloatLabel>

          <Button
            type="button"
            icon="pi pi-arrow-up"
            :label="section.label"
            @click="addItem(section.list, section.model)"
            class="bg-blue-500 text-white px-2 py-1 rounded-md "
            
          />
        </div>
      </div>
      <div class="button_group flex justify-end mt-8">
        <Button
          :label="isEditing ? 'Update Course' : 'Submit Course'"
          type="submit"
          severity="success"
          icon="pi pi-check"
        />
        <Button
          type="button"
          label="Cancel"
          icon="pi pi-times"
          @click="closeForm"
          class="ml-2 bg-gray-500 text-white px-4 py-2 rounded-md"
        />
      </div>

      <p v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</p>
    </form>
  </div>
</template>
