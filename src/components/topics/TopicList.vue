<script setup lang="ts">
import { ref, watch, computed, onMounted } from "vue";
import { useTopicStore } from "../../stores/topicStore";
import { format, addDays } from "date-fns";
import TopicCard from "./TopicCard.vue";

const topicStore = useTopicStore();
const { topics, loading, error } = topicStore;

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

onMounted(() => {
  if (topics.length === 0) {
    topicStore.fetchTopics();
  }
});
</script>

<template>
  <div class="mt-4 text-gray-600 h-full">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">Topics</h2>

    <div v-if="loading" class="text-blue-500 mt-4">Loading topics...</div>
    <div v-else-if="error" class="text-red-500 mt-4">{{ error }}</div>

    <div class="mb-4 flex items-center gap-4">
      <Button
        :label="useCalendar ? 'Dropdown' : 'Calendar'"
        :icon="useCalendar ? 'pi pi-list' : 'pi pi-calendar'"
        @click="useCalendar = !useCalendar"
        class="p-button-sm"
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

    <div class="mt-4">
      <h2 class="font-semibold mb-2">
        Topics for Week
        {{ useCalendar ? weekFromCalendar || "All" : selectedWeek || "All" }}
      </h2>
      <div class="space-y-4">
        <TopicCard
          v-for="topic in filteredTopics"
          :key="topic._id"
          :topic="topic"
        />
      </div>
    </div>
  </div>
</template>
