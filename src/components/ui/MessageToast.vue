<script setup lang="ts">
import { computed } from "vue";
import { useMessageStore } from "../../stores/messageStore";

const messageStore = useMessageStore();

// Computed properties to easily bind success/error messages
const successMessage = computed(() => messageStore.successMessage);
const errorMessage = computed(() => messageStore.errorMessage);
</script>

<template>
  <div v-if="successMessage" class="text-green-600">
    {{ successMessage }}
  </div>
  <div v-if="errorMessage" class="text-red-600">
    {{ errorMessage }}
  </div>
</template>
