<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useModalStore } from "../stores/modalStore";
import Login from "../components/ui/Login.vue";
import NavigationMenu from "../components/ui/NavigationMenu.vue";

const modalStore = useModalStore();
const { showLoginModal } = storeToRefs(modalStore);
</script>

<template>
  <div class="flex flex-row-reverse h-svh bg-gray-50 overflow-auto">
    <!-- Sidebar NavigationMenu fixed only on md+ screens -->
    <div class="md:block fixed top-0 left-0 h-full w-full ">
      <NavigationMenu type="default" @open-login="showLoginModal = true" />
    </div>

    <main class="w-full flex mt-14 md:mt-0 overflow-auto md:pl-80">
      <router-view />
    </main>

    <!-- Login Modal -->
    <Login v-model:visible="showLoginModal" key="login-modal" />
  </div>
</template>
