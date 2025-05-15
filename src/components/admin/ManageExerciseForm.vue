<script setup lang="ts">
import { ref, watch, onMounted, computed } from "vue";
import { useAppToast } from "../../services/toastService";

import { useExerciseStore } from "../../stores/exerciseStore";
import { useTopicStore } from "../../stores/topicStore";

import type { Exercise } from "../../types/Exercise";
import type { Topic } from "../../types/Topic";

const emit = defineEmits(["close", "exerciseUpdated", "update:visible"]);

const props = defineProps<{
  exercise?: Exercise | null;
  topic?: Topic | null;
  visible: boolean;
}>();

const toast = useAppToast();
const topicStore = useTopicStore();
const { fetchTopics } = topicStore;

const groupedTopics = computed(() => {
  const grouped = new Map();
  for (const topic of topicStore.topics) {
    const courseTitle = topic.course?.title ?? "Unassigned";
    if (!grouped.has(courseTitle)) {
      grouped.set(courseTitle, []);
    }
    grouped.get(courseTitle)?.push(topic);
  }
  return Array.from(grouped.entries()).map(([label, items]) => ({
    label,
    items,
  }));
});

const exerciseStore = useExerciseStore();
const { createExercise, updateExercise } = exerciseStore;

const title = ref("");
const description = ref("");
const difficulty = ref<"easy" | "medium" | "hard">("easy");
const selectedTopicId = ref<string | null>(null);
import type { ExerciseQuestion } from "../../types/Exercise";

const questions = ref<
  Array<{
    question: string;
    type: ExerciseQuestion["type"];
    options: Array<{ text: string; isCorrect: boolean }>;
    correctAnswer: string;
  }>
>([
  {
    question: "",
    type: "multiple-choice" as ExerciseQuestion["type"],
    options: [{ text: "", isCorrect: false }],
    correctAnswer: "",
  },
]);

const questionTypeOptions = [
  { label: "Multiple Choice", value: "multiple-choice" },
  { label: "Fill in the Blank", value: "fill-in-the-blank" },
  { label: "Coding", value: "coding" },
  { label: "Short Answer", value: "short-answer" },
];

const isEditing = ref(false);

const resetForm = () => {
  title.value = "";
  description.value = "";
  difficulty.value = "easy";
  selectedTopicId.value = null;
  questions.value = [
    {
      question: "",
      type: "multiple-choice" as ExerciseQuestion["type"],
      options: [{ text: "", isCorrect: false }],
      correctAnswer: "",
    },
  ];
};

watch(
  () => props.exercise,
  async (newExercise) => {
    if (!newExercise) {
      resetForm();
      isEditing.value = false;
      selectedTopicId.value = null;
    } else {
      isEditing.value = true;
      setExerciseFields(newExercise);
      await fetchTopics();
    }
  },
  { immediate: true }
);

watch(
  () => props.topic,
  async (newTopic) => {
    if (newTopic?._id) {
      await fetchTopics();
      selectedTopicId.value = newTopic._id;
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (!topicStore.topics.length) {
    fetchTopics();
  }
});

const addQuestion = () => {
  questions.value.push({
    question: "",
    type: "multiple-choice" as ExerciseQuestion["type"],
    options: [{ text: "", isCorrect: false }],
    correctAnswer: "",
  });
};

const removeQuestion = (index: number) => {
  if (questions.value.length > 1) {
    questions.value.splice(index, 1);
  }
};

const addOption = (qIndex: number) => {
  if (questions.value[qIndex].type === "multiple-choice") {
    questions.value[qIndex].options.push({ text: "", isCorrect: false });
  }
};

const removeOption = (qIndex: number, oIndex: number) => {
  if (
    questions.value[qIndex].type === "multiple-choice" &&
    questions.value[qIndex].options.length > 1
  ) {
    questions.value[qIndex].options.splice(oIndex, 1);
  }
};

/**
 * Builds the input object for exercise creation/updating.
 * Returns an object matching the backend schema, using 'topicId' instead of 'topic'.
 */
function buildExerciseInput(): {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  questions: Array<
    | {
        question: string;
        type: ExerciseQuestion["type"];
        options: Array<{ text: string; isCorrect: boolean }>;
      }
    | {
        question: string;
        type: ExerciseQuestion["type"];
        correctAnswer: string;
      }
  >;
} {
  return {
    title: title.value.trim(),
    description: description.value.trim(),
    difficulty: difficulty.value,
    topic: selectedTopicId.value ?? "",
    questions: questions.value.map((q) => {
      if (q.type === "multiple-choice") {
        return {
          question: q.question.trim(),
          type: q.type as ExerciseQuestion["type"],
          options: q.options.map((opt) => ({
            text: opt.text.trim(),
            isCorrect: !!opt.isCorrect,
          })),
        };
      } else {
        return {
          question: q.question.trim(),
          type: q.type as ExerciseQuestion["type"],
          correctAnswer: q.correctAnswer?.trim() || "",
        };
      }
    }),
  };
}

function isFormValid(): boolean {
  console.log("🟡 Validating Form");
  const basic = isBasicFieldsValid();
  const questionsValid = areQuestionsValid();
  console.log({ basic, questionsValid });
  return basic && questionsValid;
}

function isBasicFieldsValid(): boolean {
  console.log("🧪 Basic Fields:", {
    title: title.value,
    description: description.value,
    difficulty: difficulty.value,
    topic: selectedTopicId.value,
    questionCount: questions.value.length,
  });
  return (
    title.value.trim() !== "" &&
    description.value.trim() !== "" &&
    !!difficulty.value &&
    !!selectedTopicId.value &&
    questions.value.length > 0
  );
}

function areQuestionsValid(): boolean {
  console.log("🧪 Validating Questions:", questions.value);
  for (const q of questions.value) {
    if (!q.question.trim()) {
      return false;
    }

    if (q.type === "multiple-choice") {
      if (!q.options.length) {
        console.log("❌ No options");
        return false;
      }
      if (q.options.some((opt) => !opt.text.trim())) {
        console.log("❌ Option text missing");
        return false;
      }
      if (!q.options.some((opt) => opt.isCorrect)) {
        console.log("❌ No correct option marked");
        return false;
      }
    } else {
      if (!q.correctAnswer?.trim()) {
        console.log("❌ Missing correct answer");
        return false;
      }
    }
  }
  return true;
}

const submitExercise = async () => {
  const input = buildExerciseInput();
  if (!isFormValid()) {
    toast.error(
      "Please fill in all required fields and ensure at least one question is valid."
    );
    return;
  }

  try {
    let updatedExercise;
    if (isEditing.value && props.exercise && props.exercise._id) {
      // Pass input with topicId, not topic
      updatedExercise = await updateExercise(props.exercise._id, input);
      toast.success("Exercise updated successfully.");
    } else {
      // Pass input with topicId, not topic
      updatedExercise = await createExercise(input);
      toast.success("Exercise created successfully.");
    }
    emit("exerciseUpdated", updatedExercise);
    emit("update:visible", false);
    resetForm();
    isEditing.value = false;
  } catch (error) {
    toast.error("Failed to save exercise.");
  }
};

const closeForm = () => {
  emit("update:visible", false);
  resetForm();
};

function setExerciseFields(newExercise: Exercise) {
  title.value = newExercise.title || "";
  description.value = newExercise.description || "";
  difficulty.value = newExercise.difficulty || "easy";
  selectedTopicId.value = newExercise.topic || null;
  questions.value = newExercise.questions.map((q) => {
    if (q.type === "multiple-choice") {
      return {
        question: q.question,
        type: q.type as ExerciseQuestion["type"],
        options: q.options?.map((opt) => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
        })) || [{ text: "", isCorrect: false }],
        correctAnswer: "",
      };
    } else {
      return {
        question: q.question,
        type: q.type as ExerciseQuestion["type"],
        options: [{ text: "", isCorrect: false }],
        correctAnswer: q.correctAnswer || "",
      };
    }
  });
}
</script>
<template>
  <Dialog
    :visible="props.visible"
    @update:visible="emit('update:visible', $event)"
    modal
    :closable="true"
    :header="isEditing ? 'Edit Exercise' : 'Add Exercise'"
    :style="{ width: '650px', maxWidth: '95vw' }"
    class="overflow-auto"
  >
    <template #container="{ closeCallback }">
      <div
        class="flex flex-col p-4 md:p-8 gap-4 rounde-md"
        style="
          background-image: radial-gradient(
            circle at center center,
            var(--p-primary-300),
            var(--p-primary-200)
          );
        "
      >
        <h2 class="text-2xl font-bold">
          <i class="pi pi-thumbtack text-2xl mr-2"></i>
          {{ isEditing ? "Edit Exercise" : "Add Exercise" }}
        </h2>

        <form
          @submit.prevent="submitExercise"
          class="flex flex-col space-y-4 gap-5"
        >
          <div class="flex flex-col gap-4">
            <FloatLabel>
              <InputText
                id="exercise-title"
                v-model="title"
                class="w-full"
                required
                autofocus
              />
              <label for="exercise-title">Title</label>
            </FloatLabel>
            <FloatLabel>
              <InputText
                id="exercise-description"
                v-model="description"
                class="w-full"
                required
              />
              <label for="exercise-description">Description</label>
            </FloatLabel>
            <div class="flex gap-3">
              <FloatLabel class="flex-1">
                <Select
                  id="exercise-difficulty"
                  v-model="difficulty"
                  :options="[
                    { label: 'Easy', value: 'easy' },
                    { label: 'Medium', value: 'medium' },
                    { label: 'Hard', value: 'hard' },
                  ]"
                  option-label="label"
                  option-value="value"
                  placeholder="Select Difficulty"
                  class="w-full"
                  required
                />
              </FloatLabel>
              <FloatLabel class="flex-1">
                <Select
                  id="exercise-topic"
                  v-model="selectedTopicId"
                  :options="groupedTopics"
                  option-group-label="label"
                  option-group-children="items"
                  option-label="title"
                  option-value="_id"
                  placeholder="Select Topic"
                  class="w-full"
                  required
                  filter
                />
              </FloatLabel>
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-lg font-semibold">Questions</h3>
              <Button
                icon="pi pi-plus"
                text
                type="button"
                class="p-button-sm"
                @click="addQuestion"
                aria-label="Add Question"
              />
            </div>
            <div class="flex flex-col gap-5">
              <div
                v-for="(q, qIndex) in questions"
                :key="qIndex"
                class="rounded-md border border-gray-200 dark:border-gray-700 p-4 relative bg-surface-50 dark:bg-surface-900"
              >
                <div class="flex items-center gap-3 mb-2">
                  <span class="font-semibold">Question {{ qIndex + 1 }}</span>
                  <Button
                    icon="pi pi-trash"
                    text
                    severity="danger"
                    type="button"
                    class="p-button-sm ml-auto"
                    @click="removeQuestion(qIndex)"
                    v-if="questions.length > 1"
                    aria-label="Remove Question"
                  />
                </div>
                <FloatLabel>
                  <InputText
                    :id="`question-${qIndex}`"
                    v-model="q.question"
                    class="w-full"
                    required
                    placeholder="Question"
                  />
                </FloatLabel>
                <div class="flex gap-3 mt-2">
                  <FloatLabel class="flex-1">
                    <Select
                      :id="`type-${qIndex}`"
                      v-model="q.type"
                      :options="questionTypeOptions"
                      option-label="label"
                      option-value="value"
                      class="w-full"
                      required
                    />
                  </FloatLabel>
                </div>
                <div
                  v-if="q.type === 'multiple-choice'"
                  class="mt-3 flex flex-col gap-3"
                >
                  <div
                    v-for="(opt, oIndex) in q.options"
                    :key="oIndex"
                    class="flex items-center gap-2"
                  >
                    <FloatLabel class="flex-1">
                      <InputText
                        :id="`option-${qIndex}-${oIndex}`"
                        v-model="opt.text"
                        required
                        class="w-full"
                        :placeholder="`Option ${oIndex + 1}`"
                      />
                    </FloatLabel>
                    <div class="flex items-center gap-1">
                      <Checkbox
                        v-model="opt.isCorrect"
                        :binary="true"
                        :input-id="`correct-${qIndex}-${oIndex}`"
                      />
                      <label
                        :for="`correct-${qIndex}-${oIndex}`"
                        class="ml-1 text-xs"
                        >Correct</label
                      >
                    </div>
                    <Button
                      icon="pi pi-trash"
                      text
                      severity="danger"
                      type="button"
                      class="p-button-sm"
                      @click="removeOption(qIndex, oIndex)"
                      v-if="q.options.length > 1"
                      aria-label="Remove Option"
                    />
                  </div>
                  <Button
                    icon="pi pi-plus"
                    text
                    type="button"
                    class="p-button-sm"
                    label="Add Option"
                    @click="addOption(qIndex)"
                    aria-label="Add Option"
                  />
                </div>
                <div v-else class="mt-3">
                  <FloatLabel>
                    <InputText
                      :id="`answer-${qIndex}`"
                      v-model="q.correctAnswer"
                      class="w-full"
                      required
                    />
                    <label :for="`answer-${qIndex}`">Correct Answer</label>
                  </FloatLabel>
                </div>
              </div>
            </div>
          </div>
          <div class="button-group flex items-center gap-4">
            <Button
              type="button"
              label="Cancel"
              icon="pi pi-times"
              @click="
                closeCallback;
                closeForm();
              "
              class="!p-2 w-full !text-gray-600 !bg-transparent !border !border-red-600/30 hover:!bg-red-700/10 hover:!text-gray-50"
            />
            <Button
              :label="isEditing ? 'Update' : 'Submit'"
              icon="pi pi-check"
              type="submit"
              class="!p-2 w-full !text-gray-600 !bg-transparent !border !border-green-600/30 hover:!bg-green-700/10 hover:!text-gray-50"
            />
          </div>
        </form>
      </div>
    </template>
  </Dialog>
</template>
