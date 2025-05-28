<script setup>
import { ref, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import Courses from "./Courses.vue";
import ProgressLog from "../components/users/ProgressLog.vue";
import Topics from "./Topics.vue";
import { useAuthStore } from "../stores/authStore";
import { useModalStore } from "../stores/modalStore";
import WelcomeThinkapic from "../components/WelcomeThinkapic.vue";

const modalStore = useModalStore();
const { showLoginModal } = storeToRefs(modalStore);
const authStore = useAuthStore();
const selectedWeek = ref(null);

const selectedTab = ref("0");

const tabs = [
  { title: "Courses", value: "0" },
  { title: "Topics", value: "1" },
  { title: "Progress", value: "2" },
];
</script>

<template>
  <div class="flex flex-col items-center justify-center w-full">
    <div v-if="!authStore.user">
      <WelcomeThinkapic
        @open-login="showLoginModal = true"
        msg="Welcome to Thinkapic"
      />
    </div>
    <div
      v-if="authStore.isAuthenticated"
      class="space-y-4 h-svh overflow-auto w-full"
      data-testid="home-authenticated"
    >
      <Tabs v-model="selectedTab" value="0" class="w-full">
        <TabList>
          <Tab v-for="tab in tabs" :key="tab.value" :value="tab.value">{{
            tab.title
          }}</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="0">
            <Courses />
          </TabPanel>
          <TabPanel value="1">
            <Topics :week="selectedWeek" :active="selectedTab === '1'" />
          </TabPanel>
          <TabPanel value="2">
            <ProgressLog />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>
