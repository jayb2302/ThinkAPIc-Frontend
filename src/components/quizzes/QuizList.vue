<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useQuizStore } from "../../stores/quizStore";
import { useTopicStore } from "../../stores/topicStore";
import { useCourseStore } from "../../stores/courseStore";
import { storeToRefs } from "pinia";

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
  <div class="p-6 bg-gray-100 dark:bg-gray-600 min-h-screen w-full text-gray-700">
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
    <DataView
      :value="loading ? Array(6).fill({}) : filteredQuizzes"
      paginator
      :rows="6"
      layout="grid"
      dataKey="_id"
    >
      <template #grid="slotProps">
        <div class="flex w-full flex-wrap">
          <div
            v-for="(quiz, index) in slotProps.items"
            :key="quiz._id || index"
            class="flex w-1/2 p-2"
          >
            <div
              class="p-4 border-1 surface-border flex-1 surface-card border-sm rounded-sm shadow-2 hover:shadow-4 transition-shadow duration-150"
            >
              <template v-if="loading">
                <Skeleton width="8rem" height="1.5rem" class="mb-2" />
                <Skeleton width="100%" height="1.5rem" class="mb-4" />
                <Skeleton width="60%" height="1rem" class="mb-2" />
                <Skeleton width="40%" height="1rem" />
              </template>
              <template v-else>
                <RouterLink
                  v-if="quiz.topic?._id"
                  :to="`/topics/${quiz.topic._id}`"
                  class="text-blue-500 hover:underline"
                >
                  {{ quiz.topic.title }}
                </RouterLink>
                <p v-else class="text-gray-500">No Topic</p>
                <h3 class="text-lg font-bold mb-2">
                  {{ quiz.question }}
                </h3>
                <ul class="mt-2 ml-4 list-disc">
                  <li v-for="option in quiz.options" :key="option._id">
                    {{ option.text }}
                  </li>
                </ul>
              </template>
            </div>
          </div>
        </div>
      </template>
    </DataView>

    <div v-if="!loading && !filteredQuizzes.length" class="mt-6 text-gray-500">
      No quizzes found.
    </div>
  </div>
</template>
