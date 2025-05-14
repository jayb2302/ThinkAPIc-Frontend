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
  <div class="topic-card p-2 md:p-4 rounded-md space-y-2 shadow-md">
    <h3 class="text-xl text-gray-900 font-semibold">{{ topic.title }}</h3>
    <p class="text-sm text-gray-500">{{ topic.summary }}</p>
    <p class="text-sm text-gray-500">
      {{ quizCount }} quiz{{ quizCount === 1 ? "" : "zes" }}
    </p>
    <RouterLink
      :to="`/topics/${topic._id}`"
      class="text-gray-700 font-bold hover:underline"
      >View Topic</RouterLink
    >
  </div>
</template>
