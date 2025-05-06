<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import api from "../../services/api";
import { useCourse } from "../../stores/courseStore";
import type { Topic } from "../../types/Topic";

const emit = defineEmits(["close", "topicUpdated", "update:visible"]);

const props = defineProps<{
  topic?: Topic | null;
  courseId?: string | null;
  visible: boolean;
}>();

const courseStore = useCourse();

const title = ref("");
const week = ref<number | null>(null);
const summary = ref("");
const selectedCourse = ref<string | null>(props.courseId || null);
const keyPoints = ref<string[]>([]);
const newKeyPoint = ref("");
const resources = ref<{ title: string; link: string }[]>([]);
const newResource = ref({ title: "", link: "" });
const successMessage = ref("");
const errorMessage = ref("");
const isEditing = ref(false);

// Fetch courses on mount
onMounted(async () => {
  await courseStore.fetchCourses();
});

// Reset form
const resetForm = () => {
  title.value = "";
  week.value = 1;
  summary.value = "";
  selectedCourse.value = courseStore.courses[0]?._id ?? null;
  keyPoints.value = [];
  newKeyPoint.value = "";
  resources.value = [];
  newResource.value = { title: "", link: "" };
  isEditing.value = false;
};

const setTopicFields = (topic: Topic) => {
  title.value = topic.title;
  week.value = topic.week;
  summary.value = topic.summary || "Topic Summary";
  keyPoints.value = topic.key_points || [];
  resources.value = topic.resources || [];
};

const ensureCoursesLoaded = async () => {
  if (!courseStore.courses.length) await courseStore.fetchCourses();
};

// Watch for topic changes & populate form when editing
watch(
  () => props.topic,
  async (newTopic) => {
    if (!newTopic) {
      // When there's no topic, reset the form and initialize courseId
      resetForm();
      isEditing.value = false;
      selectedCourse.value = props.courseId ?? null;
    } else {
      // When there's an existing topic (edit mode)
      isEditing.value = true;
      setTopicFields(newTopic);
      await ensureCoursesLoaded();
      selectedCourse.value = newTopic.course._id;
    }
  },
  { immediate: true }
);

// Watch for courseId to ensure selectedCourse is set correctly when creating a new topic
watch(
  () => props.courseId,
  (newCourseId) => {
    if (newCourseId) {
      selectedCourse.value = newCourseId;
    }
  },
  { immediate: true }
);

// Add key point
const addKeyPoint = () => {
  if (newKeyPoint.value.trim()) {
    keyPoints.value.push(newKeyPoint.value.trim());
    newKeyPoint.value = "";
  }
};

// Remove key point
const removeKeyPoint = (index: number) => {
  keyPoints.value.splice(index, 1);
};

// Add resource
const addResource = () => {
  if (newResource.value.title.trim() && newResource.value.link.trim()) {
    resources.value.push({ ...newResource.value });
    newResource.value = { title: "", link: "" };
  }
};

// Remove resource
const removeResource = (index: number) => {
  resources.value.splice(index, 1);
};

// Key Point Editing State
const editingKeyPointIndex = ref<number | null>(null);

const isEditingKeyPoint = (index: number) => {
  return editingKeyPointIndex.value === index;
};

const toggleEditingKeyPoint = (index: number) => {
  if (isEditingKeyPoint(index)) {
    editingKeyPointIndex.value = null; // Stop editing
  } else {
    editingKeyPointIndex.value = index; // Start editing
  }
};

// Resource Editing State
const editingResourceIndex = ref<number | null>(null);

const isEditingResource = (index: number) => {
  return editingResourceIndex.value === index;
};

const toggleEditingResource = (index: number) => {
  if (isEditingResource(index)) {
    editingResourceIndex.value = null; // Stop editing
  } else {
    editingResourceIndex.value = index; // Start editing
  }
};

// Get Button State for editing
const getButtonState = (index: number, isResource: boolean = false) => {
  const isEditing = isResource ? isEditingResource(index) : isEditingKeyPoint(index);
  return {
    severity: isEditing ? "success" : "info",
    icon: isEditing ? "pi pi-check" : "pi pi-pencil",
  };
};

// Submit topic
const validateForm = (): boolean => {
  const isInvalid = [
    !title.value,
    week.value === null || isNaN(Number(week.value)),
    !summary.value,
    !selectedCourse.value,
  ].some(Boolean);

  if (isInvalid) {
    errorMessage.value = "All fields are required.";
    return false;
  }

  return true;
};

const getTopicData = () => ({
  title: title.value,
  week: week.value,
  summary: summary.value,
  course: selectedCourse.value,
  key_points: keyPoints.value,
  resources: resources.value,
});

const handleApiResponse = (newTopic: Topic, message: string) => {
  successMessage.value = message;
  emit("topicUpdated", newTopic);
  resetForm();
};

const submitTopic = async () => {
  try {
    resetMessages();
    if (!validateForm()) return;
    //console.log("📤 Submitting Topic:", getTopicData());

    const savedTopic = await saveTopic();
    await courseStore.fetchCourses();
    handleApiResponse(savedTopic, getSuccessMessage());
  } catch (error) {
    handleError(error);
  }
};

// Reset success & error messages
const resetMessages = () => {
  successMessage.value = "";
  errorMessage.value = "";
};

// Make API request based on edit mode
const saveTopic = async (): Promise<Topic> => {
  const url = isEditing.value ? `/topics/${props.topic!._id}` : "/topics";
  const method = isEditing.value ? "put" : "post";
  const response = await api[method](url, getTopicData());
  return response.data;
};

// Get the appropriate success message
const getSuccessMessage = () =>
  isEditing.value
    ? "✅ Topic updated successfully!"
    : "✅ Topic added successfully!";

// Handle API errors
const handleError = (error: any) => {
  //console.error("❌ Error submitting topic:", error);
  errorMessage.value =
    error.response?.data?.error || "Something went wrong. Please try again.";
};

// Close form
const closeForm = () => {
  resetForm();
  emit("update:visible", false);
};
</script>

<template>
  <Dialog
    v-model:visible="props.visible"
    @update:visible="(val) => emit('update:visible', val)"
    modal
    class="px-4 overflow-auto"
    :pt="{
      root: { class: '!border-0 !bg-transparent' },
      mask: { class: 'backdrop-blur-sm' },
    }"
  >
    <template #container="{ closeCallback }">
      <div
        class="flex flex-col p-6 gap-6 rounded-2xl"
        style="
          background-image: radial-gradient(
            circle at left top,
            var(--p-primary-400),
            var(--p-primary-700)
          );
        "
      >
        <h1 class="text-2xl font-bold text-primary-100 ">
          <i class="pi pi-thumbtack text-4xl "> </i>
          {{ isEditing ? "Edit Topic" : "Add New Topic" }}
        </h1>

        <form
          @submit.prevent="submitTopic"
          class="p-2 shadow-md space-y-4 rounded-md"
        >
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
              optionValue="_id"
              fluid
            />
          </FloatLabel>

          <!-- Key Points -->
          <label class="block mb-2 font-bold">Key Points</label>
          <div
            v-for="(point, index) in keyPoints"
            :key="index"
            class="flex items-center p-2 gap-2  bg-gray-100 dark:bg-gray-950 rounded-md"
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

          <div class="flex gap-2">
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
              label="Add Key Point"
            />
          </div>

          <!-- Resources -->
          <label class="block font-bold mb-2">Resources</label>
          <div
            v-for="(resource, index) in resources"
            :key="index"
            class="flex items-center  p-2 gap-2  bg-gray-100 dark:bg-gray-950 rounded-md"
          >
            <span v-if="!isEditingResource(index)" class="flex-grow">
              {{ resource.title }} -
              <a :href="resource.link" target="_blank" class="text-blue-500">{{
                resource.link
              }}</a>
            </span>
            <div v-else class="flex w-full gap-2">
              <InputText
                v-model="resources[index].title"
                label="Resource Title"
                class="flex-1"
                fluid
              />
             
              <IconField class="flex-grow">
                <InputIcon icon="pi pi-link " class="pi pi-link" />
                <InputText v-model="resources[index].link" class="" label="Link" fluid />
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

          <div class="resources flex w-full space-x-2">
            <FloatLabel variant="on" class="w-1/3">
              <InputText
                v-model="newResource.title"
                label="Resource Title"
                fluid
              />
              <label for="resource_title" class="block mb-2">Title</label>
            </FloatLabel>
            <FloatLabel variant="on" class="flex-grow">
              <IconField class="">
                <InputIcon icon="pi pi-link " class="pi pi-link" />
                <InputText v-model="newResource.link" label="Link" fluid />
              </IconField>
              <label for="resource_link" class="block mb-2">Link</label>
            </FloatLabel>
          <Button
            type="button"
            @click="addResource"
            label="Add Resource"
            class="min-w-32"
            icon="pi pi-plus"
          />
          </div>

          <div class="button-group flex justify-end space-x-2">
            <Button
              :label="isEditing ? 'Update Topic' : 'Submit Topic'"
              icon="pi pi-check"
              type="submit"
              severity="success"
            />
            <Button
              type="button"
              label="Cancel"
              severity="secondary"
              icon="pi pi-times"
              @click="
                closeCallback;
                closeForm();
              "
            />
          </div>

          <p v-if="successMessage" class="text-green-500 mt-4">
            {{ successMessage }}
          </p>
          <p v-if="errorMessage" class="text-red-500 mt-4">
            {{ errorMessage }}
          </p>
        </form>
      </div>
    </template>
  </Dialog>
</template>
