<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from './stores/authStore';
import { useTopicStore } from './stores/topicStore';
import { useProgressStore } from './stores/progressStore';

const toast = useToast();

const authStore = useAuthStore();
const topicStore = useTopicStore();
const progressStore = useProgressStore();

onMounted(async() => {
  if (localStorage.getItem('token') && !authStore.isAuthenticated) {
    authStore.fetchCurrentUser();
  }
  if (authStore.user?._id) {
    await progressStore.fetchProgress(authStore.user._id);
  }
  if (!topicStore.topicsLoaded) {
    await topicStore.fetchTopics();
  }
});

const handleTokenExpired = () => {
  toast.add({
    severity: 'warn',
    summary: 'Session Expired',
    detail: 'You were logged out because your session expired.',
    life: 4000
  });
};

onMounted(() => {
  window.addEventListener('token-expired', handleTokenExpired);
});

onBeforeUnmount(() => {
  window.removeEventListener('token-expired', handleTokenExpired);
});
</script>

<template>
  <router-view />
  <Toast position="top-center" />
</template>

