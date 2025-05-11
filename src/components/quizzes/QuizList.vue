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

// // manually trigger loading
// onMounted(async () => {
//   loading.value = true;

//   setTimeout(async () => {
//     await quizStore.fetchQuizzes();
//     await topicStore.fetchTopics();
//     await courseStore.fetchCourses();
//     loading.value = false; // stop loading after data is fetched
//   }, 2000); // 2 second fake delay
// });

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
  <div
    class="p-2 bg-gray-100 dark:bg-gray-600 min-h-screen w-full text-gray-700"
  >
    <h2 class="text-2xl font-bold mb-4">Available Quizzes</h2>

    <div class="flex flex-col md:flex-row md:items-center gap-4 mb-6">
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

    <div v-if="error" class="text-red-500">{{ error }}</div>

    <div v-if="!loading && !filteredQuizzes.length" class="mt-6 px-2 text-gray-500">
      No quizzes found.
    </div>
    <DataView
      v-if="loading || filteredQuizzes.length"
      :value="loading ? Array(6).fill({}) : filteredQuizzes"
      paginator
      :rows="6"
      layout="grid"
      dataKey="_id"
    >
      <template #grid="slotProps">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <QuizCard
            :quiz="quiz"
            :loading="loading"
            v-for="(quiz, index) in slotProps.items"
            :key="quiz._id || index"
          />
        </div>
      </template>
      
    </DataView>

    
  </div>
</template>
