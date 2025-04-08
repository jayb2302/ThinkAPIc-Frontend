<template>
  <h1 class="text-2xl font-bold mb-4">My Courses</h1>
  <div
    class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 shadow rounded-md dark:bg-gray-800"
  >
    <Card
      v-for="course in courseStore.courses"
      :key="course._id"
      class="shadow-md cursor-pointer !hover:shadow-lg transition"
      @click="goToCourse(course._id)"
    >
      <template #title>
        <h1>
          {{ course.title }}
        </h1>
      </template>
      <template #content>
        <p class="text-sm font-bold text-gray-600">
          {{ teachers[course._id]?.username || "Unknown" }}
        </p>
        <p class="text-sm text-gray-500 italic">{{ course.semester }}</p>
        <p class="pt-2">
          {{ course.description.substring(0, 100)
          }}{{ course.description.length > 100 ? "..." : "" }}
        </p>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useCourse } from "../../stores/courseStore";
import { getUserById } from "../../services/userService";
import type { User } from "../../types/User";

const courseStore = useCourse();
const router = useRouter();
const teachers = ref<Record<string, User>>({});

const goToCourse = (id: string) => {
  router.push(`/courses/${id}`);
};

onMounted(async () => {
  await courseStore.fetchCourses();

  for (const course of courseStore.courses) {
    if (course.teacher) {
      const teacherData = await getUserById(course.teacher);
      teachers.value[course._id] = teacherData;
    }
  }
});
</script>

<style scoped>
.p-card {
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    translate: 0 -0.2rem;
  }
}
</style>
