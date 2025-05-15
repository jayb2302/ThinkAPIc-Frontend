<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useQuizStore } from "../../stores/quizStore";
import { useTopicStore } from "../../stores/topicStore";
import { useCourseStore } from "../../stores/courseStore";
import { storeToRefs } from "pinia";
import QuizCard from "../quizzes/QuizCard.vue";

const quizStore = useQuizStore();
const { loading, error } = storeToRefs(quizStore);

const topicStore = useTopicStore();
const { topics } = storeToRefs(topicStore);

const courseStore = useCourseStore();
const { courses } = storeToRefs(courseStore);

const selectedTopic = ref<string | null>(null);
const selectedCourse = ref<string | null>(null);

const showAnswers = ref(false);

const filteredQuizzes = computed(() =>
  quizStore.filterQuizzesByCourseAndTopic(
    selectedCourse.value,
    selectedTopic.value
  )
);

onMounted(async () => {
  await quizStore.fetchQuizzes();
  await topicStore.fetchTopics();
  await courseStore.fetchCourses();
});

const mapTopics = (topicsList: typeof topics.value) =>
  topicsList.map((t) => ({
    label: t.title,
    value: t._id,
  }));

const topicOptions = computed(() => {
  const filteredTopics = selectedCourse.value
    ? topics.value.filter((t) => t.course?._id === selectedCourse.value)
    : topics.value;

  return mapTopics(filteredTopics);
});

const courseOptions = computed(() =>
  courses.value.map((c) => ({
    label: c.title,
    value: c._id,
  }))
);

// Reset topic when course changes
watch(selectedCourse, () => {
  selectedTopic.value = null;
});
</script>

<template>
  <div class="p-2 w-full text-gray-700">
    <h2 class="text-2xl font-bold mb-4">Time to Quiz Yourself</h2>

    <div class="flex items-center gap-2 mb-4">
      <ToggleSwitch v-model="showAnswers" />
      <label class="text-sm font-medium">Show Answers</label>
    </div>

    <div
      class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4"
    >
      <div class="filter-wrapper space-y-2 md:space-x-2">
        <Select
          v-model="selectedTopic"
          :options="topicOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Filter by Topic"
          class="w-full md:w-64"
          clearable
        />
        <Select
          v-model="selectedCourse"
          :options="courseOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Filter by Course"
          class="w-full md:w-64"
          clearable
        />
      </div>
    </div>

    <div v-if="error" class="text-red-500">{{ error }}</div>

    <DataView
      v-if="!error"
      :value="loading ? Array(6).fill({}) : filteredQuizzes"
      paginator
      :rows="4"
      layout="grid"
      dataKey="_id"
      :loading="loading"
      class="overflow-auto"
    >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="text-xl font-bold">Quizzes</span>
          <Button
            icon="pi pi-filter-slash"
            aria-label="Clear"
            rounded
            outlined
            raised
            @click="
              () => {
                selectedTopic = null;
                selectedCourse = null;
              }
            "
          />
        </div>
      </template>

      <template #grid="slotProps">
        <div
          class="grid grid-cols-1 h-[calc(100vh-20rem)] overflow-auto sm-grid-col-2  gap-4 w-full"
        >
          <QuizCard
            v-for="(quiz, index) in slotProps.items"
            :key="quiz._id || index"
            :quiz="quiz"
            :loading="loading"
            :show-answers="showAnswers"
          />
        </div>
      </template>

      <template #empty>
        <div class="text-center text-gray-400 text-sm py-4 italic">
          <span v-if="loading">Loading quizzes...</span>
          <span v-else>No quizzes found for the selected filters.</span>
        </div>
      </template>

      <!-- Footer -->
      <template #footer>
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray-500">
            {{ filteredQuizzes.length }} quizzes found
          </p>
        </div>
      </template>
    </DataView>
  </div>
</template>
