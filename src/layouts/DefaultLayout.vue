<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useModalStore } from "../stores/modalStore";
import { useAuthStore } from "../stores/authStore";
import Login from "../components/ui/Login.vue";
import NavigationMenu from "../components/ui/NavigationMenu.vue";

const modalStore = useModalStore();
const { showLoginModal } = storeToRefs(modalStore);
const authStore = useAuthStore();
</script>

<template>
  <div
    :class="[
      '',
      authStore.user
        ? 'flex flex-col md:flex-row w-full h-svh'
        : 'flex flex-col items-center justify-center w-full h-svh',
    ]"
  >
    <div class="w-full md:w-3/12 sticky top-0 left-0 z-50">
      <NavigationMenu
        v-if="authStore.user"
        type="default"
        @open-login="showLoginModal = true"
      />
    </div>

    <main
      :class="[
        authStore.user
          ? 'w-full md:w-9/12 mt-14 md:mt-0'
          : 'w-full h-full flex items-center justify-center',
      ]"
    >
      <router-view />
    </main>

    <!-- Login Modal -->
    <Login v-model:visible="showLoginModal" key="login-modal" />
  </div>
</template>
