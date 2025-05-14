<script setup>
import { useAuthStore } from "@/stores/authStore";
import { onMounted } from "vue";
</script>

<template>
  <div class="">
    <h1 class="text-2xl font-bold mb-4">Admin Dashboard</h1>

    <div v-if="!authStore.isAdmin" class="text-red-500">
      ⛔ Access Denied. Only admins can access this page.
    </div>
  </div>
</template>