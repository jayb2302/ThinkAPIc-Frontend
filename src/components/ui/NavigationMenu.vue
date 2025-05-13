<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/authStore";
import { useCourseStore } from "../../stores/courseStore";
import { useTopicStore } from "../../stores/topicStore";
import { computed, onMounted, watchEffect, ref } from "vue";
import type { MenuItem } from "primevue/menuitem";
import { storeToRefs } from "pinia";
import { useModalStore } from "../../stores/modalStore";
import { useKeyboardShortcuts } from "../../utils/useKeyboardShorts";

const router = useRouter();
const props = defineProps<{
  type: "default" | "admin";
}>();

// Keyboard shortcuts
const modalStore = useModalStore();
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
  if (currentPath.startsWith('/courses/')) {
    expandedKeys.value['Courses'] = true;
  }
  if (currentPath.startsWith('/topics/')) {
    expandedKeys.value['Topics'] = true;
  }
});

const navigate = (path: string) => async () => {
  await router.push(path);
  showSidebar.value = false;
};

// Register keyboard shortcuts after navigate is defined
useKeyboardShortcuts([
  { combo: '⌃+H', callback: navigate('/') },
  { combo: '⌃+Q', callback: navigate(props.type === 'admin' ? '/admin/quizzes' : '/quizzes') },
  { combo: '⌃+T', callback: navigate('/topics') },
  { combo: '⌃+A', callback: navigate('/admin') },
]);

const items = computed<MenuItem[]>(() => {
  if (props.type === "admin") {
    return [
      { label: "Home", icon: "pi pi-home", shortcut: "⌃+H", command: navigate("/") },
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
      { label: "Home", icon: "pi pi-home", command: navigate("/"), shortcut: "⌃+H" },
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

const logout = () => {
  logOut();
  navigate("/");
};
</script>

<template>
  <!-- Mobile Sidebar and Toggle -->
  <div class=" md:hidden w-full">
    <div class="flex absolute top-0 w-full left-0 bg-gradient-to-b from-gray-400 to-gray-50  dark:from-gray-800 dark:to-gray-950 justify-between p-2">
      <div class="mobile-navigation flex items-center gap-2">
        <img
          src="/ExplodingHead.svg"
          alt="Logo"
          @click="navigate('/')"
          class="w-10 h-10 rounded-full shadow-md "
        />
        <h1 class="text-2xl font-bold text-gray-800 dark:text-white">
          ThinkAPIc
        </h1>
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
          :expandedKeys="expandedKeys"
          @update:expandedKeys="val => expandedKeys = val"
          class="bg-gray-200 dark:bg-gray-950 text-white rounded-md shadow-md w-full"
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
    class="bg-gray-100 dark:bg-gray-950 p-2 space-y-4 min-w-80 h-full flex-col items-start rounded hidden md:flex md:fixed md:top-0 md:left-0 md:z-50"
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
      :expandedKeys="expandedKeys"
      @update:expandedKeys="val => expandedKeys = val"
      class="bg-gray-200 dark:bg-gray-900 text-white rounded-md shadow-md w-full"
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
      class="p-2 "
      label="Logout"
      fluid
      severity="danger"
    />
  </nav>
</template>
