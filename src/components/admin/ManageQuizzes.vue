<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useQuizStore } from "../../stores/quizStore";
import ManageQuizForm from "./ManageQuizForm.vue";
import type { Quiz, QuizOption } from "../../types/Quiz";
import Select from "primevue/select";
import { useTopicStore } from "../../stores/topicStore";
import type { Topic } from "../../types/Topic";

const quizStore = useQuizStore();
const { fetchQuizzesByTopic } = quizStore;
const topicStore = useTopicStore();
const showForm = ref(false);
const selectedQuiz = ref<Quiz | null>(null);
const successMessage = ref<string | null>(null);
const selectedTopic = ref<string | null>(null);

// Fetch quizzes on component mount
onMounted(() => {
  quizStore.fetchQuizzes();
  topicStore.fetchTopics();
});

// Computed property instead of watch() for better performance
//// - computed() automatically updates when quizStore.quizzes changes
//// - More efficient since it only recalculates when needed
const quizList = computed(() => quizStore.quizzes);
const refreshQuizzes = () => {
  quizStore.fetchQuizzes();
};
// Function to prepare quiz for editing
const prepareQuizForEdit = (quiz: Quiz) => ({
  ...quiz,
  options: quiz.options.map((opt: QuizOption, index: number) => ({
    _id: opt._id || "",
    text: opt.text || "",
    isCorrect: opt.isCorrect ?? false,
    order: opt.order ?? index + 1,
  })),
});
// Open edit mode
const editQuiz = (quiz: Quiz) => {
  selectedQuiz.value = prepareQuizForEdit(quiz);
  showForm.value = true;
};

// Handle quiz submission (refresh list after adding/editing)
//
const handleQuizUpdated = async () => {
  await quizStore.fetchQuizzes();
  successMessage.value = "✅ Quiz updated successfully!";
  showForm.value = false;
  selectedQuiz.value = null;

  setTimeout(() => {
    successMessage.value = null;
  }, 3000);
};

// Delete quiz
const deleteQuiz = async (quizId: string) => {
  if (confirm("Are you sure you want to delete this quiz?")) {
    await quizStore.deleteQuizById(quizId);
    await quizStore.fetchQuizzes();
    successMessage.value = "✅ Quiz deleted successfully!";

    setTimeout(() => {
      successMessage.value = null;
    }, 3000);
  }
};

// Reset form state
const closeForm = () => {
  selectedQuiz.value = null;
  showForm.value = false;
};

const fetchByTopic = async (topicId: string) => {
  await fetchQuizzesByTopic(topicId);
};

watch(selectedTopic, (newTopicId) => {
  if (newTopicId) fetchByTopic(newTopicId);
  else quizStore.fetchQuizzes(); // fallback to all
});

const topicOptions = computed(() =>
  topicStore.topics.map((t: Topic) => ({
    label: t.title,
    value: t._id,
  }))
);
</script>

<template>
  <!-- ✅ Success Message -->
  <div v-if="successMessage" class="bg-green-500 text-white p-3 rounded mb-4">
    {{ successMessage }}
  </div>
  <div class="p-4 shadow rounded-md">
    <h2 class="text-2xl font-bold mb-4">Manage Quizzes</h2>

    <Button
      @click="showForm = true"
      class="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      label="New Quiz"
      icon="pi pi-plus"
    />

    <!-- Quiz Form -->
    <ManageQuizForm
      v-if="showForm"
      :quiz="selectedQuiz"
      @quiz-updated="handleQuizUpdated"
      @close="closeForm"
    />
    <div class="rounded-lg overflow-hidden shadow border border-gray-200">
    <DataTable :value="quizList" tableStyle="" >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2 w-full ">
          <span class="text-xl font-bold">Quizzes</span>
          <Button icon="pi pi-refresh" rounded raised @click="refreshQuizzes" />
        </div>
      </template>

      <!-- Question Column -->
      <Column field="question" header="Question" class="w-1/2"></Column>

      <!-- Topic Column -->
      <Column>
        <template #header>
          <div class="flex flex-col">
            <Select
              v-model="selectedTopic"
              :options="topicOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Filter by Topic"
              class="w-full"
              clearable
            />
          </div>
        </template>
        <template #body="slotProps">
          {{ slotProps.data.topic?.title || "No Topic" }}
        </template>
      </Column>

      <!-- Actions Column -->
      <Column header="Actions">
        <template #body="slotProps">
          <Button
            @click="editQuiz(slotProps.data)"
            severity="info"
            icon="pi pi-pencil"
          />
          <Button
            @click="deleteQuiz(slotProps.data._id)"
            severity="danger"
            icon="pi pi-trash"
          />
        </template>
      </Column>

      <template #footer>
        In total, there are {{ quizList ? quizList.length : 0 }} quizzes.
      </template>
    </DataTable>
    </div>
  </div>
</template>
