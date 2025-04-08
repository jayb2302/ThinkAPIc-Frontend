<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import api from "../../services/api";
import { useCourse } from "../../stores/courseStore";
import type { Topic } from "../../types/Topic";

const emit = defineEmits(["close", "topicUpdated"]);

const props = defineProps<{ topic?: Topic | null; courseId?: string | null }>();
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

// const extractCourseId = (
//   course: string | { _id: string } | null
// ): string | null =>
//   course && typeof course === "object" ? course._id : course || null;

// Watch for existing topic (edit mode)
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

// ✅ Add key point
const addKeyPoint = () => {
  if (newKeyPoint.value.trim()) {
    keyPoints.value.push(newKeyPoint.value.trim());
    newKeyPoint.value = "";
  }
};

// ✅ Remove key point
const removeKeyPoint = (index: number) => {
  keyPoints.value.splice(index, 1);
};

// ✅ Add resource
const addResource = () => {
  if (newResource.value.title.trim() && newResource.value.link.trim()) {
    resources.value.push({ ...newResource.value });
    newResource.value = { title: "", link: "" };
  }
};

// ✅ Remove resource
const removeResource = (index: number) => {
  resources.value.splice(index, 1);
};

// ✅ Submit topic
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

    console.log("📤 Submitting Topic:", getTopicData());

    const savedTopic = await saveTopic();
    await courseStore.fetchCourses();
    handleApiResponse(savedTopic, getSuccessMessage());
  } catch (error) {
    handleError(error);
  }
};

// 🔹 Reset success & error messages
const resetMessages = () => {
  successMessage.value = "";
  errorMessage.value = "";
};

// 🔹 Make API request based on edit mode
const saveTopic = async (): Promise<Topic> => {
  const url = isEditing.value ? `/topics/${props.topic!._id}` : "/topics";
  const method = isEditing.value ? "put" : "post";
  const response = await api[method](url, getTopicData());
  return response.data;
};

// 🔹 Get the appropriate success message
const getSuccessMessage = () =>
  isEditing.value
    ? "✅ Topic updated successfully!"
    : "✅ Topic added successfully!";

// 🔹 Handle API errors
const handleError = (error: any) => {
  console.error("❌ Error submitting topic:", error);
  errorMessage.value =
    error.response?.data?.error || "Something went wrong. Please try again.";
};

// Close form
const closeForm = () => {
  resetForm();
  emit("close");
};
</script>

<template>
  <div class="p-6shadow rounded-md">
    <h1 class="text-2xl font-bold mb-4">
      {{ isEditing ? "Edit Topic" : "Add New Topic" }}
    </h1>

    <form @submit.prevent="submitTopic" class="p-4 shadow-md space-y-4 rounded-md">
      <FloatLabel variant="on">
        <InputText
          id="topic_title"
          v-model="title"
          required
          fluid
        />
        <label for="topic_title" class="block mb-2">Topic Title</label>
      </FloatLabel>

      <FloatLabel id="minmax-buttons" variant="on">
        <InputNumber
          v-model="week"
          inputId="minmax-buttons"
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
          id="topic_summary"
          v-model="summary"
          rows="5"
          cols="30"
          style="resize: none"
          required
          fluid
        />
        <label for="topic_summary">Summary</label>
      </FloatLabel>
      <FloatLabel class="w-full mb-4" variant="on">
        <Select
          v-model="selectedCourse"
          inputId="course_select"
          :options="courseStore.courses"
          optionLabel="title"
          optionValue="_id"
          class="w-full"

        />
        <label for="course_select">Select Course</label>
      </FloatLabel>

      <!-- Key Points -->
      <label class="block mb-2">Key Points</label>
      <div
        v-for="(point, index) in keyPoints"
        :key="index"
        class="flex items-center mb-2"
      >
        <span class="flex-grow">{{ point }}</span>
        <Button
          type="button"
          @click="removeKeyPoint(index)"
          severity="danger"
          icon="pi pi-times"
        />
      </div>

      <FloatLabel variant="on">
        <InputText id="key_point" v-model="newKeyPoint" fluid />
        <label for="key_point" class="block mb-2">Key Point</label>
      </FloatLabel>
      <Button
        type="button"
        @click="addKeyPoint"
        class="bg-blue-500 text-white px-2 py-1 rounded-md mb-4"
      >
        ➕ Add Key Point
      </Button>

      <!-- Resources -->
      <label class="block mb-2">Resources:</label>
      <div
        v-for="(resource, index) in resources"
        :key="index"
        class="flex items-center mb-2"
      >
        <span class="flex-grow"
          >{{ resource.title }} -
          <a :href="resource.link" target="_blank" class="text-blue-500">{{
            resource.link
          }}</a></span
        >
        <Button
          :icon="'pi pi-times'"
          type="button"
          @click="removeResource(index)"
          severity="danger"
        />
      </div>
      <FloatLabel variant="on">
        <InputText id="resource_title" v-model="newResource.title" fluid />
        <label for="resource_title" class="block mb-2">Resource Title</label>
      </FloatLabel>
      <FloatLabel variant="on">
        <InputText id="resource_link" v-model="newResource.link" fluid />
        <label for="resource_link" class="block mb-2">Resource Link</label>
      </FloatLabel>
      <Button
        type="button"
        @click="addResource"
        class="bg-blue-500 text-white px-2 py-1 rounded-md mb-4"
      >
        ➕ Add Resource
      </Button>
      <div class="button_group space-x-2">
        <Button type="submit" severity="success">
          {{ isEditing ? "Update Topic" : "Submit Topic" }}
        </Button>
        <Button type="button" @click="closeForm" severity="secondary">
          Cancel
        </Button>
      </div>

      <p v-if="successMessage" class="text-green-500 mt-4">
        {{ successMessage }}
      </p>
      <p v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</p>
    </form>
  </div>
</template>
