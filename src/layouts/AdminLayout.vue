<template>
  <div>
    <nav>
      <router-link to="/admin">Dashboard</router-link>
      <router-link to="/admin/manage-quizzes">Manage Quizzes</router-link>
      <router-link to="/admin/manage-topics">Manage Topics</router-link>
      <button @click="logout">Logout</button>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const logout = async () => {
  auth.signOut();
  window.location.href = "/login";
};
</script>
