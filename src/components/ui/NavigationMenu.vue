<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed, onMounted, watchEffect, ref } from "vue";
import { storeToRefs } from "pinia";
import { useAppToast } from "../../services/toastService";
import { useAuthStore } from "../../stores/authStore";
import { useCourseStore } from "../../stores/courseStore";
import { useTopicStore } from "../../stores/topicStore";
import type { MenuItem } from "primevue/menuitem";
import { useKeyboardShortcuts } from "../../utils/useKeyboardShorts";

const router = useRouter();
const props = defineProps<{
  type: "default" | "admin";
}>();

const toast = useAppToast();

const authStore = useAuthStore();
const { isAuthenticated, username, role, user, token } = storeToRefs(authStore);
const { fetchCurrentUser, logOut } = authStore;
const courseStore = useCourseStore();

const showSidebar = ref(false);
const expandedKeys = ref<{ [key: string]: boolean }>({});

defineEmits(["open-login"]);

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

watchEffect(() => {
  const currentPath = router.currentRoute.value.path;
  if (currentPath.startsWith("/courses/")) {
    expandedKeys.value["Courses"] = true;
  }
  if (currentPath.startsWith("/topics/")) {
    expandedKeys.value["Topics"] = true;
  }
});

const navigate = (path: string) => async () => {
  await router.push(path);
  showSidebar.value = false;
};

// Keyboard shortcuts
useKeyboardShortcuts([
  { combo: "⌃+H", callback: navigate("/") },
  {
    combo: "⌃+Q",
    callback: navigate(props.type === "admin" ? "/admin/quizzes" : "/quizzes"),
  },
  { combo: "⌃+T", callback: navigate("/topics") },
  { combo: "⌃+A", callback: navigate("/admin") },
]);

const items = computed<MenuItem[]>(() => {
  if (props.type === "admin") {
    return [
      {
        label: "Home",
        icon: "pi pi-home",
        shortcut: "⌃+H",
        command: navigate("/"),
      },
      {
        label: "Dashboard",
        icon: "pi pi-th-large",
        items: [
          {
            label: "Manage Quizzes",
            icon: "pi pi-question-circle",
            command: navigate("/admin/quizzes"),
          },
          {
            label: "Manage Topics",
            icon: "pi pi-list",
            command: navigate("/admin/topics"),
          },
          {
            label: "Manage Courses",
            icon: "pi pi-briefcase",
            command: navigate("/admin/courses"),
          },
          {
            label: "Manage Users",
            icon: "pi pi-users",
            command: navigate("/admin/users"),
          },
        ],
      },
    ];
  } else {
    return [
      {
        label: "Home",
        icon: "pi pi-home",
        command: navigate("/"),
        shortcut: "⌃+H",
      },
      {
        label: "Courses",
        icon: "pi pi-book",
        key: "Courses",
        items: courseStore.courses.map((course) => ({
          label: course.title,
          key: `course-${course._id}`,
          command: navigate(`/courses/${course._id}`),
        })),
      },
      {
        label: "Topics",
        icon: "pi pi-th-large",
        key: "Topics",
        items: courseStore.courses.map((course) => ({
          label: course.title,
          key: `topics-course-${course._id}`,
          items: (course.topics || []).map((topicId) => ({
            label: topicStore.getTopicTitleById(topicId),
            key: `topic-${topicId}`,
            command: navigate(`/topics/${topicId}`),
          })),
        })),
      },
      {
        label: "Quizzes",
        shortcut: "⌃+Q",
        icon: "pi pi-question-circle",
        command: navigate("/quizzes"),
      },
      {
        label: "Admin",
        icon: "pi pi-cog",
        shortcut: "⌃+A",
        command: navigate("/admin"),
        visible: authStore.isAdmin,
      },
    ];
  }
});

const logout = async () => {
  logOut();
  toast.info("See you next time!");
  await navigate("/")();
};
</script>

<template>
  <!-- Mobile Sidebar and Toggle -->
  <div class="md:hidden w-full">
    <div
      class="flex absolute top-0 w-full left-0 bg-gradient-to-b from-gray-400 to-gray-50 dark:from-gray-800 dark:to-gray-950 justify-between p-2"
    >
      <div class="mobile-navigation flex items-center gap-2">
        <RouterLink to="/" class="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            class="w-8 h-8 text-gray-950 dark:text-gray-100"
            fill="currentColor"
          >
            <g fill="currentColor">
              <path
                d="M20.092 3.192A4.97 4.97 0 0 0 15.97 1c-1.716 0-3.229.87-4.122 2.192A4 4 0 0 0 8.97 1.97c-.972 0-1.862.346-2.555.922A2.5 2.5 0 0 1 5.086 6.93A4 4 0 0 0 9.07 9.97a3.99 3.99 0 0 0 4.447 2.938c.291.991.454 2.042.454 3.063l4-.03c0-1.018.157-2.055.438-3.03q.276.04.562.04a3.99 3.99 0 0 0 3.862-2.982l.138.002a4 4 0 0 0 3.556-2.167a2.5 2.5 0 0 1-.452-4.356A4 4 0 0 0 22.97 1.97c-1.13 0-2.15.469-2.878 1.222m2.02 4.308a3.98 3.98 0 0 0-3.142-1.53a3.98 3.98 0 0 0-3.02 1.382a3.98 3.98 0 0 0-3.02-1.382A3.98 3.98 0 0 0 9.788 7.5h-.573a3.99 3.99 0 0 1 6.735-1.148A3.992 3.992 0 0 1 22.685 7.5z"
              />
              <path
                d="M19.18 13.946a10 10 0 0 0-.21 1.947c4.351-.238 7.01-1.005 7.01-1.923c0-.622-1.24-1.18-3.417-1.548a4.97 4.97 0 0 1-3.382 1.524M6.02 13.97c0 .903 2.646 1.67 6.95 1.917a10 10 0 0 0-.221-1.94a4.97 4.97 0 0 1-3.394-1.506c-2.123.367-3.335.917-3.335 1.529"
              />
              <path
                d="M5.858 12.117c.76-.29 1.672-.513 2.74-.68a5 5 0 0 1-.253-.506a5 5 0 0 1-2.376-.961q-.43.128-.824.278c-1.288.491-2.346 1.188-3.076 2.185C1.333 13.437 1 14.652 1 16.05c0 4.065 1.225 7.825 3.762 10.58c2.55 2.768 6.332 4.42 11.238 4.42c4.902 0 8.684-1.655 11.234-4.424C29.772 23.871 31 20.111 31 16.05c0-1.225-.355-2.33-1.082-3.274a6 6 0 0 0-.991-1.003a2 2 0 0 1-2.912-1.524l-.3-.1a5 5 0 0 1-2.162.787q-.146.337-.337.646q1.698.331 2.893.842c1.06.454 1.775.99 2.225 1.573c.439.57.666 1.238.666 2.053c0 3.67-1.107 6.91-3.237 9.221C23.646 27.57 20.428 29.05 16 29.05c-4.434 0-7.651-1.478-9.767-3.775C4.105 22.965 3 19.725 3 16.05c0-1.072.25-1.846.682-2.435c.437-.597 1.13-1.1 2.176-1.498"
              />
              <path
                d="M11.97 21.94a2 2 0 1 0 0-4a2 2 0 0 0 0 4m8 0a2 2 0 1 0 0-4a2 2 0 0 0 0 4m-6.47 3.5c0 1.36 1.11 2.47 2.47 2.47s2.47-1.11 2.47-2.47s-1.11-2.47-2.47-2.47s-2.47 1.11-2.47 2.47M4.47 5.85a1.38 1.38 0 1 0 0-2.76a1.38 1.38 0 0 0 0 2.76M29 5.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0M3 10a1 1 0 1 0 0-2a1 1 0 0 0 0 2m25 1a1 1 0 1 0 0-2a1 1 0 0 0 0 2"
              />
            </g>
          </svg>
          <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
            ThinkAPIc
          </h1>
        </RouterLink>
      </div>
      <Button
        icon="pi pi-bars"
        @click="showSidebar = true"
        aria-label="Open Menu"
        class="p-button-rounded p-button-text"
      />
    </div>
    <Drawer
      v-model:visible="showSidebar"
      position="right"
      modal
      style="width: 25rem"
      class="bg-gray-50 dark:!bg-gray-950"
    >
      <template #header>
        <div class="flex justify-between items-center w-full">
          <span class="text-lg font-semibold">Menu</span>
        </div>
      </template>
      <div class="space-y-4 flex flex-col items-start">
        <div v-if="isAuthenticated" class="capitalize flex items-baseline">
          <Avatar class="mr-2 !bg-gray-100 dark:!bg-gray-900" shape="circle">
            <i
              :class="role === 'admin' ? 'pi pi-cog' : 'pi pi-graduation-cap'"
              class=""
            />
          </Avatar>

          <p class="font-bold">
            {{ username }} - <span class="font-medium">{{ role }} </span>
          </p>
        </div>

        <PanelMenu
          :model="items"
          :expandedKeys="expandedKeys"
          @update:expandedKeys="(val) => (expandedKeys = val)"
          class="bg-gray-50 dark:bg-gray-950 text-white rounded-md shadow-md w-full"
        >
          <template #item="{ item }">
            <a
              v-ripple
              class="flex items-center px-4 py-2 cursor-pointer group"
            >
              <span
                :class="[
                  item.icon,
                  'text-primary-50 group-hover:text-blue-300',
                ]"
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
          class="p-2 dark:!text-gray-200"
          label="Logout"
          fluid
          severity="danger"
        />
      </div>
    </Drawer>
  </div>

  <!-- Desktop Sidebar -->
  <nav
    class="bg-gray-50 dark:bg-gray-950 p-2 space-y-4 md:w-3/12 h-full flex-col items-start rounded hidden md:flex md:fixed md:top-0 md:left-0 md:z-50"
  >
    <div v-if="isAuthenticated" class="capitalize flex items-baseline">
      <Avatar
        :label="username?.charAt(0).toUpperCase()"
        class="mr-2 bg-gray-500"
        shape="circle"
      />
      <p class="font-bold">
        {{ username }} - <span class="font-medium">{{ role }} </span>
      </p>
    </div>

    <PanelMenu
      :model="items"
      :expandedKeys="expandedKeys"
      @update:expandedKeys="(val) => (expandedKeys = val)"
      class="bg-gray-50 dark:bg-gray-900 text-white rounded-md shadow-md w-full"
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
          <span
            v-if="item.shortcut"
            class="text-xs text-gray-400 shadow-sm p-1 rounded-md border-gray-300 ml-auto"
            >{{ item.shortcut }}</span
          >
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
