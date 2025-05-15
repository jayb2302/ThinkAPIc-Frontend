<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "../../stores/authStore";
import api from "../../services/api";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();

// Stats for dashboard
const totalQuizzes = ref(0);
const totalTopics = ref(0);
const totalCourses = ref(0);
const totalUsers = ref(0);
const latestQuizzes = ref<any[]>([]);

// Fetch admin dashboard data
onMounted(async () => {
  try {
    const quizzesRes = await api.get("/quizzes");
    const topicsRes = await api.get("/topics");
    const coursesRes = await api.get("/courses");
    const usersRes = await api.get("/users");

    totalQuizzes.value = quizzesRes.data.length;
    totalTopics.value = topicsRes.data.length;
    totalCourses.value = coursesRes.data.length;
    totalUsers.value = usersRes.data.length;

    // Get the latest 5 quizzes
    latestQuizzes.value = quizzesRes.data.slice(-4);
  } catch (error) {
    console.error("❌ Error fetching dashboard data:", error);
  }
});

// Navigation helpers
const goTo = (route: string) => {
  router.push(route);
};
</script>

<template>
  <div
    class=" w-full h-full p-2 shadow rounded-md"
  >
    <h1 class="text-3xl font-bold mb-4">Admin Dashboard</h1>

    <!-- Access Restriction -->
    <div v-if="!authStore.isAdmin" class="text-red-500">
      ⛔ Access Denied. Only admins can access this page.
    </div>

    <!-- Dashboard Stats -->
    <div v-else>
      <div class="overflow-x-auto mb-6">
        <div class="flex sm:grid sm:grid-cols-2 md:grid-cols-4 gap-2 text-md">
          <Panel
            header="Courses"
            class="min-w-[15rem] sm:min-w-0 bg-purple-500 font-bold text-white rounded-md shadow-md"
            icon="pi pi-briefcase"
          >
            <p class="text-3xl text-center text-shadow-2 font-bold">
              {{ totalCourses }}
            </p>
            <template #footer>
              <Button
                @click="goTo('/admin/courses')"
                label="Manage Courses"
                class="bg-purple-300 w-full p-2 rounded-md"
              />
            </template>
          </Panel>

          <Panel
            header="Topics"
            class="min-w-[15rem] sm:min-w-0 bg-green-500 text-white rounded-md shadow-md"
          >
            <p class="text-3xl font-bold text-center">{{ totalTopics }}</p>
            <template #footer>
              <Button
                @click="goTo('/admin/topics')"
                label="Manage Topics"
                class="w-full bg-green-300 p-2 rounded-md"
              />
            </template>
          </Panel>
          <Panel
            header="Quizzes"
            class="min-w-[15rem] sm:min-w-0 rounded-md shadow-md w-full"
          >
            <p class="text-3xl font-bold text-center">{{ totalQuizzes }}</p>
            <template #footer>
              <Button
                @click="goTo('/admin/quizzes')"
                label="Manage Quizzes"
                class="bg-blue-300 p-2 rounded-md w-full"
              />
            </template>
          </Panel>
          <Panel
            header="Users"
            class="min-w-[15rem] sm:min-w-0 rounded-md shadow-md"
          >
            <p class="text-3xl font-bold text-center">{{ totalUsers }}</p>
            <template #footer>
              <Button
                @click="goTo('/admin/users')"
                label="Manage Users"
                class="w-full p-2 rounded-md"
              />
            </template>
          </Panel>
        </div>
      </div>

      <!-- Recent Quizzes -->
      <Card class="dark:bg-gray-700 dark:!shadow-gray-800 !shadow-md text-left rounded-md">
        <template #title>
          <h2 class="text-2xl font-bold">Recent Quizzes</h2>
          <Divider />
        </template>
        <template #content>
          <ul class="divide-y divide-gray-300/40 dark:divide-gray-600/40">
            <li
              v-for="quiz in latestQuizzes"
              :key="quiz._id"
              class="mb-2 flex flex-col"
            >
              <strong class="mb-2"> {{ quiz.question }} </strong>
              <span class="">
                <Chip icon="pi pi-th-large" :label="quiz.topic.title" />
              </span>
              <span class="text-sm text-gray-500 text-right">
                <i class="pi pi-calendar mr-1"></i>
                {{ new Date(quiz.createdAt).toLocaleDateString() }}
              </span>
            </li>
          </ul>
        </template>
      </Card>
    </div>
  </div>
</template>
