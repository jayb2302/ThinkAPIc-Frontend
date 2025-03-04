<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import api from "../../services/api";
import { useCourseStore } from "../../stores/courseStore";
import type { Topic } from "../../types/Topic";

const emit = defineEmits(["close", "topicUpdated"]);

const props = defineProps<{ topic?: Topic | null }>();
const courseStore = useCourseStore();
const title = ref("");
const week = ref<number | null>(null);
const summary = ref("");
const selectedCourse = ref<string | null>(null);
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
  week.value = null;
  summary.value = "";
  selectedCourse.value = null;
  keyPoints.value = [];
  newKeyPoint.value = "";
  resources.value = [];
  newResource.value = { title: "", link: "" };
  isEditing.value = false;
};

// Watch for existing topic (edit mode)
watch(
  () => props.topic,
  async (newTopic) => {
    if (newTopic) {
      isEditing.value = true;
      title.value = newTopic.title;
      week.value = newTopic.week || 4;
      summary.value = newTopic.summary || "Topic Summary";

      // ✅ Ensure courses are loaded before assigning selectedCourse
      if (!courseStore.courses.length) {
        await courseStore.fetchCourses();
      }

      // ✅ Assign the correct course ID
      selectedCourse.value =
        typeof newTopic.course === "object"
          ? newTopic.course._id // If course is an object, get its ID
          : newTopic.course || null; // If course is just an ID string

      keyPoints.value = newTopic.key_points || [];
      resources.value = newTopic.resources || [];
    } else {
      resetForm();
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
const submitTopic = async () => {
  try {
    successMessage.value = "";
    errorMessage.value = "";

    if (!title.value || week.value === null || isNaN(week.value) || !summary.value || !selectedCourse.value) {
      errorMessage.value = "All fields are required.";
      return;
    }

    const topicData = {
      title: title.value,
      week: week.value,
      summary: summary.value,
      course: selectedCourse.value,
      key_points: keyPoints.value,
      resources: resources.value,
    };

    console.log("📤 Submitting Topic:", topicData);

    let response;
    if (isEditing.value && props.topic?._id) {
      response = await api.put(`/topics/${props.topic._id}`, topicData);
      successMessage.value = "✅ Topic updated successfully!";
    } else {
      response = await api.post("/topics", topicData);
      successMessage.value = "✅ Topic added successfully!";
    }

    emit("topicUpdated", response.data); 
    resetForm();
  } catch (error: any) {
    console.error("❌ Error submitting topic:", error);

    if (error.response && error.response.data) {
      errorMessage.value = error.response.data.error || "Failed to submit topic.";
    } else {
      errorMessage.value = "Something went wrong. Please try again.";
    }
  }
};

// Close form
const closeForm = () => {
  resetForm();
  emit("close");
};
</script>

<template>
  <div class="p-6 bg-white shadow rounded-md">
    <h1 class="text-2xl font-bold mb-4">{{ isEditing ? "Edit Topic" : "Add New Topic" }}</h1>

    <form @submit.prevent="submitTopic" class="p-4 shadow-md rounded-md">
      <label class="block mb-2">Topic Title:</label>
      <input v-model="title" type="text" class="border p-2 w-full mb-4" required />

      <label class="block mb-2">Week:</label>
      <input v-model="week" type="number" class="border p-2 w-full mb-4" required />

      <label class="block mb-2">Summary:</label>
      <textarea v-model="summary" class="border p-2 w-full mb-4" required></textarea>

      <label class="block mb-2">Select Course:</label>
      <select v-model="selectedCourse" class="border p-2 w-full mb-4">
        <option disabled value="">-- Choose a course --</option>
        <option v-for="course in courseStore.courses" :key="course._id" :value="course._id">
          {{ course.title }}
        </option>
      </select>

      <!-- Key Points -->
      <label class="block mb-2">Key Points:</label>
      <div v-for="(point, index) in keyPoints" :key="index" class="flex items-center mb-2">
        <span class="flex-grow">{{ point }}</span>
        <button type="button" @click="removeKeyPoint(index)" class="text-red-500 ml-2">❌</button>
      </div>
      <input v-model="newKeyPoint" type="text" class="border p-2 w-full mb-2" placeholder="Add a key point" />
      <button type="button" @click="addKeyPoint" class="bg-blue-500 text-white px-2 py-1 rounded-md mb-4">➕ Add Key Point</button>

      <!-- Resources -->
      <label class="block mb-2">Resources:</label>
      <div v-for="(resource, index) in resources" :key="index" class="flex items-center mb-2">
        <span class="flex-grow">{{ resource.title }} - <a :href="resource.link" target="_blank" class="text-blue-500">{{ resource.link }}</a></span>
        <button type="button" @click="removeResource(index)" class="text-red-500 ml-2">❌</button>
      </div>
      <input v-model="newResource.title" type="text" class="border p-2 w-full mb-2" placeholder="Resource title" />
      <input v-model="newResource.link" type="text" class="border p-2 w-full mb-2" placeholder="Resource link" />
      <button type="button" @click="addResource" class="bg-blue-500 text-white px-2 py-1 rounded-md mb-4">➕ Add Resource</button>

      <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded-md">
        {{ isEditing ? "Update Topic" : "Submit Topic" }}
      </button>
      <button type="button" @click="closeForm" class="ml-2 bg-gray-500 text-white px-4 py-2 rounded-md">Cancel</button>

      <p v-if="successMessage" class="text-green-500 mt-4">{{ successMessage }}</p>
      <p v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</p>
    </form>
  </div>
</template>