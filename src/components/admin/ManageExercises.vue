<script setup lang="ts">
import {  ref, onMounted, computed } from 'vue';
import { useExerciseStore } from '../../stores/exerciseStore';
import ManageExerciseForm from './ManageExerciseForm.vue';
import type { Exercise } from '../../types/Exercise';
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";

const toast = useToast();
const confirm = useConfirm();

const exerciseStore = useExerciseStore();
const showForm = ref(false);
const selectedExercise = ref<Exercise | null>(null);
const successMessage = ref<string | null>(null);  

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

  setTimeout(() => {
    successMessage.value = null;
  }, 3000);
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
      toast.add({
        severity: "success",
        summary: "Deleted",
        detail: "Exercise deleted successfully!",
        life: 3000,
      });
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
  <div>
    <h2 class="text-2xl font-bold mb-4">Manage Topics</h2>

    <Toast />
    <ConfirmPopup />

    <Button
      @click="showForm = true"
      label="New Exercise"
      icon="pi pi-plus"
      class="mb-4"
    />

    <DataTable :value="exerciseList" dataKey="id" responsiveLayout="scroll">
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
</template>

