<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import api from "../../services/api";
import { useCourseStore } from "../../stores/courseStore";
import type { Topic } from "../../types/Topic";

const emit = defineEmits(["close", "topicUpdated"]);

const props = defineProps<{ topic?: Topic | null; courseId?: string | null }>();
const courseStore = useCourseStore();
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
  <div class="p-6 bg-white shadow rounded-md">
    <h1 class="text-2xl font-bold mb-4">
      {{ isEditing ? "Edit Topic" : "Add New Topic" }}
    </h1>

    <form @submit.prevent="submitTopic" class="p-4 shadow-md rounded-md">
      <label class="block mb-2">Topic Title:</label>
      <input
        v-model="title"
        type="text"
        class="border p-2 w-full mb-4"
        required
      />

      <label class="block mb-2">Week:</label>
      <input
        v-model="week"
        type="number"
        class="border p-2 w-full mb-4"
        required
      />

      <label class="block mb-2">Summary:</label>
      <textarea
        v-model="summary"
        class="border p-2 w-full mb-4"
        required
      ></textarea>

      <label class="block mb-2">Select Course:</label>
      <select v-model="selectedCourse" class="border p-2 w-full mb-4">
        <option disabled value="">-- Choose a course --</option>
        <option
          v-for="course in courseStore.courses"
          :key="course._id"
          :value="course._id"
        >
          {{ course.title }}
        </option>
      </select>

      <!-- Key Points -->
      <label class="block mb-2">Key Points:</label>
      <div
        v-for="(point, index) in keyPoints"
        :key="index"
        class="flex items-center mb-2"
      >
        <span class="flex-grow">{{ point }}</span>
        <button
          type="button"
          @click="removeKeyPoint(index)"
          class="text-red-500 ml-2"
        >
          ❌
        </button>
      </div>
      <input
        v-model="newKeyPoint"
        type="text"
        class="border p-2 w-full mb-2"
        placeholder="Add a key point"
      />
      <button
        type="button"
        @click="addKeyPoint"
        class="bg-blue-500 text-white px-2 py-1 rounded-md mb-4"
      >
        ➕ Add Key Point
      </button>

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
        <button
          type="button"
          @click="removeResource(index)"
          class="text-red-500 ml-2"
        >
          ❌
        </button>
      </div>
      <input
        v-model="newResource.title"
        type="text"
        class="border p-2 w-full mb-2"
        placeholder="Resource title"
      />
      <input
        v-model="newResource.link"
        type="text"
        class="border p-2 w-full mb-2"
        placeholder="Resource link"
      />
      <button
        type="button"
        @click="addResource"
        class="bg-blue-500 text-white px-2 py-1 rounded-md mb-4"
      >
        ➕ Add Resource
      </button>

      <button
        type="submit"
        class="bg-green-500 text-white px-4 py-2 rounded-md"
      >
        {{ isEditing ? "Update Topic" : "Submit Topic" }}
      </button>
      <button
        type="button"
        @click="closeForm"
        class="ml-2 bg-gray-500 text-white px-4 py-2 rounded-md"
      >
        Cancel
      </button>

      <p v-if="successMessage" class="text-green-500 mt-4">
        {{ successMessage }}
      </p>
      <p v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</p>
    </form>
  </div>
</template>
