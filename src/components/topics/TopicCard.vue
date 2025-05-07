<script setup lang="ts">
import { defineProps } from 'vue';
import type { Topic } from '../../types/Topic';

// Directly access the `topic` prop
const { topic } = defineProps<{
  topic: Topic;
}>();
</script>

<template>
  <div class="topic-card p-4  bg-white rounded shadow-md">
    <h3 class="text-xl font-semibold">{{ topic.title }}</h3> 
    <p class="text-sm text-gray-500">{{ topic.summary }}</p> 
    <router-link :to="`/topics/${topic._id}`" class="text-blue-500 hover:underline">View Topic</router-link> 
  </div>
</template>

<style scoped>

.topic-card:hover {
  transform: scale(1.05);
}
</style>