<template>
  <div class="p-2 surface-card border-sm rounded-sm shadow-sm hover:shadow-4 transition-shadow duration-150">
    <template v-if="loading">
      <Skeleton width="8rem" height="1.5rem" class="mb-2" />
      <Skeleton width="100%" height="1.5rem" class="mb-4" />
      <Skeleton width="60%" height="1rem" class="mb-2" />
    </template>
    <template v-else>
      <RouterLink
        v-if="exercise.topic?._id"
        :to="`/topics/${exercise.topic._id}`"
        class="hover:!underline text-gray-500"
      >
        {{ exercise.topic.title }}
      </RouterLink>
      <p v-else class="text-gray-500">No Topic</p>
      <h3 class="text-lg font-bold my-2">{{ exercise.title }}</h3>
      <p class="text-sm text-gray-600 mb-2">{{ exercise.description }}</p>

      <ul class="mt-2 ml-4 list-disc" v-if="exercise.questions?.length">
        <li>{{ exercise.questions[0].question }}</li>
      </ul>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  exercise: any;
  loading: boolean;
}>();
</script>