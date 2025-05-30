<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import { formatDateTime } from "../../utils/formatDate";
import { useProgressStore } from "../../stores/progressStore";
import { useTopicStore } from "../../stores/topicStore";
import { useAuthStore } from "../../stores/authStore";
import TopicQuizzes from "../quizzes/TopicQuizzes.vue";
import { storeToRefs } from "pinia";

const progressStore = useProgressStore();
const { completedTopics, courseOptions, totalQuizzesCompleted, correctRate, topicsCompletionRate } = storeToRefs(progressStore);
const topicStore = useTopicStore();
const totalTopics = computed(() => topicStore.topics.length);
const authStore = useAuthStore();

const showDialog = ref(false);
const selectedTopicForRetake = ref<{
  topicId: string;
  courseId: string;
} | null>(null);

const selectedCourseId = ref<string | null>(null);

const filteredTopics = computed(() => {
  if (!selectedCourseId.value) return progressStore.completedTopics;
  return progressStore.completedTopics.filter(
    (topic) => topic.courseId === selectedCourseId.value
  );
});

onMounted(() => {
  if (authStore.user) {
    progressStore.fetchProgress(authStore.user._id);
  }
});

const openRetakeDialog = (topicId: string, courseId: string) => {
  selectedTopicForRetake.value = { topicId, courseId };
  showDialog.value = true;
};
</script>

<template>
  <div class="p-0 mt-4">
    <h2 class="text-2xl font-bold mb-4">Progress</h2>

    <div
      v-if="progressStore.logs.length === 0"
      class="text-gray-500 dark:text-gray-300"
    >
      No quiz attempts yet.
    </div>
    
    <div v-else class="mb-6">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
    
        <Card>
          <template #title>Completed Quizzes</template>
          <template #content>
            <p class="text-2xl font-bold text-center">
              {{ totalQuizzesCompleted }}
            </p>
          </template>
        </Card>
        
        <Card>
          <template #title>Completed Topics</template>
          <template #content>
            <ProgressBar :value="topicsCompletionRate" showValue class="mb-2" />
            <p class="text-sm text-gray-500 text-center">
              {{ completedTopics.length }} / {{ totalTopics }}
            </p>
          </template>
        </Card>

        <Card>
          <template #title>Correct Answer Rate</template>
          <template #content>
            <ProgressBar :value="correctRate" showValue class="mb-2" />
            <p class="text-sm text-gray-500 text-center">{{ correctRate }}%</p>
          </template>
        </Card>
      </div>
      <Select
        v-model="selectedCourseId"
        :options="courseOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Filter by Course"
        showClear
        class="mb-4 w-full sm:w-64"
      />

      <div
        class="grid sm:grid sm:grid-col-1 md:grid-cols-3 lg:grid-cols-2 gap-4"
      >
        <Card
          v-for="topic in filteredTopics"
          :key="topic.topicId"
          class="!shadow-md dark:!shadow-gray-800"
        >
          <template #title>
            {{ topic.topicTitle }}
          </template>
          <template #content>
            <Badge
              v-if="topic.isCompleted"
              value="✔ Completed"
              severity="success"
            />
            <Badge v-else value="⌛︎ In Progress" severity="warning" />
            <p class="mb-2">
              <span class="font-semibold">Course:</span>
              {{ topic.courseTitle }}
            </p>
            <p class="mb-2">
              <span class="font-semibold">Quizzes Completed:</span>
              {{ topic.quizzesCompleted }} / {{ topic.totalQuizzes }}
            </p>
            <p class="">
              <i class="pi pi-calendar mr-1"></i>
              {{ formatDateTime(topic.lastCompletedAt) }}
            </p>
            <div class="mt-3 flex flex-col gap-2 justify-between">
              <Button
                v-if="!topic.isCompleted"
                label="Retake Quiz"
                icon="pi pi-refresh"
                severity="secondary"
                @click="openRetakeDialog(topic.topicId, topic.courseId)"
              />
            </div>
          </template>
        </Card>
      </div>
    </div>
    <TopicQuizzes
      v-if="selectedTopicForRetake"
      v-model:visible="showDialog"
      :topic-id="selectedTopicForRetake.topicId"
      :course-id="selectedTopicForRetake.courseId"
    />
  </div>
</template>
