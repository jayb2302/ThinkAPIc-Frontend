<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/authStore";
import { useCourse } from "../../stores/courseStore";
import { useTopicStore } from "../../stores/topicStore";
import { computed, onMounted, watchEffect } from "vue";
import type { MenuItem } from "primevue/menuitem";
import { storeToRefs } from "pinia";
import { useModalStore } from '../../stores/modalStore';
const modalStore = useModalStore();

const router = useRouter();
const props = defineProps<{
  type: "default" | "admin";
}>();

const authStore = useAuthStore();
const { isAuthenticated, username, role, user, token } = storeToRefs(authStore);
const { fetchCurrentUser, logOut } = authStore;
const courseStore = useCourse();
const topicStore = useTopicStore();

// Fetch courses and topics when needed
onMounted(() => {
  if (props.type === "default") {
    courseStore.fetchCourses();
    topicStore.fetchTopics();
  }
});

// For admin login checks
watchEffect(async () => {
  if (props.type === "admin") {
    if (!user.value && token.value) {
      await fetchCurrentUser();
    }
    if (user.value && user.value.role !== "admin") {
      console.log("⛔ Access Denied: Redirecting Non-Admin User");
      router.push("/");
    }
  }
});

const logout = () => {
  logOut();
  if (props.type === "admin") {
    router.push("/");
  }
};

const items = computed<MenuItem[]>(() => {
  if (props.type === "admin") {
    return [
      { label: "Home", icon: "pi pi-home", command: () => router.push("/") },
      {
        label: "Dashboard",
        icon: "pi pi-th-large",
        items: [
          {
            label: "Manage Quizzes",
            icon: "pi pi-question-circle",
            command: () => router.push("/admin/quizzes"),
          },
          {
            label: "Manage Topics",
            icon: "pi pi-list",
            command: () => router.push("/admin/topics"),
          },
          {
            label: "Manage Courses",
            icon: "pi pi-briefcase",
            command: () => router.push("/admin/courses"),
          },
          {
            label: "Manage Users",
            icon: "pi pi-users",
            command: () => router.push("/admin/users"),
          },
        ],
      },
      // { label: "Quizzes", icon: "pi pi-book", command: () => router.push("/admin/quizzes") },
      // { label: "Topics", icon: "pi pi-list", command: () => router.push("/admin/topics") },
      // { label: "Courses", icon: "pi pi-briefcase", command: () => router.push("/admin/courses") },
      // { label: "Users", icon: "pi pi-users", command: () => router.push("/admin/users") },
    ];
  } else {
    return [
      { label: "Home", icon: "pi pi-home", command: () => router.push("/") },
      {
        label: "Courses",
        icon: "pi pi-book",
        items: courseStore.courses.map((course) => ({
          label: course.title,
          items: (course.topics || []).map((topicId) => ({
            label: topicStore.getTopicTitleById(topicId),
            command: () => router.push(`/topics/${topicId}`),
          })),
        })),
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
    ];
  }
});
</script>

<template>
  <nav
    class="bg-gray-100 dark:bg-gray-800 p-2 space-y-4 min-w-80 flex flex-col items-start rounded"
  >
    <div v-if="isAuthenticated" class="capitalize">
      <span class="pi pi-user pr-2"></span>
      {{ username }}
      <p class="flex flex-col italic">{{ role }}</p>
    </div>
    <Button
      v-else
      icon="pi pi-user"
      label="Login"
      @click="modalStore.showLoginModal = true"
      class="p-2"
      fluid
    />
    <PanelMenu
      :model="items"
      class="bg-gray-200 dark:bg-gray-600 text-white rounded-md shadow-md w-full"
    >
      <template #item="{ item }">
        <a v-ripple class="flex items-center px-4 py-2 cursor-pointer group">
          <span
            :class="[item.icon, 'text-primary-50 group-hover:text-blue-300']"
          />
          <span :class="['ml-2', { 'font-semibold': item.items }]">{{
            item.label
          }}</span>
          <span
            v-if="item.items"
            class="pi pi-angle-down text-primary ml-auto"
          />
        </a>
      </template>
    </PanelMenu>
    <Button
      v-if="isAuthenticated"
      @click="logout"
      icon="pi pi-sign-out"
      class="p-2"
      label="Logout"
      fluid
      severity="danger"
    />
  </nav>
</template>
