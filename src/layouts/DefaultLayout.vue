<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useModalStore } from '../stores/modalStore';
import Login from "../components/ui/Login.vue";
import NavigationMenu from "../components/ui/NavigationMenu.vue";

const modalStore = useModalStore();
const { showLoginModal } = storeToRefs(modalStore);
</script>

<template>
  <div class="flex flex-row-reverse w-full h-screen bg-gray-50 overflow-auto">
    <!-- Handle open-login from NavigationMenu to control showLoginModal -->
    <NavigationMenu type="default" @open-login="showLoginModal = true" />
    <main class="w-full flex mt-14 md:mt-2">
      <router-view />
    </main>
    <!-- Pass showLoginModal to Login.vue to manage its visibility -->
    <Login v-model:visible="showLoginModal" key="login-modal" />
  </div>
</template>