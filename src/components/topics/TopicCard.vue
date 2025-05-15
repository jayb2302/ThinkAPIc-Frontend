<script setup lang="ts">
import { defineProps } from "vue";
import type { Topic } from "../../types/Topic";
import { RouterLink } from "vue-router";

// Directly access the `topic` prop
const { topic, quizCount } = defineProps<{
  topic: Topic;
  quizCount: number;
}>();
</script>

<template>
  <div class="topic-card dark:!shadow-gray-800  p-2 md:p-4 rounded-md space-y-2 shadow-md">
    <h3 class="text-xl text-gray-900 dark:text-gray-100 font-semibold">{{ topic.title }}</h3>
    <p class="text-sm text-gray-500 dark:text-gray-300">{{ topic.summary }}</p>
    <p class="text-sm text-gray-500 dark:text-gray-400">
      {{ quizCount }} quiz{{ quizCount === 1 ? "" : "zes" }}
    </p>
    <RouterLink
      :to="`/topics/${topic._id}`"
      class="text-gray-700 dark:text-gray-50 font-bold hover:underline"
      >View Topic</RouterLink
    >
  </div>
</template>
