<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import draggable from "vuedraggable";
import { useUserStore } from "../../stores/userStore";
import api from "../../services/api";
import type { Quiz, QuizOption } from "../../types/Quiz";
import type { Topic } from "../../types/Topic";

const userStore = useUserStore();
const emit = defineEmits(["close", "quizUpdated"]);

// Props for quiz editing
const props = defineProps<{ quiz?: Quiz | null }>();

// Reactive form state
const topics = ref<Topic[]>([]);
const selectedTopic = ref<string>("");
const question = ref<string>("");
const options = ref<QuizOption[]>([]);
const successMessage = ref<string>("");
const errorMessage = ref<string>("");
const isEditing = computed(() => !!props.quiz?._id);

// Fetch topics from the API
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

// Reset form
const resetForm = () => {
  selectedTopic.value = "";
  question.value = "";
  options.value = prepareOptions([]);
};

// Prepare options for the form
const prepareOptions = (opts: QuizOption[] = []) => {
  return (opts.length ? opts : Array(2).fill(null)).map((opt, index) => ({
    _id: opt?._id || "",
    text: opt?.text || "",
    isCorrect: opt?.isCorrect ?? false,
    order: opt?.order ?? index + 1,
  }));
};

// Watch for quiz changes & populate form when editing
watch(
  () => props.quiz,
  (newQuiz) => {
    if (newQuiz) {
      selectedTopic.value = newQuiz.topic?._id || "";
      question.value = newQuiz.question;
      options.value = prepareOptions(newQuiz.options);
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

// Add more options
const addOption = () => {
  options.value.push({
    _id: "",
    text: "",
    isCorrect: false,
    order: options.value.length + 1,
  });
};

// Remove an option (at least 2 required)
const removeOption = (index: number) => {
  if (options.value.length > 2) { options.value.splice(index, 1); }
};

// ✅ Function to validate the form
const validateForm = () => {
  const validations = [
    { condition: !selectedTopic.value, message: "Please select a topic." },
    { condition: !question.value.trim(), message: "Question cannot be empty." },
    { condition: options.value.length < 2, message: "At least two options are required." },
    { condition: !options.value.some((opt) => opt.isCorrect), message: "At least one option must be marked as correct." }
  ];

  return validations.find((v) => v.condition)?.message || null;
};
const submitQuiz = async () => {
  successMessage.value = "";
  errorMessage.value = "";

  const validationError = validateForm();
  if (validationError) {
    errorMessage.value = validationError;
    return;
  }

  const quizData = {
    topic: selectedTopic.value,
    question: question.value,
    options: options.value.map(({ text, isCorrect }) => ({ text, isCorrect })),
  };

  try {
    let response;
    if (isEditing.value && props.quiz?._id) {
      response = await api.put(`/quizzes/${props.quiz._id}`, quizData);
      successMessage.value = "✅ Quiz updated successfully!";
    } else {
      response = await api.post("/quizzes", quizData);
      successMessage.value = "✅ Quiz added successfully!";
    }

    emit("quizUpdated", response.data);
    resetForm();
  } catch (error) {
    errorMessage.value = "Failed to submit quiz.";
    console.error("❌ Error Submitting Quiz:", error);
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
    <h1 class="text-2xl font-bold mb-4">
      {{ isEditing ? "Edit Quiz" : "Add New Quiz" }}
    </h1>

    <!-- Access Restriction -->
    <div v-if="!userStore.isAdmin" class="text-red-500">
      ⛔ Access Denied. Only admins can manage quizzes.
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

      <draggable v-model="options" item-key="order">
        <template #item="{ element }">
          <div class="drag-item flex items-center space-x-2">
            <span class="cursor-move">☰</span>
            <input
              v-model="element.text"
              type="text"
              class="border p-2 w-4/5"
              placeholder="Enter Option"
              required
            />
            <input v-model="element.isCorrect" type="checkbox" class="ml-2" />
            <span class="ml-1">Correct</span>
            <button
              type="button"
              @click="removeOption(options.indexOf(element))"
              class="text-red-500"
            >
              ❌
            </button>
          </div>
        </template>
      </draggable>
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
        {{ isEditing ? "Update Quiz" : "Submit Quiz" }}
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
