<script setup lang="ts">
import { ref } from "vue";
import TopicList from "@/components/topics/TopicList.vue";
// import CodeChallenge from "@/components/topics/CodeChallenge.vue";
const selectedWeek = ref<number | null>(null);
</script>

<template>
  <div class="flex flex-col w-full space-y-4">
    <TopicList :week="selectedWeek" />
    <!-- <div class="code-challange">
      <h2 class="text-lg font-bold py-2">Try a Code Challenge</h2>
      <CodeChallenge />
    </div> -->
  </div>
</template>
