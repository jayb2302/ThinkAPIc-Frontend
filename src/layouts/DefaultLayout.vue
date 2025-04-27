<script setup lang="ts">
import { useAuthStore } from "../stores/authStore";
import { useRouter } from "vue-router";
import { ref, computed } from "vue";
import Login from "../components/ui/Login.vue";
import type { MenuItem } from "primevue/menuitem";

const authStore = useAuthStore();
const router = useRouter();
const showLoginModal = ref(false);

const handleLogout = () => {
  authStore.logOut();
  router.push("/");
};

const items = computed<MenuItem[]>(() => [
  {
    label: "Home",
    icon: "pi pi-home",
    command: () => router.push("/"),
  },
  {
    label: "Courses",
    icon: "pi pi-book",
    command: () => router.push("/courses"),
  },
  {
    label: "Quizzes",
    icon: "pi pi-question-circle",
    command: () => router.push("/quizzes"),
  },
  {
    label: "Topics",
    icon: "pi pi-th-large",
    command: () => router.push("/topics"),
  },
  {
    label: "Admin",
    icon: "pi pi-cog",
    command: () => router.push("/admin"),
    visible: authStore.isAdmin,
  },
]);
</script>

<template>
  <div class="flex flex-row-reverse w-full h-screen bg-gray-50 overflow-auto">
    <nav class="bg-gray-100 dark:bg-gray-800 p-2 space-y-4 min-w-50">
      <div class="mb-4">
        <div v-if="authStore.isAuthenticated" class="capitalize">
          <span class="pi pi-graduation-cap pr-2"> </span>
          {{ authStore.user?.username }}
          <p class="flex flex-col">
            <span class="italic">
              {{ authStore.user?.role }}
            </span>
          </p>
        </div>
        <Button
          icon="pi pi-user"
          label="Login"
          v-else
          @click="showLoginModal = true"
          fluid
        >
        </Button>
      </div>
      <PanelMenu
        :model="items"
        class="bg-gray-200 text-white rounded-md shadow-md w-full"
      >
        <template #item="{ item }">
          <a v-ripple class="flex items-center px-4 py-2 cursor-pointer group">
            <span
              :class="[item.icon, 'text-primary-50 group-hover:text-blue-300']"
            />
            <span :class="['ml-2', { 'font-semibold': item.items }]">{{
              item.label
            }}</span>
          </a>
        </template>
      </PanelMenu>
      <Button
        v-if="authStore.isAuthenticated"
        @click="handleLogout"
        icon="pi pi-sign-out"
        class="p-2"
        label="Logout"
        fluid
        severity="danger"
      />
    </nav>
    <main class="w-full flex">
      <router-view />
    </main>
    <Login v-model:visible="showLoginModal" />
  </div>
</template>
