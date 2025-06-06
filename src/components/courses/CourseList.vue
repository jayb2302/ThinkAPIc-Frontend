<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

import { useCourseStore } from "../../stores/courseStore";
import { getUserById } from "../../services/userService";
import type { User } from "../../types/User";
import CourseCard from "./CourseCard.vue";

const courseStore = useCourseStore();
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

<template>
  <h1 class="text-2xl font-bold mb-4">My Courses</h1>
  <template v-if="courseStore.loading">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div v-for="n in 3" :key="n" class="p-4 border rounded shadow">
        <Skeleton width="80%" height="1.5rem" class="mb-2" />
        <Skeleton width="60%" height="1rem" class="mb-1" />
        <Skeleton width="40%" height="1rem" />
      </div>
    </div>
  </template>
  <template v-else>
    <div
      class="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md "
    >
      <CourseCard
        v-for="course in courseStore.courses"
        :key="course._id"
        :course="course"
        :teacher="teachers[course._id]"
        :onClick="goToCourse"
      />
    </div>
  </template>
</template>

<style scoped>
.p-card {
  &:hover {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    translate: 0 -0.2rem;
  }
}
</style>
