<script setup lang="ts">
import type { Course } from "../../types/Course";
import type { User } from "../../types/User";

defineProps<{
  course: Course;
  teacher: User | undefined;
  onClick: (id: string) => void;
}>();
</script>

<template>
  <Card
    class="!shadow-md dark:!shadow-gray-800 cursor-pointer !hover:shadow-lg transition"
    @click="() => onClick(course._id)"
  >
    <template #title>
      <h1>{{ course.title }}</h1>
    </template>
    <template #content>
      <p class="text-sm font-bold text-gray-600">
        {{ teacher?.username || "Unknown" }}
      </p>
      <p class="text-sm text-gray-500 italic">{{ course.semester }}</p>
      <p class="pt-2">
        {{ course.description.substring(0, 100)
        }}{{ course.description.length > 100 ? "..." : "" }}
      </p>
    </template>
  </Card>
</template>
