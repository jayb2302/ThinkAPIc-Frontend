<script setup lang="ts">
import { onMounted, computed, ref } from "vue";
import { formatDateTime } from "../../utils/formatDate";
import { useProgressStore } from "../../stores/progressStore";
import { useAuthStore } from "../../stores/authStore";
import TopicQuizzes from "../quizzes/TopicQuizzes.vue";

const progressStore = useProgressStore();
const authStore = useAuthStore();

const showDialog = ref(false);
const selectedTopicForRetake = ref<{
  topicId: string;
  courseId: string;
} | null>(null);

const completedTopics = computed(() => progressStore.completedTopics);

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
  <div class="">
    <h2 class="text-2xl font-bold">Your Progress</h2>

    <div v-if="progressStore.logs.length === 0" class="text-gray-500">
      No quiz attempts yet.
    </div>

    <div v-else class="overflow-x-auto mb-6 ">
      <div
        class="flex sm:grid sm:grid-rows-1 md:grid-cols-3 lg:grid-cols-2 gap-4"
      >
        <Card
          v-for="topic in completedTopics"
          :key="topic.topicId"
          class="shadow-md min-w-[20rem] "
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
            <p class="mb-2">
              <span class="font-semibold">Last Activity:</span>
              {{ formatDateTime(topic.lastCompletedAt) }}
            </p>
            <div class="mt-3 flex flex-col gap-2 justify-between">
              <Button
                v-if="!topic.isCompleted"
                label="Retake Quiz"
                icon="pi pi-refresh"
                severity="info"
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
