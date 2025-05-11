<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
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

const courseTopics = computed(() => {
  if (!course.value?.topics) return [];
  return course.value.topics
    .map((id) => topicStore.topics.find((t) => t._id === id))
    .filter((t): t is Topic => !!t);
});

onMounted(async () => {
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
});
</script>

<template>
  <div v-if="course" class="p-6 shadow rounded-md bg-gray-50 dark:bg-gray-800">
    <h1 class="text-2xl font-bold mb-4">{{ course.title }}</h1>
    <span class="flex gap-2 text-sm divide-y-1 md:divide-x-1 md:divide-y-0">
      <p class="mb-2 pr-3">
        <strong><i class="pi pi-thumbtack"></i></strong>
        {{ formatDate(course.createdAt) }}
      </p>
      <p class="mb-4 pl-2">
        <strong><i class="pi pi-history"></i></strong>
        {{ formatDate(course.updatedAt) }}
      </p>
    </span>
    <span class="flex flex-col md:flex-row gap-2 divide-y-1 md:divide-x-1 md:divide-y-0">
      <p class="mb-2 pr-3">
        <strong>Teacher:</strong>
        {{ teacher?.username || "Unknown" }}
      </p>
      
      <p class="mb-2 pr-3"><strong>Semester:</strong> {{ course.semester }}</p>
      
      <p class="mb-2"><strong>Scope:</strong> {{ course.scope }}</p>
    </span>
    <p class="mb-2">{{ course.description }}</p>
    <!-- Accordion for Learning Objectives, Skills, and Competencies -->
    <Accordion>
      <!-- Learning Objectives -->
      <AccordionPanel value="0">
        <AccordionHeader
          ><i class="pi pi-clipboard"></i> Learning Objectives</AccordionHeader
        >
        <AccordionContent>
          <ul class="list-disc ml-6">
            <li v-for="(objective, i) in course.learningObjectives" :key="i">
              {{ objective }}
            </li>
          </ul>
        </AccordionContent>
      </AccordionPanel>
      <!-- Skills -->
      <AccordionPanel value="1">
        <AccordionHeader><i class="pi pi-cog"></i> Skills</AccordionHeader>
        <AccordionContent>
          <ul class="list-disc ml-6">
            <li v-for="(skill, i) in course.skills" :key="i">{{ skill }}</li>
          </ul>
        </AccordionContent>
      </AccordionPanel>
      <!-- Competencies -->
      <AccordionPanel value="2">
        <AccordionHeader class="items-start">
          <i class="pi pi-trophy"></i>Competencies</AccordionHeader
        >
        <AccordionContent>
          <ul class="list-disc ml-6">
            <li v-for="(competency, i) in course.competencies" :key="i">
              {{ competency }}
            </li>
          </ul>
        </AccordionContent>
      </AccordionPanel>
    </Accordion>

    <div class=" my-6">
      <!-- DataView for Topics -->
      <h2 class="text-xl font-semibold mb-2">
        <i class="pi pi-th-large"></i> Topics
      </h2>
      <div v-for="topic in courseTopics" :key="topic?._id" class=" ">
        <TopicCard :topic="topic" class="" />
      </div>
    </div>

    <!-- <h2 class="text-xl font-semibold mb-2">
      <i class="pi pi-th-large"></i> Topics
    </h2>
    <ul>
      <li v-for="topic in courseTopics" :key="topic?._id">
        <router-link :to="`/topics/${topic._id}`" class="text-slate-500">
          <span class="hover:font-bold">
            {{ topic.title || "Untitled Topic" }}
          </span>
        </router-link>
      </li>
    </ul> -->
  </div>
</template>
