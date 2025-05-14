<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { useTopicStore } from "../../stores/topicStore";
import { useQuizStore } from "../../stores/quizStore";
import { format, addDays } from "date-fns";
import TopicCard from "./TopicCard.vue";

const topicStore = useTopicStore();
const { topics, loading, error } = topicStore;
const quizStore = useQuizStore();
const quizCounts = ref<Record<string, number>>({});

const props = defineProps<{
  week: number | null;
}>();
const selectedWeek = ref<number | null>(null);

const useCalendar = ref(false);
const calendarDate = ref<Date | null>(null);

watch(
  () => props.week,
  (newWeek) => {
    selectedWeek.value = newWeek;
  },
  { immediate: true }
);

const semesterStart = new Date("2025-01-06"); // Adjust as needed

const weekOptions = computed(() => {
  const weekSet = new Set(topics.map((t) => t.week).filter(Boolean));
  return [
    { label: "All Weeks", value: null },
    ...Array.from(weekSet)
      .sort((a, b) => a - b)
      .map((week) => {
        const start = addDays(semesterStart, (week - 1) * 7);
        const end = addDays(start, 6);
        return {
          label: `Week ${week} (${format(start, "MMM d")} – ${format(
            end,
            "MMM d"
          )})`,
          value: week,
        };
      }),
  ];
});

const weekFromCalendar = computed(() => {
  if (!calendarDate.value) return null;
  const diff = Math.floor(
    (calendarDate.value.getTime() - semesterStart.getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return Math.floor(diff / 7) + 1;
});

const filteredTopics = computed(() => {
  const week = useCalendar.value ? weekFromCalendar.value : selectedWeek.value;
  return week ? topics.filter((t) => t.week === week) : topics;
});

watch(topics, (newTopics) => {
  console.log("Updated topics:", newTopics);
});

onMounted(async () => {
  if (topics.length === 0) {
    await topicStore.fetchTopics();
  }

  const topicIds = topics.map((topic) => topic._id);
  quizCounts.value = await quizStore.fetchQuizCountForTopics(topicIds);
});
</script>

<template>
  <div class="mt-4 text-gray-600 h-full">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">Topics</h2>

    <div v-if="error" class="text-red-500 mt-4">{{ error }}</div>

    <div class="mb-4 flex items-center gap-4">
      <Button

        :icon="useCalendar ? 'pi pi-list' : 'pi pi-calendar'"
        @click="useCalendar = !useCalendar"
        
      />
      <Select
        v-if="!useCalendar"
        v-model="selectedWeek"
        :options="weekOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Filter by Week"
        class="w-60"
      />
      <DatePicker
        v-else
        v-model="calendarDate"
        dateFormat="dd-mm-yy"
        placeholder="Pick a date"
        class="w-60"
      />
    </div>

    <DataView
      :value="filteredTopics"
      layout="grid"
      dataKey="_id"
      paginator
      :rows="6"
    >
      <template #header>
        <div class="flex justify-between items-baseline">
          <h2 class="font-semibold">
            {{
              (useCalendar && weekFromCalendar) ||
              (!useCalendar && selectedWeek)
                ? `Week ${useCalendar ? weekFromCalendar : selectedWeek}`
                : "All Weeks"
            }}
          </h2>
          <Button
            icon="pi pi-filter-slash"
            label="Clear"
            rounded
            outlined
            @click="
              () => {
                selectedWeek = null;
                calendarDate = null;
              }
            "
          />
        </div>
      </template>
      <template #grid="slotProps">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 h-[calc(100vh-20rem)] overflow-auto">
          <template v-if="loading">
            <div v-for="n in 4" :key="'skeleton-' + n" class="space-y-2 p-4 border rounded shadow-sm">
              <Skeleton width="8rem" height="1.5rem" class="mb-2" />
              <Skeleton width="100%" height="1.5rem" class="mb-4" />
              <Skeleton width="60%" height="1rem" class="mb-2" />
              <Skeleton width="40%" height="1rem" class="mb-4" />
            </div>
          </template>
          <template v-else>
            <TopicCard
              v-for="topic in slotProps.items"
              :key="topic._id"
              :topic="topic"
              :quizCount="quizCounts[topic._id] || 0"
            />
          </template>
        </div>
      </template>
      <template #empty>
        <div class="text-center text-gray-500 py-4 italic">
          No topics found for this week.
        </div>
      </template>
    </DataView>
  </div>
</template>
