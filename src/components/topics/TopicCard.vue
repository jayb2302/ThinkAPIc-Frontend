<script setup lang="ts">
import { defineProps } from 'vue';
import type { Topic } from '../../types/Topic';

// Directly access the `topic` prop
const { topic } = defineProps<{
  topic: Topic;
}>();
</script>

<template>
  <div class="topic-card p-4 rounded shadow-md min-w-[20rem]">
    <h3 class="text-xl font-semibold">{{ topic.title }}</h3> 
    <p class="text-sm text-gray-500">{{ topic.summary }}</p> 
    <router-link :to="`/topics/${topic._id}`" class="text-gray-700 font-bold hover:underline">View Topic</router-link> 
  </div>
</template>

