<script setup lang="ts">
import { onMounted } from "vue";
import { useQuizStore } from "../../stores/quizStore";

const quizStore = useQuizStore();
const { quizzes, loading, error, fetchQuizzes } = quizStore;

onMounted(fetchQuizzes);
</script>

<template>
  <div class="p-6 bg-gray-100 min-h-screen text-gray-600">
    <h2 class="text-2xl font-bold text-gray-800">Quizzes</h2>

    <div v-if="loading" class="text-blue-500 mt-4">Loading quizzes...</div>
    <div v-else-if="error" class="text-red-500 mt-4">{{ error }}</div>

    <ul v-else class="mt-4 space-y-4">
      <li
        v-for="quiz in quizzes"
        :key="quiz._id"
        class="p-4 bg-white shadow rounded-md"
      >
        <h3 class="text-lg font-semibold">{{ quiz.question }}</h3>

        <ul class="mt-2 space-y-2">
          <li
            v-for="option in quiz.options"
            :key="option._id"
            class="p-2 border rounded-md cursor-pointer"
            :class="{ 'bg-green-100': option.isCorrect }"
          >
            {{ option.text }}
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
