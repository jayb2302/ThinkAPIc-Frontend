<script setup lang="ts">
import { defineProps } from 'vue';
import type { Topic } from '../../types/Topic';

// Directly access the `topic` prop
const { topic } = defineProps<{
  topic: Topic;
}>();
</script>

<template>
  <div class="topic-card p-4 rounded-md space-y-2 shadow-md min-w-[20rem] z-10">
    <h3 class="text-xl text-gray-900 font-semibold">{{ topic.title }}</h3> 
    <p class="text-sm text-gray-500">{{ topic.summary }}</p> 
    <router-link :to="`/topics/${topic._id}`" class="text-gray-700 font-bold hover:underline">View Topic</router-link> 
  </div>
</template>

