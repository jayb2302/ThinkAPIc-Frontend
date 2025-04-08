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

    // Get the latest 5 quizzes
    latestQuizzes.value = quizzesRes.data.slice(-5);
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
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Panel
          header="Quizzes"
          class="bg-blue-500 text-white rounded-md shadow-md"
        >
          <p class="text-3xl font-bold">{{ totalQuizzes }}</p>
        </Panel>

        <Panel
          header="Topics"
          class="bg-green-500 text-white rounded-md shadow-md"
        >
          <p class="text-3xl font-bold">{{ totalTopics }}</p>
        </Panel>

        <Panel
          header="Courses"
          class="bg-purple-500 text-white rounded-md shadow-md"
        >
          <p class="text-3xl font-bold">{{ totalCourses }}</p>
        </Panel>

        <Panel
          header="Users"
          class="bg-yellow-500 text-white rounded-md shadow-md"
        >
          <p class="text-3xl font-bold">{{ totalUsers }}</p>
        </Panel>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <Button
          @click="goTo('/admin/quizzes')"
          label="Manage Quizzes"
          icon="pi pi-question-circle"
          class="bg-blue-300 p-2 rounded-md"
        />
        <Button
          @click="goTo('/admin/topics')"
          label="Manage Topics"
          icon="pi pi-list"
          class="bg-green-300 p-2 rounded-md"
        />
        <Button
          @click="goTo('/admin/courses')"
          label="Manage Courses"
          icon="pi pi-briefcase"
          class="bg-purple-300 p-2 rounded-md"
        />
        <Button
          @click="goTo('/admin/users')"
          label="Manage Users"
          icon="pi pi-users"
          class="bg-purple-300 p-2 rounded-md"
        />
      </div>

      <!-- Recent Quizzes -->
      <div class="bg-gray-100 shadow text-left p-4 rounded-md ">
        <h2 class="text-xl font-bold mb-3">Recent Quizzes</h2>
        <ul class=" divide-y divide-gray-300">
          <li v-for="quiz in latestQuizzes" :key="quiz._id" class="mb-2 flex flex-col">
            <strong> 📝 {{ quiz.question }} </strong> 
            Topic: {{ quiz.topic.title }} 
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
