<script setup lang="ts">
import Card from "primevue/card";

defineProps<{
  quiz: any;
  loading: boolean;
  showAnswers: boolean;
}>();
</script>
<template>
  <div
    class="surface-card border-sm rounded-md hover:shadow-4 shadow-md dark:shadow-gray-800 transition-shadow duration-150"
  >
    <template v-if="loading">
      <Skeleton width="8rem" height="1.5rem" class="mb-2" />
      <Skeleton width="100%" height="1.5rem" class="mb-4" />
      <Skeleton width="60%" height="1rem" class="mb-2" />
      <Skeleton width="40%" height="1rem" />
    </template>
    <template v-else>
      <Card class="">
        <template #title>
          <h2 class="text-xl font-semibold text-gray-900">
            {{ quiz.title }}
          </h2>
        </template>
        <template #content>
          <RouterLink
            v-if="quiz.topic?._id"
            :to="`/topics/${quiz.topic._id}`"
            class="hover:!underline text-gray-500"
          >
            {{ quiz.topic.title }}
          </RouterLink>
          <p v-else class="text-gray-500">No Topic</p>
          <h3 class="text-lg font-bold my-2 text-pretty">
            {{ quiz.question }}
          </h3>
          <ul class="mt-2">
            <li
              v-for="option in quiz.options"
              :key="option._id"
              class="pl-2"
              :class="{
                'bg-emerald-600/20 rounded-md pl-2 font-semibold':
                  showAnswers && option.isCorrect,
                'text-gray-300 rounded-md pl-2 ':
                  showAnswers && !option.isCorrect,
              }"
            >
              {{ option.text }}
            </li>
          </ul>
        </template>
      </Card>
    </template>
  </div>
</template>
