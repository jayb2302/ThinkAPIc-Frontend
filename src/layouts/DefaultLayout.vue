<script setup lang="ts">
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";

const userStore = useUserStore();
const router = useRouter();

const handleLogout = () => {
  userStore.logout();
  router.push("/login");
};
</script>

<template>
  <nav class="bg-gray-800 text-white p-4 flex justify-between items-center">
    <div>
      <router-link to="/" class="mr-4">Home</router-link>
      <router-link to="/quizzes" class="mr-4">Quizzes</router-link>
      <router-link to="/topics" class="mr-4">Topics</router-link>
      <router-link to="/admin" class="mr-4" v-if="userStore.isAdmin"
        >Admin</router-link
      >
    </div>

    <div>
      <span v-if="userStore.isAuthenticated" class="mr-4"
        >Logged in as: {{ userStore.role }}</span
      >
      <button
        v-if="userStore.isAuthenticated"
        @click="handleLogout"
        class="bg-red-500 px-3 py-1 rounded"
      >
        Logout
      </button>
      <router-link to="/login" v-else class="bg-blue-500 px-3 py-1 rounded"
        >Login</router-link
      >
    </div>
  </nav>
  <main>
    <router-view />
  </main>
</template>
