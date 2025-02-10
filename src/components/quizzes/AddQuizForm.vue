<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";
import api from "@/services/api";

const userStore = useUserStore();

// Form state
const topics = ref<{ _id: string; title: string }[]>([]);
const selectedTopic = ref("");
const question = ref("");
const options = ref([
  { text: "", isCorrect: false },
  { text: "", isCorrect: false },
]);
const successMessage = ref("");
const errorMessage = ref("");

// Fetch topics from the API when the component loads
onMounted(async () => {
  try {
    const { data } = await api.get("/topics");
    topics.value = data;
    console.log("✅ Topics Loaded:", data);
  } catch (error) {
    console.error("❌ Error Fetching Topics:", error);
    errorMessage.value = "Failed to load topics.";
  }
});

// Add more options dynamically
const addOption = () => {
  options.value.push({ text: "", isCorrect: false });
};

// Remove an option (keep at least 2 options)
const removeOption = (index: number) => {
  if (options.value.length > 2) {
    options.value.splice(index, 1);
  }
};

// Submit the form to the API
const submitQuiz = async () => {
  try {
    successMessage.value = "";
    errorMessage.value = "";

    // ✅ Validate input
    if (!selectedTopic.value || !question.value || options.value.length < 2) {
      errorMessage.value =
        "All fields are required, and you need at least two options.";
      return;
    }

    // ✅ Ensure at least one correct option
    if (!options.value.some((option) => option.isCorrect)) {
      errorMessage.value = "At least one option must be marked as correct.";
      return;
    }

    console.log("📥 Sending Quiz Data:", {
      topic: selectedTopic.value,
      question: question.value,
      options: options.value,
    });

    const { data } = await api.post("/quizzes", {
      topic: selectedTopic.value, // ✅ Use selected topic ID
      question: question.value,
      options: options.value,
    });

    console.log("✅ Quiz Added:", data);
    successMessage.value = "✅ Quiz added successfully!";
  } catch (error) {
    console.error("❌ Error Adding Quiz:", error);
    errorMessage.value = "Failed to add quiz.";
  }
};
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Admin: Add New Quiz</h1>

    <!-- Access Restriction -->
    <div v-if="!userStore.isAdmin" class="text-red-500">
      ⛔ Access Denied. Only admins can add quizzes.
    </div>

    <!-- Quiz Form -->
    <form v-else @submit.prevent="submitQuiz" class="p-4 shadow-md rounded-md">
      <label class="block mb-2">Select Topic:</label>
      <select v-model="selectedTopic" class="border p-2 w-full mb-4">
        <option disabled value="">-- Choose a topic --</option>
        <option v-for="topic in topics" :key="topic._id" :value="topic._id">
          {{ topic.title }}
        </option>
      </select>

      <label class="block mb-2">Question:</label>
      <input
        v-model="question"
        type="text"
        class="border p-2 w-full mb-4"
        placeholder="Enter Question"
        required
      />

      <div v-for="(option, index) in options" :key="index" class="mb-2">
        <input
          v-model="option.text"
          type="text"
          class="border p-2 w-4/5"
          placeholder="Enter Option"
          required
        />
        <input v-model="option.isCorrect" type="checkbox" class="ml-2" />
        <span class="ml-1">Correct</span>
        <button
          type="button"
          @click="removeOption(index)"
          class="ml-2 text-red-500"
        >
          Remove
        </button>
      </div>

      <button
        type="button"
        @click="addOption"
        class="bg-blue-500 text-white px-2 py-1 rounded-md mb-4"
      >
        ➕ Add Option
      </button>

      <button
        type="submit"
        class="bg-green-500 text-white px-4 py-2 rounded-md"
      >
        Submit Quiz
      </button>

      <p v-if="successMessage" class="text-green-500 mt-4">
        {{ successMessage }}
      </p>
      <p v-if="errorMessage" class="text-red-500 mt-4">{{ errorMessage }}</p>
    </form>
  </div>
</template>
