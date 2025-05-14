<script setup lang="ts">
defineProps<{ msg: string }>()

defineEmits(['open-login'])
</script>

<template>
  <div class="flex flex-col items-center justify-center h-svh w-full bg-gray-50 dark:bg-gray-950">
    <img src="/ExplodingHead.svg" class="w-12 h-12 mb-4" alt="Logo" />
    <h1 class="text-2xl font-bold mb-2">{{ msg }}</h1>
    <p class="text-gray-600 mb-4">Prepare for your web development exams</p>
    <Button icon="pi pi-user" label="Login" @click="$emit('open-login')" />
  </div>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
