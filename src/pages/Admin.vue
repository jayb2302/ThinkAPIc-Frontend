<script setup>
import { useUserStore } from "@/stores/userStore";
import AddQuizForm from "@/components/quizzes/AddQuizForm.vue";

const userStore = useUserStore();
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Admin Dashboard</h1>

    <div v-if="!userStore.isAdmin" class="text-red-500">
      ⛔ Access Denied. Only admins can access this page.
    </div>

    <div v-else>
      <AddQuizForm />
    </div>
  </div>
</template>