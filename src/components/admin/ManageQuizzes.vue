<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useQuizStore } from "../../stores/quizStore";
import ManageQuizForm from "./ManageQuizForm.vue";
import type { Quiz, QuizOption } from "../../types/Quiz";
import Select from "primevue/select";
import { useTopicStore } from "../../stores/topicStore";
import type { Topic } from "../../types/Topic";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

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
const topicOptions = computed(() => {
  const courseMap = new Map<
    string,
    { label: string; items: { label: string; value: string }[] }
  >();

  topicStore.topics.forEach((t: Topic) => {
    const courseId = t.course?._id || "Unassigned";
    const courseTitle = t.course?.title || "Unassigned";

    if (!courseMap.has(courseId)) {
      courseMap.set(courseId, { label: courseTitle, items: [] });
    }

    courseMap.get(courseId)?.items.push({
      label: t.title,
      value: t._id,
    });
  });

  return Array.from(courseMap.values());
});

const confirm = useConfirm();
const toast = useToast();

const deleteQuiz = async (event: MouseEvent, quiz: Quiz) => {
  confirm.require({
    target: event.currentTarget as HTMLElement,
    message: `Are you sure you want to delete the quiz "${quiz.question}"?`,
    icon: "pi pi-exclamation-triangle",
    acceptLabel: "Yes",
    rejectLabel: "No",
    accept: async () => {
      await quizStore.deleteQuizById(quiz._id);
      await quizStore.fetchQuizzes();
      toast.add({
        severity: "success",
        summary: "Deleted",
        detail: "Quiz deleted successfully!",
        life: 3000,
      });
    },
    reject: () => {
      toast.add({
        severity: "info",
        summary: "Cancelled",
        detail: "Quiz deletion cancelled.",
        life: 2500,
      });
    },
  });
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
</script>

<template>
  <div class="p-2 rounded-md">
    <h2 class="text-2xl font-bold mb-4">Manage Quizzes</h2>

    <Button
      @click="showForm = true"
      class="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      label="New Quiz"
      icon="pi pi-plus"
    />

    <!-- Quiz Form -->
    <ManageQuizForm
      v-model:visible="showForm"
      :quiz="selectedQuiz"
      @quiz-updated="handleQuizUpdated"
      @close="closeForm"
    />
    <div class="rounded-lg overflow-hidden shadow border border-gray-200">
      <DataTable :value="quizList" paginator :rows="4" tableStyle="">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-2 w-full">
            <span class="text-xl font-bold">Quizzes</span>
            <Button
              icon="pi pi-filter-slash"
              aria-label="Clear Filters"
              rounded
              outlined
              raised
              @click="refreshQuizzes"
            />
          </div>
        </template>

        <!-- Question Column -->
        <Column field="question" header="Question" class="w-1/2"></Column>

        <!-- Topic Column -->
        <Column>
          <template #header>
            <Select
              v-model="selectedTopic"
              :options="topicOptions"
              optionGroupLabel="label"
              optionGroupChildren="items"
              optionLabel="label"
              optionValue="value"
              placeholder="Filter by Topic"
              clearable
              fluid
            />
          </template>
          <template #body="slotProps">
            {{ slotProps.data.topic?.title || "No Topic" }}
          </template>
        </Column>

        <!-- Actions Column -->
        <Column header="Actions" class="space-x-2">
          <template #body="slotProps">
            <Button
              @click="editQuiz(slotProps.data)"
              severity="info"
              icon="pi pi-pencil"
            />
            <Button
              @click="(event) => deleteQuiz(event, slotProps.data)"
              severity="danger"
              icon="pi pi-trash"
            />
          </template>
        </Column>

        <template #footer>
          In total, there are {{ quizList ? quizList.length : 0 }} quizzes.
        </template>
        <template #empty>
          <div class="p-4 text-center text-gray-500">
            No quizzes found for this topic.
          </div>
        </template>
      </DataTable>
    </div>
    <ConfirmPopup />
    <Toast />
  </div>
</template>
