<script setup>
import Courses from './Courses.vue';
import ProgressLog from '../components/users/ProgressLog.vue';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
</script>
<template>
  <div class="p-6 bg-gray-50 dark:bg-gray-500 w-full">
    <h1 class="text-2xl font-bold">Welcome to ThinkAPIc</h1>
    <p class="text-gray-600">
      Prepare for your web development exams
    </p>

    <div v-if="authStore.user">
      <ProgressLog />
      <Courses />
    </div>

    <div v-else class="text-gray-500 mt-4">
      Please log in to see your progress and available courses.
    </div>
  </div>
  
</template>
