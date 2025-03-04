<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useQuizStore } from "../../stores/quizStore";
import ManageQuizForm from "./ManageQuizForm.vue";
import type { Quiz, QuizOption } from "../../types/Quiz";

const quizStore = useQuizStore();
const showForm = ref(false);
const selectedQuiz = ref<Quiz | null>(null);
const successMessage = ref<string | null>(null);

// Fetch quizzes on component mount
onMounted(() => {
  quizStore.fetchQuizzes();
});

// Computed property instead of watch() for better performance
//// - computed() automatically updates when quizStore.quizzes changes
//// - More efficient since it only recalculates when needed
const quizList = computed(() => quizStore.quizzes);

// Function to prepare quiz for editing
const prepareQuizForEdit = (quiz: Quiz) => ({
  ...quiz,
  options: quiz.options.map((opt: QuizOption, index: number) => ({
    _id: opt._id || "",
    text: opt.text || "",
    isCorrect: opt.isCorrect ?? false,
    order: opt.order ?? index + 1,
  })),
});
// Open edit mode
const editQuiz = (quiz: Quiz) => {
  selectedQuiz.value = prepareQuizForEdit(quiz);
  showForm.value = true;
};

// Handle quiz submission (refresh list after adding/editing)
//
const handleQuizUpdated = async () => {
  await quizStore.fetchQuizzes();
  showForm.value = false;
  selectedQuiz.value = null;
};

// Delete quiz
const deleteQuiz = async (quizId: string) => {
  if (confirm("Are you sure you want to delete this quiz?")) {
    await quizStore.deleteQuizById(quizId);
    await quizStore.fetchQuizzes();
  }
};

// Reset form state
const closeForm = () => {
  selectedQuiz.value = null;
  showForm.value = false;
};
</script>

<template>
  <div class="p-6 shadow rounded-md">
    <!-- ✅ Success Message -->
    <div v-if="successMessage" class="bg-green-500 text-white p-3 rounded mb-4">
      {{ successMessage }}
    </div>
    <h2 class="text-2xl font-bold mb-4">Manage Quizzes</h2>

    <button
      @click="showForm = true"
      class="bg-blue-500 text-white px-4 py-2 rounded mb-4"
    >
      ➕ Add New Quiz
    </button>

    <!-- Quiz Form -->
    <ManageQuizForm
      v-if="showForm"
      :quiz="selectedQuiz"
      @quiz-updated="handleQuizUpdated"
      @close="closeForm"
    />

    <!-- Quiz List -->
    <table
      class="w-full table-auto text-left border-collapse border border-gray-300"
    >
      <thead>
        <tr class="bg-gray-100">
          <th class="border px-4 py-2">Question</th>
          <th class="border px-4 py-2">Topic</th>
          <th class="border px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="quiz in quizList" :key="quiz._id" class="border-b">
          <td class="border px-4 py-2">{{ quiz.question }}</td>
          <td class="border px-4 py-2">
            {{ quiz.topic?.title || "No Topic" }}
          </td>
          <td class="border px-4 py-2">
            <button @click="editQuiz(quiz)" class="text-blue-500 mr-2">
              ✏️ Edit
            </button>
            <button @click="deleteQuiz(quiz._id)" class="text-red-500">
              🗑 Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
