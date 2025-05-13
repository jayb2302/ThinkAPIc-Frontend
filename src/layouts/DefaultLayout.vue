<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useModalStore } from "../stores/modalStore";
import Login from "../components/ui/Login.vue";
import NavigationMenu from "../components/ui/NavigationMenu.vue";

const modalStore = useModalStore();
const { showLoginModal } = storeToRefs(modalStore);
</script>

<template>
  <div
    class="flex flex-col md:flex-row-reverse h-svh w-full bg-gray-50 overflow-auto"
  >
    <!-- Sidebar NavigationMenu fixed only on md+ screens -->

    <NavigationMenu type="default" @open-login="showLoginModal = true" />

    <main class="w-full flex mt-14 md:mt-0 overflow-auto md:pl-80">
      <router-view />
    </main>

    <!-- Login Modal -->
    <Login v-model:visible="showLoginModal" key="login-modal" />
  </div>
</template>
