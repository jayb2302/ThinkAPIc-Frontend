<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import { storeToRefs } from "pinia";

const router = useRouter();
const userStore = useUserStore();
const { role } = storeToRefs(userStore);

// ✅ Redirect if user is NOT an admin
if (role.value !== "admin") {
  console.warn("⛔ Access Denied: Redirecting Non-Admin User");
  router.push("/");
}

// ✅ Logout Function
const logout = () => {
  userStore.logout();
  router.push("/login");
};
</script>
<template>
  <div class="flex flex-col w-full">
    <!-- Sidebar Navigation -->
    <h2 class="text-xl font-bold">Admin Panel</h2>
    <nav class="w-full flex justify-evenly items-baseline rounded bg-gray-300 dark:bg-gray-800 p-1 space-y-4">
      <router-link to="/admin" class="block rounded-md p-2 hover:bg-gray-500">
        🏠 Dashboard
      </router-link>
      <router-link
        to="/admin/manage-quizzes"
        class="block rounded-md p-2 hover:bg-gray-500"
      >
        📝 Quizzes
      </router-link>
      <router-link
        to="/admin/manage-topics"
        class="block rounded-md p-2 hover:bg-gray-500"
      >
        📚 Topics
      </router-link>
      <router-link
        to="/admin/manage-courses"
        class="block rounded-md p-2 hover:bg-gray-500"
      >
        🎓 Courses
      </router-link>
      <button
        @click="logout"
        class="mt-5 bg-red-100 hover:bg-red-300 text-gray-800 p-2 rounded-md"
      >
        🚪 Logout
      </button>
    </nav>

    <!-- Main Content Area -->
    <main class="flex-1 p-6 bg-gray-100 overflow-auto">
      <router-view />
    </main>
  </div>
</template>
