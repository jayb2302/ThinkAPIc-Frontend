<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useExerciseStore } from "../../stores/exerciseStore";
import ExerciseAttempt from "../users/ExerciseAttempt.vue";
import type { Exercise } from "../../types/Exercise";
import Badge from "primevue/badge";

const { topicId, visible, courseId } = defineProps<{
  visible: boolean;
  topicId: string;
  courseId: string;
}>();

const emit = defineEmits(["update:visible"]);

const exerciseStore = useExerciseStore();
const exercises = ref<Exercise[]>([]);
const selectedExercise = ref<Exercise | null>(null);
const showAttemptDialog = ref(false);

onMounted(async () => {
  await exerciseStore.fetchExercisesByTopic(topicId);
  exercises.value = exerciseStore.exercises;
});

const openAttempt = (exercise: Exercise) => {
  selectedExercise.value = exercise;
  showAttemptDialog.value = true;
};

const getSeverity = (difficulty: string) => {
  switch (difficulty) {
    case "easy":
      return "success";
    case "medium":
      return "warning";
    case "hard":
      return "danger";
    default:
      return null;
  }
};
</script>

<Badge />

<template>
  <Dialog
    :visible="visible"
    modal
    header="Topic Exercises"
    :style="{ width: '60vw' }"
    :dismissable-mask="true"
    :closable="true"
    style="
      background-image: radial-gradient(
        circle at center center,
        var(--p-primary-300),
        var(--p-primary-200)
      );
    "
    @update:visible="(val) => emit('update:visible', val)"
    :pt="{
      root: { class: '!border-0 !bg-transparent' },
      mask: { class: 'backdrop-blur-sm' },
    }"
  >
    <div v-for="ex in exercises" :key="ex._id" class="card">
      <Badge :value="ex.difficulty" :severity="getSeverity(ex.difficulty)" />
      <h2 class="flex items-center gap-2">
        {{ ex.title }}
      </h2>
      <Button label="Start" @click="openAttempt(ex)" />
    </div>

    <ExerciseAttempt
      v-if="selectedExercise"
      :exercise="selectedExercise"
      :course-id="courseId"
      @close="showAttemptDialog = false"
      v-model:visible="showAttemptDialog"
    />
  </Dialog>
</template>
