<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/userStore";
import { storeToRefs } from "pinia";
import MessageToast from "../components/ui/MessageToast.vue";
import type { MenuItem } from "primevue/menuitem";
import { ref } from "vue";

const router = useRouter();
const userStore = useUserStore();
const { role } = storeToRefs(userStore);

// ✅ Redirect if user is NOT an admin
if (role.value !== "admin") {
  console.warn("⛔ Access Denied: Redirecting Non-Admin User");
  router.push("/");
}

// ✅ Logout Function
const logout = () => {
  userStore.logout();
  router.push("/");
};

const items = ref<MenuItem[]>([
  {
    label: "Dashboard",
    icon: "pi pi-home",
    command: () => router.push("/admin"),
  },
  {
    label: "Quizzes",
    icon: "pi pi-book",
    command: () => router.push("/admin/quizzes"),
  },
  {
    label: "Topics",
    icon: "pi pi-list",
    command: () => router.push("/admin/topics"),
  },
  {
    label: "Courses",
    icon: "pi pi-briefcase",
    command: () => router.push("/admin/courses"),
  },
  {
    label: "Users",
    icon: "pi pi-users",
    command: () => router.push("/admin/users"),
  },
]);
</script>
<template>
  <div class="flex flex-row-reverse w-full h-screen">
    <!-- Sidebar Navigation -->
    <nav
      class="flex flex-col justify-start items-baseline rounded bg-gray-100 dark:bg-gray-800 p-2 space-y-4 min-w-50"
    >
      <div v-if="userStore.isAuthenticated" class="capitalize">
        <span class="pi pi-star pr-2"> </span>
        {{ userStore.user?.username }}
        <p class="flex flex-col">
          <span class="italic">
            {{ userStore.role }}
          </span>
        </p>
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
        icon="pi pi-sign-out"
        label="Logout"
        @click="logout"
        severity="danger"
        class="bg-red-100 hover:bg-red-300 text-gray-800 p-2 rounded-md"
        fluid
      />
    </nav>

    <!-- Main Content Area -->
    <main class="flex-1 p-6 bg-gray-100 overflow-auto">
      <MessageToast />
      <router-view />
    </main>
  </div>
</template>
