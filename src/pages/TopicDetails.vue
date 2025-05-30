<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";

import type { Topic } from "../types/Topic";
import { getTopicById } from "../services/topicService";
import TopicQuizzes from "../components/quizzes/TopicQuizzes.vue";

const route = useRoute();
const topic = ref<Topic | null>(null);
const showQuizDialog = ref(false);

const openQuizDialog = () => {
  showQuizDialog.value = true;
};

const fetchTopicDetails = async (id: string) => {
  topic.value = await getTopicById(id);
};

watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      topic.value = await getTopicById(newId as string);
    }
  }
);

onMounted(() => {
  const id = route.params.id as string;
  fetchTopicDetails(id);
});
</script>

<template>
  <div
    class="p-4 overflow-auto w-full"
    v-if="topic"
  >
    <h1 class="text-2xl font-bold mb-2">{{ topic.title }}</h1>
    <span class="flex flex-col gap-2 dark:text-gray-300">
      <div v-if="topic.course && typeof topic.course === 'object'">
        <strong>Course: </strong>
        <RouterLink :to="`/courses/${topic.course._id}`" class="">
          <span class="hover:font-bold">
            {{ topic.course.title || "Untitled Course" }}
          </span>
        </RouterLink>
      </div>
      <p class="mb-2"><strong>Week:</strong> {{ topic.week }}</p>
    </span>
    <p class="mb-4">{{ topic.summary || "No summary available." }}</p>

    <div
      v-if="topic.key_points?.length"
      class="mb-4 shadow-md dark:bg-gray-950 p-4 rounded-md"
    >
      <h2 class="font-semibold mb-2">Key Points:</h2>
      <ul class="list-inside mb-4">
        <li v-for="(point, index) in topic.key_points" :key="index">
          <i class="pi pi-caret-right text-gray-300"> </i>
          {{ point }}
        </li>
      </ul>
    </div>

    <div
      v-if="topic.resources?.length"
      class="mb-4 shadow p-4 dark:bg-gray-950 rounded-md"
    >
      <h2 class="font-semibold mb-2">Resources:</h2>
      <ul class="list-inside">
        <li v-for="resource in topic.resources" :key="resource._id">
          <i class="pi pi-link text-gray-600 dark:text-gray-100 pr-2"></i>
          <a
            :href="resource.link"
            target="_blank"
            class="text-gray-600 dark:text-gray-100 hover:!underline"
          >
            {{ resource.title }}
          </a>
        </li>
      </ul>
    </div>

    <Button
      label="Take Quiz"
      icon="pi pi-play"
      class="btn-primary"
      @click="openQuizDialog"
    />

    <TopicQuizzes
      v-if="topic"
      v-model:visible="showQuizDialog"
      :key="topic._id"
      :topicId="topic._id"
      :courseId="topic.course._id"
      @hide="showQuizDialog = false"
    />
  </div>

  <p v-else class="text-center p-6">Loading topic details...</p>
</template>
