<script setup lang="ts">
import { ref, watch, onMounted, type Ref, nextTick } from "vue";
import { storeToRefs } from "pinia";
import { useCourseStore } from "../../stores/courseStore";
import { useTopicStore } from "../../stores/topicStore";
import { getAdminUsers } from "../../services/userService";
import type { Course } from "../../types/Course";
import type { AdminUser } from "../../types/User";
import { useToast } from "primevue/usetoast";

const courseStore = useCourseStore();
const topicStore = useTopicStore();

const { draftCourse, successMessage, isEditing, showTopicForm } =
  storeToRefs(courseStore);
const { resetCourseDraft, submitDraftCourse } = courseStore;
const { topics } = storeToRefs(topicStore);

const toast = useToast();

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
    inputLabel: "New Objective",
  },
  {
    label: "Skills",
    list: () => ref(draftCourse.value.skills),
    model: newSkill,
    inputLabel: "New Skill",
  },
  {
    label: "Competencies",
    list: () => ref(draftCourse.value.competencies),
    model: newCompetency,
    inputLabel: "New Competency",
  },
];

// Helper functions for toggling editing state
const editingIndices = ref<Record<string, number | null>>({
  "Learning Objectives": null,
  Skills: null,
  Competencies: null,
});

const toggleEditingKeyPoint = (sectionLabel: string, index: number) => {
  editingIndices.value[sectionLabel] =
    editingIndices.value[sectionLabel] === index ? null : index;
};

const getButtonState = (sectionLabel: string, index: number) => {
  const isEditing = editingIndices.value[sectionLabel] === index;
  return {
    severity: isEditing ? "success" : "info",
    icon: isEditing ? "pi pi-check" : "pi pi-pencil",
  };
};

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

// Helper to Add Items
const addItem = (list: Ref<string[]>, newItem: Ref<string>) => {
  if (newItem.value.trim()) {
    list.value.push(newItem.value.trim());
    newItem.value = "";
  }
};

// Helper to Remove Items
const removeItem = (list: Ref<string[]>, index: number) => {
  list.value.splice(index, 1);
};

const handleSubmit = async () => {
  try {
    const response = await submitDraftCourse(isEditing.value);

    emit("courseUpdated", response);
    emit("successMessage", successMessage.value);
    emit("newCourseId", response._id);

    toast.add({
      severity: "success",
      summary: isEditing.value ? "Course Updated" : "Course Added",
      detail: successMessage.value || "Saved successfully",
      life: 3000,
    });

    resetCourseDraft();

    nextTick(() => {
      showTopicForm.value = true;
    });

    if (!isEditing.value) {
      emit("update:showTopicForm", true);
    }
  } catch (err) {
    console.error("❌ Failed to submit course:", err);
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "Failed to save course.",
      life: 3000,
    });
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
    style="max-height: none"
    class="w-full px-2 md:px-10 overflow-auto h-svh py-10"
    :pt="{
      root: { class: '!border-0 !bg-transparent' },
      mask: { class: 'backdrop-blur-sm' },
    }"
  >
    <template #container="{ closeCallback }">
      <div
        class="flex flex-col p-4 md:p-8 gap-4 rounded-2xl"
        style="
          background-image: radial-gradient(
            circle at center center,
            var(--p-primary-400),
            var(--p-primary-300)
          );
        "
      >
        <h1 class="text-3xl font-bold mb-4">
          <i class="pi pi-pencil"> </i>
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
            class="border w-full"
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
            class="mb-2 shadow p-2 h-50 overflow-auto bg-gray-50 divide-gray-300 divide-y rounded"
          >
            <li
              v-for="(topicId, index) in draftCourse.topics"
              :key="topicId"
              class="flex items-center justify-between bg-gray-100 mb-2 shadow p-2 rounded-md"
            >
              <span class="capitalize font-bold">
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
                @click="draftCourse.topics.splice(index, 1)"
              />
            </li>
          </ul>
          <Button
            type="button"
            label="Add Topic"
            icon="pi pi-plus"
            @click="emit('update:showTopicForm', true)"
          />
        </div>

        <!-- Reusable Inputs for Learning Objectives, Skills, and Competencies -->
        <div class v-for="section in formSections" :key="section.label">
          <label class="block font-bold mb-4">{{ section.label }}</label>
          <div
            class="mb-2 shadow p-2 bg-gray-50 divide-gray-300 divide-y rounded h-50 overflow-auto"
          >
            <div
              v-for="(item, index) in section.list().value"
              :key="index"
              class="bg-gray-100 flex mb-2 shadow rounded-md"
            >
              <div
                class="overflow-auto w-full shadow flex items-center scroll-smooth rounded-md p-2"
              >
                <template v-if="editingIndices[section.label] === index">
                  <InputText
                    v-model="section.list().value[index]"
                    class="flex-grow p-inputtext-sm mr-2"
                  />
                </template>
                <template v-else>
                  <span class="flex-grow capitalize font-bold w-full">{{
                    item
                  }}</span>
                </template>

                <Button
                  type="button"
                  @click="toggleEditingKeyPoint(section.label, index)"
                  :severity="getButtonState(section.label, index).severity"
                  :icon="getButtonState(section.label, index).icon"
                />
                <Button
                  type="button"
                  icon="pi pi-times"
                  severity="danger"
                  @click="removeItem(section.list(), index)"
                />
              </div>
            </div>
          </div>
          <div class="form-section flex gap-2">
            <FloatLabel variant="on" class="flex-grow">
              <InputText
                :id="'new_' + section.label"
                v-model="section.model.value"
                type="text"
                class="border p-2 w-full"
              />
              <label :for="'new_' + section.label">{{
                section.inputLabel
              }}</label>
            </FloatLabel>

            <Button
              type="button"
              icon="pi pi-arrow-up"
              label="Add"
              @click="addItem(section.list(), section.model)"
            />
          </div>
        </div>

        <div class="flex items-center gap-4">
          <Button
            label="Cancel"
            icon="pi pi-times"
            @click="
              closeCallback;
              closeForm();
            "
            text
            class="!p-2 w-full !text-gray-600 !border !border-red-600/30 hover:!bg-red-700/10 hover:!text-gray-50"
          />
          <Button
            :label="isEditing ? 'Update' : 'Submit'"
            icon="pi pi-check"
            @click="handleSubmit"
            text
            class="!p-2 w-full !text-gray-600 !border !border-green-600/30 hover:!bg-green-700/10 hover:!text-gray-50"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>
