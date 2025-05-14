<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from './stores/authStore';
import { useTopicStore } from './stores/topicStore';
import { useProgressStore } from './stores/progressStore';

const toast = useToast();

const authStore = useAuthStore();
const topicStore = useTopicStore();
const progressStore = useProgressStore();

const isMobile = ref(false);

const handleTokenExpired = () => {
  toast.add({
    severity: 'warn',
    summary: 'Session Expired',
    detail: 'You were logged out because your session expired.',
    life: 4000
  });
};

onMounted(async () => {

  // Auth / User
  if (localStorage.getItem('token') && !authStore.isAuthenticated) {
    authStore.fetchCurrentUser();
  }
  if (authStore.user?._id) {
    await progressStore.fetchProgress(authStore.user._id);
  }

  // Topics
  if (!topicStore.topicsLoaded) {
    await topicStore.fetchTopics();
  }

  // Expired token event
  window.addEventListener('token-expired', handleTokenExpired);

  const checkMobile = () => {
    isMobile.value = window.innerWidth < 640;
  };

  checkMobile();
  window.addEventListener('resize', checkMobile);
});

onBeforeUnmount(() => {
  window.removeEventListener('token-expired', handleTokenExpired);
  window.removeEventListener('resize', () => {});
});
</script>

<template>
  <router-view />
  <Toast :position="isMobile ? 'bottom-center' : 'top-center'" class="!w-[90%] sm:!w-[25rem] text-sm" />
</template>
