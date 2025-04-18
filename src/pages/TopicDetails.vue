<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import type { Topic } from "../types/Topic";
import { getTopicById } from "../services/topicService";

const route = useRoute();

const topic = ref<Topic | null>(null);

onMounted(async () => {
  const id = route.params.id as string;
  topic.value = await getTopicById(id);
});
</script>

<template>
  <div
    class="p-6 shadow rounded-md bg-gray-50 dark:bg-gray-800 overflow-auto"
    v-if="topic"
  >
    <h1 class="text-2xl font-bold mb-2">{{ topic.title }}</h1>
    <span class="flex gap-2">
      <p class="mb-2"><strong>Week:</strong> {{ topic.week }}</p>
      |
      <div v-if="topic.course && typeof topic.course === 'object'">
        <strong>Course: </strong>
        <router-link :to="`/courses/${topic.course._id}`" class="text-sky-600">
          <span class="hover:font-bold">
            {{ topic.course.title || "Untitled Course" }}
          </span>
        </router-link>
      </div>
    </span>
    <p class="mb-4">{{ topic.summary || "No summary available." }}</p>

    <div v-if="topic.key_points?.length" class="mb-4 shadow p-4 rounded">
      <h2 class="font-semibold mb-1">Key Points:</h2>
      <ul class="list-inside mb-4">
        <li v-for="(point, index) in topic.key_points" :key="index">
          - {{ point }}
        </li>
      </ul>
    </div>

    <div v-if="topic.resources?.length" class="mb-4 shadow p-4 rounded">
      <h2 class="font-semibold mb-1">Resources:</h2>
      <ul class="list-inside">
        <li v-for="resource in topic.resources" :key="resource._id">
          -
          <a
            :href="resource.link"
            target="_blank"
            class="text-sky-600 hover:underline"
          >
            {{ resource.title }}
          </a>
        </li>
      </ul>
    </div>
  </div>

  <p v-else class="text-center p-6">Loading topic details...</p>
</template>
