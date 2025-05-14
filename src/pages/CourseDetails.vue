<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { formatDate } from "../utils/formatDate";
import { getCourseById } from "../services/courseService";
import { getUserById } from "../services/userService";
import { useTopicStore } from "../stores/topicStore";
import type { Course } from "../types/Course";
import type { Topic } from "../types/Topic";
import type { User } from "../types/User";
import TopicCard from "../components/topics/TopicCard.vue";

const route = useRoute();
const topicStore = useTopicStore();
const course = ref<(Course & { topics: string[] }) | null>(null);
const teacher = ref<User | null>(null);

const quizCounts = ref<Record<string, number>>({});
const courseTopics = computed(() => {
  if (!course.value?.topics) return [];
  return course.value.topics
    .map((id) => topicStore.topics.find((t) => t._id === id))
    .filter((t): t is Topic => !!t);
});

onMounted(() => {
  loadCourse();
});

watch(
  () => route.params.id,
  () => {
    loadCourse();
  }
);

async function loadCourse() {
  const id = route.params.id as string;
  const fetchedCourse = await getCourseById(id);
  course.value = fetchedCourse as Course & { topics: string[] };
  await topicStore.fetchTopics();
  if (course.value?.teacher) {
    try {
      teacher.value = await getUserById(course.value.teacher);
    } catch (err) {
      console.error("Could not load teacher info:", err);
    }
  }
}
</script>

<template>
  <div v-if="course" class="p-4 bg-gray-50 dark:bg-gray-800">
    <h1 class="text-2xl font-bold mb-4">{{ course.title }}</h1>
    <span class="flex gap-2 text-sm divide-x-1 divide-gray-300 dark:divide-gray-500 md:divide-x-1 md:divide-y-0">
      <p class="mb-2 pr-3">
        <strong><i class="pi pi-thumbtack"></i></strong>
        {{ formatDate(course.createdAt) }}
      </p>
      <p class="mb-4 pl-2">
        <strong><i class="pi pi-history"></i></strong>
        {{ formatDate(course.updatedAt) }}
      </p>
    </span>
    <span
      class="flex flex-col md:flex-row gap-2 divide-y-1 divide-gray-300 dark:divide-gray-500 md:divide-x-1 md:divide-y-0"
    >
      <p class="mb-2 pr-3">
        <strong>Teacher:</strong>
        {{ teacher?.username || "Unknown" }}
      </p>

      <p class="mb-2 pr-3"><strong>Semester:</strong> {{ course.semester }}</p>

      <p class="mb-2"><strong>Scope:</strong> {{ course.scope }}</p>
    </span>
    <p class="mb-2">{{ course.description }}</p>

    <DataView
      :value="courseTopics"
      paginator
      :rows="4"
      layout="grid"
      dataKey="_id"
      class="my-6"
    >
      <template #header>
        <h2 class="text-xl font-semibold mb-2">
          <span class="font-bold">
            {{ courseTopics.length }}
          </span>
          Topics
        </h2>
      </template>
      <template #grid="slotProps">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TopicCard
            v-for="topic in slotProps.items"
            :key="topic._id"
            :quizCount="quizCounts[topic._id] || 0"
            :topic="topic"
          />
        </div>
      </template>
      <template #empty>
        <p class="text-gray-500 italic">No topics found for this course.</p>
      </template>
    </DataView>
    <!-- Accordion for Learning Objectives, Skills, and Competencies -->
    <Accordion class="" multiple>
      <!-- Learning Objectives -->
      <AccordionPanel value="0">
        <AccordionHeader>
          <p><i class="pr-2 pi pi-clipboard"></i> Learning Objectives</p>
        </AccordionHeader>
        <AccordionContent>
          <ul class="">
            <li v-for="(objective, i) in course.learningObjectives" :key="i">
              <i class="pi pi-caret-right text-gray-300"> </i> {{ objective }}
            </li>
          </ul>
        </AccordionContent>
      </AccordionPanel>
      <!-- Skills -->
      <AccordionPanel value="1">
        <AccordionHeader>
          <p><i class="pr-2 pi pi-cog"></i> Skills</p>
        </AccordionHeader>
        <AccordionContent>
          <ul class="">
            <li v-for="(skill, i) in course.skills" :key="i">
              <i class="pi pi-caret-right text-gray-300"> </i> {{ skill }}
            </li>
          </ul>
        </AccordionContent>
      </AccordionPanel>
      <!-- Competencies -->
      <AccordionPanel value="2">
        <AccordionHeader class="items-start">
          <p><i class="pr-2 pi pi-trophy"></i>Competencies</p>
        </AccordionHeader>
        <AccordionContent>
          <ul class="">
            <li v-for="(competency, i) in course.competencies" :key="i">
              <i class="pi pi-caret-right text-gray-300"> </i> {{ competency }}
            </li>
          </ul>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>
  </div>
</template>
