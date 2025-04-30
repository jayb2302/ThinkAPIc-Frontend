<script setup lang="ts">
import MessageToast from "../components/ui/MessageToast.vue";
import NavigationMenu from "../components/ui/NavigationMenu.vue";

</script>
<template>
  <div class="flex flex-row-reverse w-full h-screen">
    <!-- Sidebar Navigation -->
    <NavigationMenu type="admin" />

    <!-- Main Content Area -->
    <main class="flex-1 p-6 bg-gray-100 overflow-auto">
      <MessageToast />
      <router-view />
    </main>
  </div>
</template>
