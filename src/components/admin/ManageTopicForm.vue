<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useToast } from "primevue/usetoast";

// 🏪 Stores
import { useCourseStore } from "../../stores/courseStore";
import { useTopicStore } from "../../stores/topicStore";

// 🧾 Types
import type { Course } from "../../types/Course";
import type { Topic } from "../../types/Topic";

// 🧰 Helpers
import {
  resetMessages,
  validateForm,
  getSuccessMessage,
  handleError,
  buildTopicInput,
} from "../../helpers/topicHelpers";

// 🚨 Emits & Props
const emit = defineEmits(["close", "topicUpdated", "update:visible"]);
const props = defineProps<{
  topic?: Topic | null;
  course?: Course | null;
  visible: boolean;
}>();

// 🏬 Store setup
const courseStore = useCourseStore();
const { fetchCourses } = courseStore;

const topicStore = useTopicStore();
const { saveTopic } = topicStore;
const toast = useToast();

// 🧠 State
const title = ref("");
const week = ref<number | null>(null);
const summary = ref("");
const selectedCourse = ref<Course | null>(props.course || null);
const keyPoints = ref<string[]>([]);
const newKeyPoint = ref("");
const resources = ref<{ title: string; link: string }[]>([]);
const newResource = ref({ title: "", link: "" });
const successMessage = ref("");
const errorMessage = ref("");
const isEditing = ref(false);
const editingKeyPointIndex = ref<number | null>(null);
const editingResourceIndex = ref<number | null>(null);

// 🧩 Form Helpers
const resetForm = () => {
  title.value = "";
  week.value = 1;
  summary.value = "";
  selectedCourse.value = props.course ?? null;
  keyPoints.value = [];
  newKeyPoint.value = "";
  resources.value = [];
  newResource.value = { title: "", link: "" };
  isEditing.value = false;
};

const ensureCoursesLoaded = async () => {
  if (!courseStore.courses.length) await fetchCourses();
};

// 🧩 Watchers
watch(
  () => props.topic,
  async (newTopic) => {
    if (!newTopic) {
      resetForm();
      isEditing.value = false;
      selectedCourse.value = props.course ?? null;
    } else {
      isEditing.value = true;
      setTopicFields(newTopic);
      await ensureCoursesLoaded();
      selectedCourse.value = newTopic.course;
    }
  },
  { immediate: true }
);

watch(
  () => props.course,
  async (newCourse) => {
    if (newCourse?._id) {
      await ensureCoursesLoaded();
      selectedCourse.value = newCourse;
    }
  },
  { immediate: true }
);

// 🧩 Set Topic Fields
const setTopicFields = (topic: Topic) => {
  title.value = topic.title;
  week.value = topic.week;
  summary.value = topic.summary || "Topic Summary";
  keyPoints.value = topic.key_points || [];
  resources.value = topic.resources || [];
};

// 🧩 Key Point Handlers
const addKeyPoint = () => {
  if (newKeyPoint.value.trim()) {
    keyPoints.value.push(newKeyPoint.value.trim());
    newKeyPoint.value = "";
  }
};

const removeKeyPoint = (index: number) => keyPoints.value.splice(index, 1);

const isEditingKeyPoint = (index: number) =>
  editingKeyPointIndex.value === index;

const toggleEditingKeyPoint = (index: number) => {
  editingKeyPointIndex.value = isEditingKeyPoint(index) ? null : index;
};

// 🧩 Resource Handlers
const addResource = () => {
  if (newResource.value.title.trim() && newResource.value.link.trim()) {
    resources.value.push({ ...newResource.value });
    newResource.value = { title: "", link: "" };
  }
};

const removeResource = (index: number) => resources.value.splice(index, 1);

const isEditingResource = (index: number) =>
  editingResourceIndex.value === index;

const toggleEditingResource = (index: number) => {
  editingResourceIndex.value = isEditingResource(index) ? null : index;
};

// 🧩 Button State Helper
const getButtonState = (index: number, isResource = false) => {
  const editing = isResource
    ? isEditingResource(index)
    : isEditingKeyPoint(index);
  return {
    severity: editing ? "success" : "info",
    icon: editing ? "pi pi-check" : "pi pi-pencil",
  };
};

// 🚀 Actions
const submitTopic = async () => {
  try {
    prepareSubmission();
    const topicId = getTopicId();
    const topicData = getTopicInput();
    const savedTopic = await saveTopic(topicData, topicId);
    await postSubmitActions(savedTopic);
  } catch (error) {
    handleFailure(error);
  }
};

const prepareSubmission = () => {
  resetMessages(successMessage, errorMessage);
  if (!isFormValid()) throw new Error("Form validation failed");
};

const getTopicId = () => (isEditing.value ? props.topic?._id : undefined);

const getTopicInput = () =>
  buildTopicInput({
    title: title.value,
    week: week.value,
    summary: summary.value,
    courseId: selectedCourse.value!._id,
    keyPoints: keyPoints.value,
    resources: resources.value,
  });

const postSubmitActions = async (savedTopic: Topic) => {
  await fetchCourses();
  handleSuccess(savedTopic);
};

const isFormValid = () => {
  return validateForm({
    title: title.value,
    week: week.value,
    summary: summary.value,
    course: selectedCourse.value,
  });
};

const handleSuccess = (savedTopic: Topic) => {
  const message = getSuccessMessage(isEditing.value);
  successMessage.value = message;
  emit("topicUpdated", savedTopic);
  resetForm();
  toast.add({
    severity: "success",
    summary: "Success",
    detail: message,
    life: 3000,
  });
};

const handleFailure = (error: unknown) => {
  handleError(error, errorMessage);
  toast.add({
    severity: "error",
    summary: "Error",
    detail: errorMessage.value,
    life: 3000,
  });
};

const closeForm = () => {
  resetForm();
  emit("update:visible", false);
};

onMounted(async () => {
  if (!courseStore.courses.length) {
    await courseStore.fetchCourses();
  }
  if (!selectedCourse.value && props.course) {
    selectedCourse.value = props.course;
  }
});
</script>

<template>
  <Dialog
    v-model:visible="props.visible"
    @update:visible="(val) => emit('update:visible', val)"
    modal
    style="max-height: none"
    class="w-full px-2 md:px-14 h-svh overflow-auto py-10"
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
            var(--p-primary-300),
            var(--p-primary-200)
          );
        "
      >
        <Toast />
        <h1 class="text-2xl font-bold">
          <i class="pi pi-thumbtack text-4xl"> </i>
          {{ isEditing ? "Edit Topic" : "Add New Topic" }}
        </h1>

        <form @submit.prevent="submitTopic" class="space-y-4 rounded-md">
          <!-- Course form fields -->
          <FloatLabel variant="on">
            <InputText v-model="title" label="Topic Title" fluid />
            <label for="topic_title" class="block mb-2">Topic Title</label>
          </FloatLabel>

          <FloatLabel variant="on">
            <InputNumber
              v-model="week"
              label="Week"
              mode="decimal"
              showButtons
              :min="1"
              :max="18"
              fluid
              :inputStyle="{ padding: '0.5rem' }"
            />
            <label for="minmax-buttons" class="block">Week</label>
          </FloatLabel>

          <FloatLabel variant="on">
            <Textarea
              v-model="summary"
              rows="5"
              label="Summary"
              required
              fluid
            />
            <label for="topic_summary">Summary</label>
          </FloatLabel>

          <FloatLabel variant="on" class="w-full mb-4">
            <Select
              v-model="selectedCourse"
              inputId="course_select"
              :options="courseStore.courses"
              optionLabel="title"
              placeholder="Select a Course"
              fluid
            />
          </FloatLabel>

          <!-- Key Points -->
          <label class="block mb-2 font-bold">Key Points</label>
          <div
            v-for="(point, index) in keyPoints"
            :key="index"
            class="flex items-center p-2 gap-2 bg-gray-100 dark:bg-gray-950 rounded-md"
          >
            <span v-if="!isEditingKeyPoint(index)" class="flex-grow">{{
              point
            }}</span>
            <InputText
              v-else
              v-model="keyPoints[index]"
              label="Key Point"
              class="flex-grow"
            />
            <Button
              type="button"
              @click="toggleEditingKeyPoint(index)"
              :severity="getButtonState(index).severity"
              :icon="getButtonState(index).icon"
            />
            <Button
              type="button"
              @click="removeKeyPoint(index)"
              severity="danger"
              icon="pi pi-times"
            />
          </div>

          <div class="flex flex-col md:flex-row gap-2">
            <FloatLabel variant="on" class="flex-grow">
              <InputText
                v-model="newKeyPoint"
                label="Key Point"
                fluid
                icon="pi pi-link"
              />
              <label for="key_point" class="block mb-2">New Key Point</label>
            </FloatLabel>
            <Button
              type="button"
              @click="addKeyPoint"
              class="min-w-32"
              icon="pi pi-plus"
              label="Add"
            />
          </div>

          <!-- Resources -->
          <label class="block font-bold mb-2">Resources</label>
          <div
            v-for="(resource, index) in resources"
            :key="index"
            class="flex flex-col md:flex-row items-center p-2 gap-2 bg-gray-100 dark:bg-gray-950 rounded-md"
          >
            <span v-if="!isEditingResource(index)" class="flex-grow">
              {{ resource.title }} -
              <a :href="resource.link" target="_blank" class="text-blue-500">{{
                resource.link
              }}</a>
            </span>
            <div v-else class=" w-full gap-2">
              <InputText
                v-model="resources[index].title"
                label="Resource Title"
                class="flex-1"
                fluid
              />

              <IconField class="flex-grow">
                <InputIcon icon="pi pi-link " class="pi pi-link" />
                <InputText
                  v-model="resources[index].link"
                  class=""
                  label="Link"
                  fluid
                />
              </IconField>
            </div>
            
              <Button
                type="button"
                @click="toggleEditingResource(index)"
                :severity="getButtonState(index, true).severity"
                :icon="getButtonState(index, true).icon"
              />
              <Button
                type="button"
                @click="removeResource(index)"
                severity="danger"
                icon="pi pi-times"
              />
            
          </div>

          <div
            class="resources flex flex-col md:flex-row w-full space-y-2 md:space-y-0 md:space-x-2"
          >
            <FloatLabel variant="on" class="w-full md:w-1/3">
              <InputText
                v-model="newResource.title"
                label="Resource Title"
                fluid
              />
              <label for="resource_title" class="block mb-2">Title</label>
            </FloatLabel>
            <FloatLabel variant="on" class="w-full md:w-2/3">
              <IconField class="">
                <InputIcon icon="pi pi-link " class="pi pi-link" />
                <InputText v-model="newResource.link" label="Link" fluid />
              </IconField>
              <label for="resource_link" class="block mb-2">Link</label>
            </FloatLabel>
            <Button
              type="button"
              @click="addResource"
              label="Add"
              class="min-w-32"
              icon="pi pi-plus"
            />
          </div>

          <div class="button-group flex items-center gap-4">
            <Button
              type="button"
              label="Cancel"
              icon="pi pi-times"
              @click="
                closeCallback;
                closeForm();
              "
              class="!p-2 w-full !text-gray-600 !bg-transparent !border !border-red-600/30 hover:!bg-red-700/10 hover:!text-gray-50"
            />
            <Button
              :label="isEditing ? 'Update' : 'Submit'"
              icon="pi pi-check"
              type="submit"
              class="!p-2 w-full !text-gray-600 !bg-transparent !border !border-green-600/30 hover:!bg-green-700/10 hover:!text-gray-50"
            />
          </div>
        </form>
      </div>
    </template>
  </Dialog>
</template>
