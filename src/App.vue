<script setup lang="ts">
// import Home from '@/pages/Home.vue'
// import QuizList from '@/components/quizzes/QuizList.vue'
import { onMounted } from 'vue';
import { useAuthStore } from './stores/authStore';
import { useTopicStore } from './stores/topicStore';


const authStore = useAuthStore();
const topicStore = useTopicStore();

onMounted(async() => {
  if (localStorage.getItem('token') && !authStore.isAuthenticated) {
    authStore.fetchCurrentUser();
  }
  if (!topicStore.topicsLoaded) {
    await topicStore.fetchTopics();
  }
});
</script>

<template>
  <router-view />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
