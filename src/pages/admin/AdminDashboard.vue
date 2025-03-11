<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUserStore } from "../../stores/userStore";
import api from "../../services/api";
import { useRouter } from "vue-router";

const userStore = useUserStore();
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

    latestQuizzes.value = quizzesRes.data.slice(-5); // Get last 5 quizzes

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
  <div class="p-6 shadow rounded-md">
    <h1 class="text-3xl font-bold mb-4">Admin Dashboard</h1>

    <!-- Access Restriction -->
    <div v-if="!userStore.isAdmin" class="text-red-500">
      ⛔ Access Denied. Only admins can access this page.
    </div>

    <!-- Dashboard Stats -->
    <div v-else>
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="p-4 bg-blue-300 text-white rounded-md">
          <h2 class="text-xl font-semibold">Quizzes</h2>
          <p class="text-2xl">{{ totalQuizzes }}</p>
        </div>
        <div class="p-4 bg-green-300 text-white rounded-md">
          <h2 class="text-xl font-semibold">Topics</h2>
          <p class="text-2xl">{{ totalTopics }}</p>
        </div>
        <div class="p-4 bg-purple-300 text-white rounded-md">
          <h2 class="text-xl font-semibold">Courses</h2>
          <p class="text-2xl">{{ totalCourses }}</p>
        </div>
        <div class="p-4 bg-yellow-300 text-white rounded-md">
          <h2 class="text-xl font-semibold">Users</h2>
          <p class="text-2xl">{{ totalUsers }}</p>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <button @click="goTo('/admin/quizzes')" class="bg-blue-300 p-2 rounded-md">
          📚 Manage Quizzes
        </button>
        <button @click="goTo('/admin/topics')" class="bg-green-300 p-2 rounded-md">
          📖 Manage Topics
        </button>
        <button @click="goTo('/admin/courses')" class="bg-purple-300 p-2 rounded-md">
          🎓 Manage Courses
        </button>
      </div>

      <!-- Recent Quizzes -->
      <div class="bg-gray-100 text-left p-4 rounded-md">
        <h2 class="text-xl font-bold mb-3">Recent Quizzes</h2>
        <ul>
          <li v-for="quiz in latestQuizzes" :key="quiz._id" class="mb-2">
           <strong> 📝 {{ quiz.question }} </strong> ( Topic: {{ quiz.topic.title }} )
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>