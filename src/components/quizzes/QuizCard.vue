<template>
  <div
    class="p-2 surface-card border-sm rounded-sm shadow-sm hover:shadow-4 transition-shadow duration-150"
  >
    <template v-if="loading">
      <Skeleton width="8rem" height="1.5rem" class="mb-2" />
      <Skeleton width="100%" height="1.5rem" class="mb-4" />
      <Skeleton width="60%" height="1rem" class="mb-2" />
      <Skeleton width="40%" height="1rem" />
    </template>
    <template v-else>
      <RouterLink
        v-if="quiz.topic?._id"
        :to="`/topics/${quiz.topic._id}`"
        class="hover:!underline text-gray-500 "
      >
        {{ quiz.topic.title }}
      </RouterLink>
      <p v-else class="text-gray-500">No Topic</p>
      <h3 class="text-lg font-bold my-2">{{ quiz.question }}</h3>
      <ul class="mt-2 ml-4 list-disc">
        <li v-for="option in quiz.options" :key="option._id">
          {{ option.text }}
        </li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  quiz: any;
  loading: boolean;
}>();
</script>