<script setup>
import { ref, onMounted } from "vue";
import Courses from "./Courses.vue";
import ProgressLog from "../components/users/ProgressLog.vue";
import Topics from "./Topics.vue";
import { useAuthStore } from "../stores/authStore";

const authStore = useAuthStore();
const selectedWeek = ref(null);

const selectedTab = ref('0');

const tabs = [
  { title: 'Courses', value: '0' },
  { title: 'Topics', value: '1' },
  { title: 'Progress', value: '2' },
];
</script>
<template>
  <div class="bg-gray-50 dark:bg-gray-950 w-full h-svh overflow-auto">
    <div
      v-if="!authStore.user"
      class="flex flex-col items-center justify-center h-full"
    >
      <h1 class="text-2xl font-bold">Welcome to ThinkAPIc</h1>
      <p class="text-gray-600">Prepare for your web development exams</p>
    </div>

    <div v-if="authStore.user" class="space-y-4">
      <Tabs v-model="selectedTab" value="0" class="w-full">
        <TabList>
          <Tab v-for="tab in tabs" :key="tab.value" :value="tab.value">{{ tab.title }}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <Courses />
          </TabPanel>
          <TabPanel value="1">
            <Topics :week="selectedWeek" />
          </TabPanel>
          <TabPanel value="2">
            <ProgressLog />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <div v-else class="text-gray-500 mt-4">
      Please log in to see your progress and available courses.
    </div>
  </div>
</template>
