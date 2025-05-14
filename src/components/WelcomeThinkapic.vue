<script setup lang="ts">
defineProps<{ msg: string }>()
defineEmits(['open-login'])
</script>

<template>
  <Card class="w-full max-w-xl text-center p-6">
    <template #title>
      <img src="/ExplodingHead.svg" class="w-12 h-12 mb-4 mx-auto" alt="Logo" />
      <h1 class="text-2xl font-bold mb-2">{{ msg }}</h1>
    </template>

    <template #content>
      <p class="text-gray-600 text-left dark:text-gray-300 mb-4">
        Prepare for your exams
      </p>

      <ul class="text-sm text-left text-gray-700 dark:text-gray-300 space-y-2 mb-4">
        <li><i class="pi pi-check-circle text-green-500 mr-2"></i>Practice with quizzes and exercises</li>
        <li><i class="pi pi-book text-blue-500 mr-2"></i>Browse topics by course and week</li>
        <li><i class="pi pi-chart-line text-purple-500 mr-2"></i>Track your learning progress</li>
      </ul>

      <Divider />

      <p class="text-sm italic text-gray-500 mb-4">Login to continue</p>

      <Button icon="pi pi-user" label="Login" @click="$emit('open-login')" />
    </template>
  </Card>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
