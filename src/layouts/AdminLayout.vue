<script setup lang="ts">
import NavigationMenu from "../components/ui/NavigationMenu.vue";

</script>
<template>
  <div class="flex flex-row-reverse h-svh bg-gray-50 overflow-auto">
    <!-- Sidebar Navigation -->
    <div class="md:block fixed top-0 left-0 h-full w-full ">
    <NavigationMenu type="admin" />
    </div>
    <!-- Main Content Area -->
    <main class="w-full flex mt-14 md:mt-0 overflow-auto md:pl-80">
      <router-view />
    </main>
  </div>
</template>
