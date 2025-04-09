<script setup lang="ts">
import TopicList from "@/components/topics/TopicList.vue";
import CodeChallenge from "@/components/topics/CodeChallenge.vue";
</script>

<template>
  <div class="flex flex-col w-full p-4 space-y-4">
    <TopicList />
    <div class="code-challange">
      <h2 class="text-lg font-bold py-2">Try a Code Challenge</h2>
      <CodeChallenge />
    </div>
  </div>
</template>
