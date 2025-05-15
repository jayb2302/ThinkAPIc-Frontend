import { defineStore } from "pinia";
import { ref } from "vue";

export const useModalStore = defineStore("modal", () => {
  const showLoginModal = ref(false);
  return { showLoginModal };
});

export type ModalStore = ReturnType<typeof useModalStore>;
