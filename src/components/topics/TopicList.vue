<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useTopicStore } from '@/stores/topicStore';

const topicStore = useTopicStore();
const { topics, loading, error, fetchTopics } = topicStore;

onMounted(async () => {
  await fetchTopics();
  console.log('Fetched topics:', topics.value); 
});

// ✅ Watch for changes in topics and log them
watch(topics, (newTopics) => {
  console.log('Updated topics:', newTopics);
});
</script>

<template>
  <div class="p-6 bg-gray-100 text-gray-600 min-h-screen">
    <h2 class="text-2xl font-bold text-gray-800">Topics</h2>

    <div v-if="loading" class="text-blue-500 mt-4">Loading topics...</div>
    <div v-else-if="error" class="text-red-500 mt-4">{{ error }}</div>

    <ul v-else class="mt-4 space-y-4">
      <li
        v-for="topic in topics"
        :key="topic._id"
        class="p-4 bg-white dark:bg-gray shadow rounded-md"
      >
        <h3 class="text-lg font-semibold">{{ topic.title }}</h3>
        <p class="text-gray-500">Week: {{ topic.week }}</p>
        <p class="text-gray-700">{{ topic.summary }}</p>

        <h4 class="font-semibold mt-2">Key Points:</h4>
        <ul class="list-disc text-gray-500 ml-5">
          <li v-for="point in topic.key_points" :key="point">
            {{ point }}
          </li>
        </ul>

        <h4 class="font-semibold mt-2">Course:</h4>
        <p class="text-gray-600">{{ topic.course.title }}</p>

        <h4 v-if="topic.resources.length" class="font-semibold text-gray-600 mt-2">
          Resources:
        </h4>
        <ul v-if="topic.resources.length" class="list-disc ml-5">
          <li v-for="resource in topic.resources" :key="resource._id">
            <a
              :href="resource.link"
              target="_blank"
              class="text-blue-500 hover:underline"
            >
              {{ resource.title }}
            </a>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>
