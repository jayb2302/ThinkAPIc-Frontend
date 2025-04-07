import { defineStore } from "pinia";
import { ref } from "vue";

export const useMessageStore = defineStore("message", () => {
  const successMessage = ref<string | null>(null);
  const errorMessage = ref<string | null>(null);

  // Show success message
  const showSuccess = (message: string) => {
    successMessage.value = message;
    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  };

  // Show error message
  const showError = (message: string) => {
    errorMessage.value = message;
    setTimeout(() => {
      errorMessage.value = null;
    }, 3000);
  };

  return { successMessage, errorMessage, showSuccess, showError };
});