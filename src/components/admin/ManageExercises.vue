<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useExerciseStore } from "../../stores/exerciseStore";
import ManageExerciseForm from "./ManageExerciseForm.vue";
import type { Exercise } from "../../types/Exercise";
import { useAppToast } from "../../services/toastService";
import { useConfirm } from "primevue/useconfirm";
import CodingChallenge from "../../components/topics/CodeChallenge.vue";
const confirm = useConfirm();
const toast = useAppToast();

const exerciseStore = useExerciseStore();
const showForm = ref(false);
const selectedExercise = ref<Exercise | null>(null);

// Fetch exercises on mount
onMounted(() => {
  exerciseStore.fetchExercises();
});

const exerciseList = computed(() => exerciseStore.exercises);

const editExercise = (exercise: Exercise) => {
  selectedExercise.value = { ...exercise };
  showForm.value = true;
};

const handleExerciseUpdated = async () => {
  await exerciseStore.fetchExercises();
  showForm.value = false;
  selectedExercise.value = null;
  toast.success("Exercise updated successfully.");
};

// Delete exercise
const deleteExercise = async (event: MouseEvent, exercise: Exercise) => {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: `Are you sure you want to delete the exercise "${exercise.title}"?`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Yes",
    rejectLabel: "No",
    accept: async () => {
      await exerciseStore.deleteExercise(exercise._id);
      await exerciseStore.fetchExercises();
      toast.success("Exercise deleted successfully.");
    },
    reject: () => {
      // Do nothing on reject
    },
  });
};

const closeForm = () => {
  showForm.value = false;
  selectedExercise.value = null;
};
</script>

<template>
  <ConfirmPopup />
  <div>
    <h2 class="text-2xl font-bold mb-4">Manage Exercises</h2>

    <Button
      @click="showForm = true"
      label="New Exercise"
      icon="pi pi-plus"
      class="mb-4"
    />

    <DataTable
      paginator
      :rows="6"
      :value="exerciseList"
      dataKey="id"
      responsiveLayout="scroll"
    >
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Exercises</h2>
        </div>
      </template>
      <Column field="title" header="Title"></Column>
      <Column field="difficulty" header="Difficulty"></Column>
      <!-- Actions Column -->
      <Column header="Actions" class="space-x-2">
        <template #body="slotProps">
          <Button
            @click="editExercise(slotProps.data)"
            severity="info"
            icon="pi pi-pencil"
          />
          <Button
            @click="(e: MouseEvent) => deleteExercise(e, slotProps.data)"
            severity="danger"
            icon="pi pi-trash"
          />
        </template>
      </Column>
    </DataTable>

    <ManageExerciseForm
      v-model:visible="showForm"
      :exercise="selectedExercise"
      @updated="handleExerciseUpdated"
      @close="closeForm"
    />
  </div>
  <CodingChallenge/>
</template>
