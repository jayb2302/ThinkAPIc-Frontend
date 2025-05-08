<script setup lang="ts">
import { ref, watch, onMounted, type Ref, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useCourseStore } from "../../stores/courseStore";
import { useTopicStore } from "../../stores/topicStore";
import { getAdminUsers } from "../../services/userService";
import type { Course } from "../../types/Course";
import type { AdminUser } from "../../types/User";

const courseStore = useCourseStore();
const topicStore = useTopicStore();

const { draftCourse, successMessage, errorMessage, isEditing, showTopicForm } =
  storeToRefs(courseStore);
const { resetCourseDraft, submitDraftCourse } = courseStore;

const { topics } = storeToRefs(topicStore);

// Emits and props
const emit = defineEmits([
  "close",
  "courseUpdated",
  "successMessage",
  "newCourseId",
  "update:showTopicForm",
  "update:visible",
]);

const props = defineProps<{
  visible: boolean;
  course?: Course | null;
  courseId?: string | null;
}>();

const newLearningObjective = ref("");
const newSkill = ref("");
const newCompetency = ref("");
const adminUsers = ref<AdminUser[]>([]);

// **Form Sections (Reusing Logic)**
const formSections = [
  {
    label: "Learning Objectives",
    list: () => ref(draftCourse.value.learningObjectives),
    model: newLearningObjective,
  },
  {
    label: "Skills",
    list: () => ref(draftCourse.value.skills),
    model: newSkill,
  },
  {
    label: "Competencies",
    list: () => ref(draftCourse.value.competencies),
    model: newCompetency,
  },
];

// Fetch topics and admin users on mount
onMounted(async () => {
  await topicStore.fetchTopics();
  try {
    adminUsers.value = await getAdminUsers();
  } catch (err) {
    console.error("Failed to load admin users:", err);
  }
});

// **Watch for course prop changes (edit mode)**
watch(
  () => props.course,
  (newCourseData) => {
    if (newCourseData && newCourseData._id) {
      isEditing.value = true;
      draftCourse.value = {
        ...newCourseData,
        scope: String(newCourseData.scope),
        semester: String(newCourseData.semester),
      };
    } else {
      isEditing.value = false;
      resetCourseDraft();
    }
  },
  { immediate: true }
);

// **Watch for dialog visibility to reset state when opened**
watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      resetCourseDraft();
      isEditing.value = false;
      showTopicForm.value = false;
    }
  }
);

// **Helper to Add Items (Avoid Repetition)**
const addItem = (list: Ref<string[]>, newItem: Ref<string>) => {
  if (newItem.value.trim()) {
    list.value.push(newItem.value.trim());
    newItem.value = "";
  }
};

// **Helper to Remove Items**
const removeItem = (list: Ref<string[]>, index: number) => {
  list.value.splice(index, 1);
};

const handleSubmit = async () => {
  try {
    const response = await submitDraftCourse(isEditing.value);

    emit("courseUpdated", response);
    emit("successMessage", successMessage.value);
    emit("newCourseId", response._id);

    // Reset the form
    resetCourseDraft();
    
    nextTick(() => {
      showTopicForm.value = true;
    });

    if (!isEditing.value) {
      emit("update:showTopicForm", true);
    }
  } catch (err) {
    console.error("❌ Failed to submit course:", err);
  }
};

// **Close Form**
const closeForm = () => {
  resetCourseDraft();
  emit("close");
};
</script>

<template>
  <Dialog
    v-model:visible="props.visible"
    @update:visible="(value) => emit('update:visible', value)"
    modal
    class="w-full p-4 overflow-auto"
    :pt="{
      root: { class: '!border-0 !bg-transparent' },
      mask: { class: 'backdrop-blur-sm' },
    }"
  >
    <template #container="{ closeCallback }">
      <div
        class="flex flex-col px-8 py-8 gap-6 rounded-2xl"
        style="
          background-image: radial-gradient(
            circle at left top,
            var(--p-primary-400),
            var(--p-primary-700)
          );
        "
      >
        <img
          src="/ExplodingHead.svg"
          alt="Exploding Head"
          class="w-10 h-10 mx-auto"
        />
        <h1 class="text-2xl font-bold mb-4">
          {{ isEditing ? "Edit Course" : "Add New Course" }}
        </h1>

        <!-- Course form fields -->
        <FloatLabel variant="on">
          <InputText
            v-model="draftCourse.title"
            type="text"
            required
            id="course_title"
            fluid
          />
          <label for="course_title">Title</label>
        </FloatLabel>

        <FloatLabel variant="on">
          <Textarea
            id="course_description"
            class="border w-full mb-4"
            v-model="draftCourse.description"
            rows="5"
            cols="30"
            style="resize: none"
            required
            fluid
          />
          <label for="course_description">Description</label>
        </FloatLabel>

        <!-- Teacher selection -->
        <FloatLabel variant="on" class="w-full">
          <Select
            v-model="draftCourse.teacher"
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

        <!-- Course scope and semester -->
        <FloatLabel variant="on">
          <InputText
            v-model="draftCourse.scope"
            type="text"
            required
            id="course_scope"
            fluid
          />
          <label for="course_scope" class="">Scope</label>
        </FloatLabel>
        <FloatLabel variant="on">
          <InputText
            v-model="draftCourse.semester"
            type="text"
            required
            id="course_semester"
            fluid
          />
          <label for="course_semester" class="">Semester</label>
        </FloatLabel>

        <!-- Topics for the course (shown when editing) -->
        <div v-if="isEditing">
          <label class="block mb-2 font-bold">Topics for this course:</label>
          <ul
            class="mb-2 shadow p-2 bg-gray-50 divide-gray-300 divide-y rounded"
          >
            <li
              v-for="(topicId, index) in draftCourse.topics"
              :key="topicId"
              class="flex items-center justify-between"
            >
              <span>
                -
                {{
                  topics.find((t) => t._id === topicId)?.title ||
                  "Unknown Topic"
                }}
              </span>
              <Button
                type="button"
                severity="danger"
                icon="pi pi-times"
                class="text-red-500 text-sm"
                @click="draftCourse.topics.splice(index, 1)"
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

        <!-- Reusable Inputs for Learning Objectives, Skills, and Competencies -->
        <div v-for="section in formSections" :key="section.label">
          <label class="block font-bold mb-2">{{ section.label }}</label>

          <div
            v-for="(item, index) in section.list().value"
            :key="index"
            class="flex items-center mb-2 shadow p-2 rounded"
          >
            <span class="flex-grow">{{ item }}</span>

            <Button
              type="button"
              icon="pi pi-times"
              severity="danger"
              @click="removeItem(section.list(), index)"
              class="text-red-500 ml-2"
            />
          </div>
          <div class="form-section flex gap-2">
            <FloatLabel variant="on" class="flex-grow">
              <InputText
                :id="'new_' + section.label"
                v-model="section.model.value"
                type="text"
                class="border p-2 w-full"
              />
              <label :for="'new_' + section.label">{{ section.label }}</label>
            </FloatLabel>

            <Button
              type="button"
              icon="pi pi-arrow-up"
              :label="section.label"
              @click="addItem(section.list(), section.model)"
              class="bg-blue-500 text-white px-2 py-1 rounded-md"
            />
          </div>
        </div>

        <!-- Error message -->
        <p v-if="errorMessage" class="text-red-200 text-sm mt-2">
          {{ errorMessage }}
        </p>

        <div class="flex items-center gap-4">
          <Button
            label="Cancel"
            @click="
              closeCallback;
              closeForm();
            "
            text
            class="!p-2 w-full !text-slate-300 !border !border-white/30 hover:!bg-white/10"
          />
          <Button
            label="Submit Course"
            @click="handleSubmit"
            text
            class="!p-2 w-full !text-slate-300 !border !border-white/30 hover:!bg-white/10"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>
