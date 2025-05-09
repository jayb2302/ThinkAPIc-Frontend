<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/authStore";
import { useCourseStore } from "../../stores/courseStore";
import { useTopicStore } from "../../stores/topicStore";
import { computed, onMounted, watchEffect, ref } from "vue";
import type { MenuItem } from "primevue/menuitem";
import { storeToRefs } from "pinia";
import { useModalStore } from "../../stores/modalStore";

const router = useRouter();
const props = defineProps<{
  type: "default" | "admin";
}>();

const modalStore = useModalStore();
const authStore = useAuthStore();
const { isAuthenticated, username, role, user, token } = storeToRefs(authStore);
const { fetchCurrentUser, logOut } = authStore;
const courseStore = useCourseStore ();

const showSidebar = ref(false);


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
  <!-- Mobile Sidebar and Toggle (visible only on mobile) -->
  <div class="block md:hidden mb-2">
    <div class="absolute top-4 right-4 z-50">
      <Button
        icon="pi pi-bars"
        @click="showSidebar = true"
        aria-label="Open Menu"
        class="p-button-rounded p-button-text"
      />
    </div>
    <Drawer v-model:visible="showSidebar" position="right" modal style="width: 25rem;">
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
          class="bg-gray-200 dark:bg-gray-600 text-white rounded-md shadow-md w-full"
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
          class="p-2"
          label="Logout"
          fluid
          severity="danger"
        />
      </div>
    </Drawer>
  </div>

  <!-- Desktop Sidebar -->
  <nav
    class="bg-gray-100 dark:bg-gray-800 p-2 space-y-4 min-w-80 flex-col items-start rounded hidden md:flex"
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
