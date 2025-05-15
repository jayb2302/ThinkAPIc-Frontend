<script setup lang="ts">
import NavigationMenu from "../components/ui/NavigationMenu.vue";
</script>

<template>
  <div class="flex flex-col md:flex-row w-full h-svh">
    <!-- Sidebar Navigation -->
    <div class="w-full md:w-3/12 sticky top-0 left-0 z-50">
      <NavigationMenu type="admin" />
    </div>
    <!-- Main Content Area -->
    <main class="w-full md:w-9/12 mt-14 md:mt-0">
      <router-view />
    </main>
  </div>
</template>
