<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useAppToast } from "../../services/toastService";
import draggable from "vuedraggable";
import { useAuthStore } from "../../stores/authStore";
import api from "../../services/api";
import type { Quiz, QuizOption } from "../../types/Quiz";
import type { Topic } from "../../types/Topic";

const authStore = useAuthStore();
const toast = useAppToast();
const emit = defineEmits(["close", "quizUpdated", "update:visible"]);

// Props for quiz editing
const props = defineProps<{ quiz?: Quiz | null; visible: boolean }>();

const visibleRef = ref(props.visible);

watch(
  () => props.visible,
  (val) => {
    visibleRef.value = val;
  }
);

const updateVisible = (val: boolean) => {
  emit("update:visible", val);
};

// Reactive form state
const topics = ref<Topic[]>([]);
const selectedTopic = ref<string>("");
const question = ref<string>("");
const options = ref<QuizOption[]>([]);
const successMessage = ref<string>("");
const errorMessage = ref<string>("");
const isEditing = computed(() => !!props.quiz?._id);

// Fetch topics from the API
onMounted(async () => {
  try {
    const { data } = await api.get("/topics");
    topics.value = data;
    // console.log("✅ Topics Loaded:", data);
  } catch (error) {
    // console.error("❌ Error Fetching Topics:", error);
    errorMessage.value = "Failed to load topics.";
  }
});

// Reset form
const resetForm = () => {
  selectedTopic.value = "";
  question.value = "";
  options.value = prepareOptions([]);
};

// Prepare options for the form
const prepareOptions = (opts: QuizOption[] = []) => {
  return (opts.length ? opts : Array(2).fill(null)).map((opt, index) => ({
    _id: opt?._id || "",
    text: opt?.text || "",
    isCorrect: opt?.isCorrect ?? false,
    order: opt?.order ?? index + 1,
  }));
};

// Watch for quiz changes & populate form when editing
watch(
  () => props.quiz,
  (newQuiz) => {
    if (newQuiz) {
      selectedTopic.value = newQuiz.topic?._id || "";
      question.value = newQuiz.question;
      options.value = prepareOptions(newQuiz.options);
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

// Add more options
const addOption = () => {
  options.value.push({
    _id: "",
    text: "",
    isCorrect: false,
    order: options.value.length + 1,
  });
};

// Remove an option (at least 2 required)
const removeOption = (index: number) => {
  if (options.value.length > 2) {
    options.value.splice(index, 1);
  }
};

// ✅ Function to validate the form
const validateForm = () => {
  const validations = [
    { condition: !selectedTopic.value, message: "Please select a topic." },
    { condition: !question.value.trim(), message: "Question cannot be empty." },
    {
      condition: options.value.length < 2,
      message: "At least two options are required.",
    },
    {
      condition: !options.value.some((opt) => opt.isCorrect),
      message: "At least one option must be marked as correct.",
    },
  ];

  return validations.find((v) => v.condition)?.message || null;
};
const submitQuiz = async () => {
  successMessage.value = "";
  errorMessage.value = "";

  const validationError = validateForm();
  if (validationError) {
    errorMessage.value = validationError;
    return;
  }

  const quizData = {
    topic: selectedTopic.value,
    question: question.value,
    options: options.value.map(({ text, isCorrect }) => ({ text, isCorrect })),
  };

  try {
    let response;
    if (isEditing.value && props.quiz?._id) {
      response = await api.put(`/quizzes/${props.quiz._id}`, quizData);
      toast.success("Quiz updated successfully!");
    } else {
      response = await api.post("/quizzes", quizData);
      toast.success("Quiz created successfully!");
    }

    emit("quizUpdated", response.data);
    resetForm();
  } catch (error) {
    toast.error("Failed to submit quiz.");
  }
};

// Close form
const closeForm = () => {
  resetForm();
  emit("close");
};
</script>

<template>
  <Dialog
    v-model:visible="visibleRef"
    @update:visible="updateVisible"
    modal
    :header="isEditing ? 'Edit Quiz' : 'Add New Quiz'"
    @hide="closeForm"
    :pt="{
      root: { class: '!border-0 !bg-transparent' },
      mask: { class: 'backdrop-blur-sm' },
    }"
    class="w-full"
    style="
      background-image: radial-gradient(
        circle at center center,
        var(--p-primary-400),
        var(--p-primary-300)
      );
    "
  >
    <!-- Access Restriction -->
    <div v-if="!authStore.isAdmin" class="text-red-500">
      ⛔ Access Denied. Only admins can manage quizzes.
    </div>

    <!-- Quiz Form -->
    <form
      v-else
      @submit.prevent="submitQuiz"
      class="py-2 space-y-4 shadow-md rounded-md"
    >
      <FloatLabel class="" variant="on">
        <Select
          v-model="selectedTopic"
          :options="topics"
          optionLabel="title"
          optionValue="_id"
          inputId="topic_select"
          fluid
        />
        <label for="topic_select">Select Topic</label>
      </FloatLabel>

      <FloatLabel variant="on">
        <InputText id="quiz_question" v-model="question" required fluid />
        <label for="quiz_question" class="block mb-2">Question</label>
      </FloatLabel>

      <draggable v-model="options" item-key="order">
        <template #item="{ element, index }">
          <div class="drag-item flex space-y-4 space-x-2 items-baseline w-full">
            <i class="pi pi-bars"></i>
            <div class="flex-grow">
              <FloatLabel variant="on">
                <InputText
                  id="option_text_{{ index }}"
                  v-model="element.text"
                  fluid
                  required
                />
                <label :for="`option_text_${index}`">Option {{ index }}</label>
              </FloatLabel>
            </div>

            <Checkbox
              v-model="element.isCorrect"
              :binary="true"
              inputId="correct_checkbox"
            />

            <Button
              type="button"
              @click="removeOption(index)"
              severity="danger"
              icon="pi pi-times"
            />
          </div>
        </template>
      </draggable>
      <Button
        type="button"
        label="Add Option"
        icon="pi pi-plus"
        @click="addOption"
        severity="secondary"
      />

      <div class="flex justify-end space-x-2">
        <Button
          type="button"
          label="Cancel"
          icon="pi pi-times"
          @click="closeForm"
          class="!p-2 w-full !text-gray-600 !bg-transparent !border !border-red-600/30 hover:!bg-red-700/10 hover:!text-gray-50"
        />
        <Button
          :label="isEditing ? 'Update' : 'Submit'"
          icon="pi pi-check"
          type="submit"
          text
          severity="success"
          class="!p-2 w-full !text-gray-600 !border !border-green-600/30 hover:!bg-green-700/10 hover:!text-gray-50"
        />
      </div>
    </form>
  </Dialog>
</template>
