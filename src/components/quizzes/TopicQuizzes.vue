<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { storeToRefs } from "pinia";
import { useProgressStore } from "../../stores/progressStore";
import { useQuizStore } from "../../stores/quizStore";
import { getTopicById } from "../../services/topicService";
import { useAuthStore } from "../../stores/authStore";
import type { QuizOption } from "../../types/Quiz";

const props = defineProps<{
  visible: boolean;
  topicId: string;
  courseId: string;
}>();

const emit = defineEmits(["update:visible"]);

const quizStore = useQuizStore();
const { quizzes } = storeToRefs(quizStore);
const { fetchQuizzesByTopic, submitAllQuizzes } = quizStore;
const authStore = useAuthStore();
const progressStore = useProgressStore();

const topicTitle = ref("Topic Quizzes");
const selectedOptions = ref<Record<string, number | undefined>>({});
const results = ref<Record<string, { isCorrect: boolean }>>({});
const currentQuizIndex = ref(0);
const submitted = ref(false);

const isLastQuiz = computed(
  () => currentQuizIndex.value === quizzes.value.length - 1
);
const currentQuiz = computed(() => quizzes.value[currentQuizIndex.value]);

onMounted(async () => {
  if (!authStore.user && authStore.token) {
    await authStore.fetchCurrentUser();
  }

  await fetchQuizzesByTopic(props.topicId);

  quizzes.value.forEach((q) => (selectedOptions.value[q._id] = undefined));

  try {
    const topic = await getTopicById(props.topicId);
    topicTitle.value = topic.title;
  } catch (error) {
    console.error("❌ Failed to fetch topic title:", error);
  }
});

watch(
  () => quizzes.value,
  (newQuizzes) => {
    newQuizzes.forEach((q) => {
      if (!(q._id in selectedOptions.value)) {
        selectedOptions.value[q._id] = undefined;
      }
    });
  },
  { immediate: true }
);

const closeDialog = (value: boolean) => {
  emit("update:visible", value);
  if (value === false && authStore.user) {
    progressStore.fetchProgress(authStore.user._id);
  }
};

const nextQuiz = () => {
  const quiz = currentQuiz.value;
  const selected = selectedOptions.value[quiz._id];

  if (selected == null) return;

  if (!isLastQuiz.value) {
    currentQuizIndex.value++;
  }
};

const submitAll = async () => {
  if (!authStore.user) return;

  if (hasUnansweredQuestions()) {
    alert("❗ Please answer all questions before submitting.");
    return;
  }

  await submitQuizzesAndHandleProgress();
};

const hasUnansweredQuestions = () => {
  return quizzes.value.some((q) => selectedOptions.value[q._id] == null);
};

const submitQuizzesAndHandleProgress = async () => {
  const { allCorrect, results: quizResults } = await submitAllQuizzes(
    quizzes.value,
    selectedOptions.value,
    authStore.user!._id,
    props.courseId,
    props.topicId
  );

  results.value = quizResults;
  submitted.value = true;

  await progressStore.fetchProgress(authStore.user!._id);
  await logProgressIfNeeded(allCorrect);
};

const logProgressIfNeeded = async (allCorrect: boolean) => {
  if (!allCorrect) {
    console.log("🚫 Some answers incorrect, progress not logged");
    return;
  }

  await progressStore.logProgress({
    user: authStore.user!._id,
    course: props.courseId,
    topic: props.topicId,
    activityType: "quiz",
    activityTable: "quizzes",
    activityId: props.topicId,
    isCorrect: true,
  });
  console.log("🏁 Topic completed and progress logged");
};

const retakeQuiz = () => {
  submitted.value = false;
  currentQuizIndex.value = 0;
  results.value = {};
  quizzes.value.forEach((q) => (selectedOptions.value[q._id] = undefined));
};
</script>

<template>
  <Dialog
    :visible="props.visible"
    modal
    :header="topicTitle"

    class="w-full md:w-1/3 "
    :dismissable-mask="true"
    :closable="true"
    @update:visible="closeDialog"
  >
    <div class="">
      <div v-if="quizzes.length === 0">No quizzes found for this topic.</div>

      <div v-else-if="!submitted">
        <Card v-if="currentQuiz">
          <template #title> {{ currentQuiz.question }}</template>
          <template #content>
            <div
              v-for="option in currentQuiz.options"
              :key="option.order"
              class=""
            >
              <RadioButton
                :inputId="`${currentQuiz._id}-${option.order}`"
                :name="currentQuiz._id"
                :value="option.order"
                v-model="selectedOptions[currentQuiz._id]"
              />
              <label :for="`${currentQuiz._id}-${option.order}`" class="ml-2">
                {{ option.text }}
              </label>
            </div>

            <Button
              class="mt-8"
              :label="isLastQuiz ? 'Submit All' : 'Next'"
              @click="isLastQuiz ? submitAll() : nextQuiz()"
              fluid
            />
          </template>
        </Card>
      </div>

      <div v-else>
        <h2 class="text-2xl mb-4">Results</h2>

        <div v-for="quiz in quizzes" :key="quiz._id" class="mb-4">
          <Card>
            <template #title>{{ quiz.question }}</template>
            <template #content>
              <p>
                Your Answer:
                <strong>
                  {{
                    quiz.options.find(
                      (o: QuizOption) => o.order === selectedOptions[quiz._id]
                    )?.text || "Not answered"
                  }}
                </strong>
              </p>
              <p class="mt-2">
                Result:
                <span v-if="results[quiz._id]?.isCorrect" class="text-green-600"
                  >✅ Correct</span
                >
                <span v-else class="text-red-600">❌ Incorrect</span>
              </p>
            </template>
          </Card>
        </div>
        <div
          class="flex justify-center mt-6"
          v-if="Object.values(results).some((r) => !r.isCorrect)"
        >
          <Button
            label="🔄 Retake Quiz"
            severity="warning"
            @click="retakeQuiz"
          />
        </div>
      </div>
    </div>
  </Dialog>
</template>
